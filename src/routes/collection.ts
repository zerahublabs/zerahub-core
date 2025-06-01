import { PrismaClient, type User } from "@/generated/prisma";
import { authMiddleware } from "@/middlewares/auth";
import { zodValidator } from "@/middlewares/validator";
import { Hono } from "hono";
import { z } from "zod";
import Storage from "@/services/storage";

const prisma = new PrismaClient();
const storage = new Storage(prisma);

const createCollectionSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    price: z.string().transform(Number),
});

type Variables = {
    user: User;
    validated: z.infer<typeof createCollectionSchema>;
};

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

app.get("/", async (c) => {
    const page = Number(c.req.query("page") || 1);
    const limit = Number(c.req.query("limit") || 10);
    const skip = (page - 1) * limit;

    const collections = await prisma.collection.findMany({
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: {
                select: {
                    id: true,
                    address: true,
                },
            },
        },
    });
    const data = collections.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        cover: d.cover,
        createdAt: d.createdAt,
        publisher: d.user.address,
    }));

    return c.json({
        status: "ok",
        page: page,
        total: collections.length,
        data: data,
    });
});

app.post("/", zodValidator(createCollectionSchema, "json"), async (c) => {
    const validatedData = c.get("validated");

    const collection = await prisma.collection.create({
        data: {
            title: validatedData.title,
            description: validatedData.description,
            price: validatedData.price,
            user: {
                connect: {
                    address: c.get("user").address,
                },
            },
        },
    });

    return c.json({
        status: "ok",
        data: collection,
    });
});

app.post("/:collectionId/cover", async (c) => {
    try {
        const collectionId = c.req.param("collectionId");

        // Verify collection exists and belongs to user
        const collection = await prisma.collection.findFirst({
            where: {
                id: collectionId,
                user: {
                    address: c.get("user").address,
                },
            },
        });

        if (!collection) {
            return c.json(
                {
                    status: "fail",
                    message: "Collection not found or access denied",
                },
                404
            );
        }

        const formData = await c.req.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return c.json(
                {
                    status: "fail",
                    message: "No file uploaded",
                },
                400
            );
        }

        // Upload file to storage
        const storedFile = await storage.uploadFile(
            file,
            `collections/${collectionId}/cover`
        );

        return c.json({
            status: "ok",
            data: {
                storage: storedFile,
            },
        });
    } catch (err) {
        console.error(err);
        return c.json(
            {
                status: "fail",
                message: "Failed to upload cover",
            },
            500
        );
    }
});

export default app;

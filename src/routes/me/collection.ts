import { PrismaClient, type User } from "@/generated/prisma";
import { authMiddleware } from "@/middlewares/auth";
import { zodValidator } from "@/middlewares/validator";
import Storage from "@/services/storage";
import { Hono } from "hono";
import { z } from "zod";

const createCollectionSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    price: z.number().int().min(0).default(0).transform(Number),
});

type Variables = {
    user: User;
    validated: z.infer<typeof createCollectionSchema>;
};

const prisma = new PrismaClient();
const storage = new Storage(prisma);
const app = new Hono<{ Variables: Variables}>();

app.use(authMiddleware);

app.get("/", async (c) => {
    const page = Number(c.req.query("page") || 1);
    const limit = Number(c.req.query("limit") || 10);
    const skip = (page - 1) * limit;
    const user = c.get("user");

    const collections = await prisma.collection.findMany({
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
        where: {
            user: {
                address: user.address,
            },
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

    return c.json({
        status: "ok",
        data: collections,
    });
});


app.post("/", zodValidator(createCollectionSchema, "json"), async (c) => {
    const validatedData = c.get("validated");

    const collection = await prisma.collection.create({
        data: {
            title: validatedData.title,
            description: validatedData.description,
            price: Number(validatedData.price),
            user: {
                connect: {
                    address: c.get("user").address,
                },
            },
        },
    });

    const responseData = {
        ...collection,
        price: Number(collection.price),
    };

    return c.json({
        status: "ok",
        data: responseData,
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

        await prisma.collection.update({
            where: {
                id: collection.id,
            },
            data: {
                coverStorage: {
                    connect: {
                        id: storedFile.id,
                    },
                },
            },
        });

        return c.json({
            status: "ok",
            data: {
                id: storedFile.id,
                filename: storedFile.filename,
                createdAt: storedFile.createdAt,
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

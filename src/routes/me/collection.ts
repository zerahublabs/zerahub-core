import { PrismaClient, type User } from "@/generated/prisma";
import { authMiddleware } from "@/middlewares/auth";
import Storage from "@/services/storage";
import { Hono } from "hono";
import { z } from "zod";

const createCollectionSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
});

const uploadCollectionSchema = z.object({
    key: z.string().min(1),
    type: z.string().min(1),
    size: z.number().int().nonnegative().transform(Number),
});

const confirmUploadCollectionSchema = z.object({
    requestId: z.string().min(1),
});

const updateCoverCollectionSchema = z.object({
    storageId: z.string().min(0),
});

type Variables = {
    user: User;
};

const prisma = new PrismaClient();
const storage = new Storage();
const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);
app.use("/:collectionId/*", async (c, next) => {
    const collectionId = c.req.param("collectionId");

    const collection = prisma.collection.findFirst({
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
                message: "collection not found",
            },
            404
        );
    }
    await next();
    return;
});

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
            coverStorage: {
                select: {
                    id: true,
                    createdAt: true,
                },
            },
            user: {
                select: {
                    id: true,
                    address: true,
                },
            },
        },
    });

    const collectionData = collections.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        cover: d.coverStorage,
        createdAt: d.createdAt,
        transactionHash: d.transactionHash,
        status: d.status,
        publisher: d.user.address,
    }));

    return c.json({
        status: "ok",
        data: collectionData,
    });
});

app.post("/", async (c) => {
    const validatedData = createCollectionSchema.parse(await c.req.json());

    const collection = await prisma.collection.create({
        data: {
            title: validatedData.title,
            description: validatedData.description,
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

app.put("/:collectionId", async (c) => {
    try {
        const collectionId = c.req.param("collectionId");
        const validatedData = createCollectionSchema.parse(await c.req.json());

        const collection = await prisma.collection.findFirst({
            where: {
                id: collectionId,
                user: {
                    address: c.get("user").address,
                },
            },
            select: { id: true },
        });
        if (!collection) {
            return c.json(
                {
                    status: "fail",
                    message: "collection not found",
                },
                404
            );
        }

        const newCollection = await prisma.collection.update({
            data: {
                title: validatedData.title,
                description: validatedData.description
            },
            where: {
                id: collectionId,
                user: {
                    address: c.get("user").address,
                },
            },
        });

        return c.json({
            status: "ok",
            data: newCollection,
        });
    } catch (error) {
        console.error(error);

        return c.json({
            status: "fail",
            message: "failed",
        });
    }
});

app.post("/:collectionId/request-upload", async (c) => {
    try {
        const validatedData = uploadCollectionSchema.parse(await c.req.json());

        const { signedUrl, key } = await storage.createPreSignedUrl(
            validatedData.type,
            "zerahub-storages"
        );

        const responseData = await prisma.storageUploadRequest.create({
            data: {
                type: validatedData.type,
                size: validatedData.size,
                expiresAt: new Date(new Date().getTime() + 3600),
                url: signedUrl,
                key: key,
                user: {
                    connect: {
                        address: c.get("user").address,
                    },
                },
            },
        });
        return c.json({
            status: "ok",
            data: responseData,
        });
    } catch (error) {
        return c.json({
            status: "fail",
            message: "failed to prepare upload",
        });
    }
});

app.post("/:collectionId/confirm-upload", async (c) => {
    try {
        const validatedData = confirmUploadCollectionSchema.parse(
            await c.req.json()
        );

        const storageRequestData = await prisma.storageUploadRequest.findFirst({
            where: {
                id: validatedData.requestId,
                user: {
                    address: c.get("user").address,
                },
            },
        });

        if (!storageRequestData) {
            return c.json({
                status: "fail",
                message: "no storage request found or access denied",
            });
        }

        await prisma.storageUploadRequest.update({
            where: {
                id: validatedData.requestId,
                user: {
                    address: c.get("user").address,
                },
            },
            data: {
                used: true,
            },
        });
        const storageData = await prisma.storage.create({
            data: {
                key: storageRequestData.key,
            },
        });

        return c.json({
            status: "ok",
            data: storageData,
        });
    } catch (error) {
        return c.json({
            status: "fail",
            message: "failed to confirm upload",
        });
    }
});

app.put("/:collectionId/cover", async (c) => {
    try {
        const collectionId = c.req.param("collectionId");

        const validatedData = updateCoverCollectionSchema.parse(
            await c.req.json()
        );
        const storageData = await prisma.storage.findFirst({
            where: {
                id: validatedData.storageId,
            },
        });

        if (!storageData) {
            return c.json({
                status: "fail",
                message: "storage not found",
            });
        }
        const collectionData = await prisma.collection.update({
            where: {
                id: collectionId,
            },
            data: {
                coverStorage: {
                    connect: {
                        id: storageData.id,
                    },
                },
            },
        });

        return c.json({
            status: "ok",
            data: collectionData,
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

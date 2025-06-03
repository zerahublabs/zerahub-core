import { Hono } from "hono";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";
import { authMiddleware } from "@/middlewares/auth";
// import { sign } from "hono/jwt";
import { errorMiddleware } from "@/middlewares/error";
import { zodValidator } from "@/middlewares/validator";
import Storage from "@/services/storage";

const prisma = new PrismaClient();
const app = new Hono();
const storage = new Storage(prisma);

app.use(authMiddleware);
app.onError(errorMiddleware);

const MAX_BYTES = 1024 * 1024; // 1 MB

class Writer {
    private static activeWriters = new Map<
        string,
        ReturnType<typeof storage.prepareUploadLargeFile>
    >();
    private static filenames = new Map<string, string>();
    private static writerTimers = new Map<string, NodeJS.Timeout>();

    private static setWriterExpiry(collectionId: string, ms: number) {
        clearTimeout(Writer.writerTimers.get(collectionId));
        const timer = setTimeout(async () => {
            await this.killWriter(collectionId);
        }, ms);
        Writer.writerTimers.set(collectionId, timer);
    }

    public static flushWritter(collectionId: string) {
        const timer = Writer.writerTimers.get(collectionId);
        // console.log({timer});
        if (timer) {
            clearTimeout(timer);
        }

        const writer = Writer.activeWriters.get(collectionId);
        if (writer) {
            Writer.activeWriters.delete(collectionId);
            Writer.writerTimers.delete(collectionId);
        }
    }

    public static async killWriter(collectionId: string) {
        const writer = Writer.activeWriters.get(collectionId);
        if (writer) {
            await writer.cancel();
            Writer.activeWriters.delete(collectionId);
            Writer.writerTimers.delete(collectionId);
            Writer.filenames.delete(collectionId);
        }
    }

    public static hasWriter(collectionId: string): boolean {
        return Writer.activeWriters.get(collectionId) !== undefined;
    }

    public static getFilename(
        collectionId: string,
        chunk: ArrayBuffer
    ): [boolean, string] {
        let filename = this.filenames.get(collectionId);
        if (filename) {
            return [false, filename];
        }

        const filename_bytes = chunk.slice(0, 1024);
        filename = new TextDecoder("utf-8")
            .decode(filename_bytes)
            .replaceAll("%", ""); // remove padding

        this.filenames.set(collectionId, filename);

        return [true, filename];
    }

    public static getWriter(
        collectionId: string,
        default_filename: string
    ): ReturnType<typeof storage.prepareUploadLargeFile> {
        const writer = Writer.activeWriters.get(collectionId);
        if (!writer) {
            const writer = storage.prepareUploadLargeFile(
                default_filename,
                "datasets/"
            );

            Writer.setWriterExpiry(
                collectionId,
                3 * 3600 * 1000 // 3 hours
            );

            Writer.activeWriters.set(collectionId, writer);

            return writer;
        }

        return writer;
    }
}

const maxFileSchema = z.custom<ArrayBuffer>(
    (val) => val instanceof ArrayBuffer && val.byteLength <= MAX_BYTES,
    { message: "Expected max size 1 MB" }
);

const uploadDatasetSchema = z.object({
    // hash: z.string().length(32),
    finish: z.string().default("false"),
});

app.post(
    "/",
    authMiddleware,
    zodValidator(maxFileSchema, "arraybuffer"),
    zodValidator(uploadDatasetSchema, "query"),
    async (c) => {
        const { collectionId }: { collectionId: string } = c.req.param() as any;
        const user = c.get("user");

        const { data } = uploadDatasetSchema.safeParse(await c.req.query());

        const collection = await prisma.collection.findFirst({
            where: {
                userId: user.id,
                id: collectionId,
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

        let chunk = await c.req.arrayBuffer();
        const [newFile, filename] = Writer.getFilename(collectionId, chunk);
        const writer = Writer.getWriter(collectionId, filename);

        if (newFile) {
            chunk = chunk.slice(1024);
        }

        await writer.write(chunk);

        if (data?.finish == "true") {
            const storageData = await writer.finish();
            const storageId = storageData.id;
            const metadata = storage.getFileMetadata(collectionId);

            await storage.addCollectionToStorage(collectionId, storageId);
            await Writer.flushWritter(collectionId);

            return c.json({
                status: "ok",
                data: { ...storageData, metadata },
            });
        } else {
            return c.body(null, 204);
        }
    }
);

export default app;

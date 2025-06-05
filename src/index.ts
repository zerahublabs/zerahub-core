import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { openAPISpecs } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { stream } from "hono/streaming";
import { errorMiddleware } from "./middlewares/error";
import auth from "@routes/auth";
import user from "@routes/user";
import collection from "@routes/collection";
import me from "@routes/me";
import Storage from "./services/storage";
import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();
const storage = new Storage(prisma);
const app = new Hono({});

// middleware
app.use(cors());
app.use(logger());

// routes
app.route("/auths", auth);
app.route("/users", user);
app.route("/collections", collection);
app.route("/me", me);

// default routing
app.get("/", (c) => {
    return c.json({
        message: "Welcome to ZeraHub API",
        version: "1.0.0",
    });
});

app.get("/health", async (c) => {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
    });
});

app.get(
    "/api-specs",
    openAPISpecs(app, {
        documentation: {
            info: {
                title: "ZeraHub API",
                version: "1.0.0",
                description: "ZeraHub Core API Specs",
            },
            servers: [
                {
                    url: "http://localhost:3001",
                    description: "Local Servers",
                },
            ],
        },
    })
);

app.get("/static/*", async (c) => {
    const path = c.req.path.replace("/static/", "");

    return stream(c, async (stream) => {
        const streamData = storage.client.file(path).stream();
        await stream.pipe(streamData);
    });
});

app.get("/docs", swaggerUI({ url: "/api-specs" }));

app.onError(errorMiddleware);

// Start the server
const port = Number.parseInt(process.env.PORT || "3000");
console.log(`Server is running on port ${port}`);

export default {
    port,
    fetch: app.fetch,
};

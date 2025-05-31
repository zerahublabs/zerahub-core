import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import auth from "@routes/auth";

const app = new Hono({});

// middleware
app.use(cors());
app.use(logger());

// routes
app.route("/auth", auth);

// default routing
app.get("/", (c) => {
    return c.json({
        status: "ok",
        message: "health ok",
    });
});

export default {
    port: 3001,
    fetch: app.fetch,
};

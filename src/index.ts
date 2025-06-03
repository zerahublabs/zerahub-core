import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { openAPISpecs } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { errorMiddleware } from "./middlewares/error";
import auth from "@routes/auth";
import user from "@routes/user";
import collection from "@routes/collection";
// import upload from "@routes/upload.dataset"

const app = new Hono({});

// middleware
app.use(cors());
app.use(logger());

// routes
app.route("/auths", auth);
app.route("/users", user);
app.route("/collection", collection);
// app.route("/y", upload);

// default routing
app.get("/", (c) => {
	return c.json({
		status: "ok",
		message: "health ok",
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
	}),
);

app.get("/docs", swaggerUI({ url: "/api-specs" }));

app.onError(errorMiddleware);

export default {
	port: 3001,
	fetch: app.fetch,
};

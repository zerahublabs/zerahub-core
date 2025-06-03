import { Hono } from "hono";
import collection from "./collection";

const app = new Hono();

app.route("/collections", collection);

export default app;

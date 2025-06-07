import { Hono } from "hono";
import collection from "./collection";
import profile from "./profile";

const app = new Hono();

app.route("/collections", collection);
app.route("/profile", profile);

export default app;

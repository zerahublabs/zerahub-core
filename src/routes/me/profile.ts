import { PrismaClient } from "@/generated/prisma";
import { authMiddleware } from "@/middlewares/auth";
import { Hono } from "hono";

const prisma = new PrismaClient();
const app = new Hono();

app.use(authMiddleware);

app.get("/", async (c) => {
	const user = await prisma.user.findFirst({
		where: {
			address: c.get("user").address,
		},
	});

	return c.json({
		status: "ok",
		data: user,
	});
});

export default app;

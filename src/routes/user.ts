import { PrismaClient, type User } from "@/generated/prisma";
import { authMiddleware } from "@/middlewares/auth";
import { Hono } from "hono";
import { z } from "zod";
import { getProfile, updateUsername } from "./user.docs";
import { errorMiddleware } from "@/middlewares/error";
import { zodValidator } from "@/middlewares/validator";

const prisma = new PrismaClient();

const updateUsernameSchema = z.object({
	username: z.string().min(1),
});

type Variables = {
	user: User;
	validated: z.infer<typeof updateUsernameSchema>;
};

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

app.get("/me", getProfile, async (c) => {
	const user = c.get("user");

	return c.json({
		status: "ok",
		data: user,
	});
});

app.post(
	"/username",
	updateUsername,
	zodValidator(updateUsernameSchema),
	async (c) => {
		const validatedData = c.get("validated");
		const user = c.get("user");

		const updatedUser = await prisma.user.update({
			where: {
				address: user.address,
			},
			data: {
				username: validatedData.username,
				updatedAt: new Date(),
			},
		});

		return c.json({
			status: "ok",
			data: {
				username: updatedUser.username,
			},
		});
	},
);

app.onError(errorMiddleware);
export default app;

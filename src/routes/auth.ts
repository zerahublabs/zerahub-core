import { Hono } from "hono";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";
import { generateNonce, SiweMessage } from "siwe";
import { sign } from "hono/jwt";
import { JWT_EXPIRES, JWT_SECRET } from "@/config/jwt";
import { authInit, authLogin } from "./auth.docs";
import { errorMiddleware } from "@/middlewares/error";

const prisma = new PrismaClient();
const app = new Hono();

const registerSchema = z.object({
	signature: z.string(),
	message: z.string(),
});

app.onError(errorMiddleware);

app.post("/", authLogin, async (c) => {
	const body = await c.req.json();

	const bodySafeParsed = registerSchema.safeParse(body);
	const siwe = new SiweMessage(bodySafeParsed.data?.message as string);

	const fields = await siwe.verify({
		signature: bodySafeParsed.data?.signature as string,
	});

	let user = await prisma.user.findFirst({
		where: {
			address: fields.data.address,
		},
	});

	if (user === null) {
		user = await prisma.user.create({
			data: {
				username: fields.data.address.substring(0, 12),
				address: fields.data.address,
			},
		});
	}

	const access_token = await sign(
		{
			address: fields.data.address,
			exp: JWT_EXPIRES,
		},
		JWT_SECRET,
	);

	return c.json({
		status: "ok",
		data: {
			user,
			access_token,
		},
	});
});

app.get("/init", authInit, async (c) => {
	return c.json({
		status: "ok",
		data: {
			nonce: generateNonce(),
		},
	});
});

export default app;

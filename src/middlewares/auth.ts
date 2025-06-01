import { JWT_SECRET } from "@/config/jwt";
import type { MiddlewareHandler } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import type { JWTPayload } from "hono/utils/jwt/types";
import { PrismaClient } from "@/generated/prisma";

interface AuthPayload extends JWTPayload {
	address: string;
}

const prisma = new PrismaClient();

export const authMiddleware: MiddlewareHandler = bearerAuth({
	verifyToken: async (token, c) => {
		try {
			const payload = (await verify(token, JWT_SECRET)) as AuthPayload;
			const user = await prisma.user.findFirst({
				where: {
					address: payload.address,
				},
			});

			if (!user) {
				throw new HTTPException(401, {
					message: "Unauthorized",
				});
			}

			c.set("user", user);
			return true;
		} catch (error) {
			throw new HTTPException(401, {
				message: "Unauthorized",
			});
		}
	},
});

import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { JwtTokenInvalid } from "hono/utils/jwt/types";
import { ZodError } from "zod";

export const errorMiddleware = (err: Error, c: Context) => {
	if (err instanceof HTTPException) {
		return c.json(
			{
				status: "fail",
				message: err.message,
			},
			err.status,
		);
	}
	if (err instanceof JwtTokenInvalid) {
		return c.json(
			{
				status: "fail",
				message: "invalid token",
			},
			401,
		);
	}
	if (err instanceof ZodError) {
		return c.json(
			{
				status: "fail",
			},
			500,
		);
	}

	return c.json(
		{
			status: "fail",
			message: "internal server error",
		},
		500,
	);
};

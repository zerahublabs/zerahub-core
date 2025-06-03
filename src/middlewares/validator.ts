import type { Context, MiddlewareHandler } from "hono";
import { z } from "zod";

type ValidationTarget = "json" | "arraybuffer" | "form" | "query" | "param";

// Define custom context variable types
type ValidatedData<T extends z.ZodType> = {
	validated: z.infer<T>;
};

export const zodValidator = <T extends z.ZodType>(
	schema: T,
	target: ValidationTarget = "json",
): MiddlewareHandler => {
	return async (
		c: Context<{ Variables: ValidatedData<T> }>,
		next: () => Promise<void>,
	) => {
		try {
			let data: unknown;

			switch (target) {
				case "json":
					data = await c.req.json();
					break;
				case "arraybuffer":
					data = await c.req.arrayBuffer();
					break;
				case "form":
					data = await c.req.parseBody();
					break;
				case "query":
					data = c.req.query();
					break;
				case "param":
					data = c.req.param();
					break;
				default:
					throw new Error("Invalid validation target");
			}

			const validatedData = await schema.parseAsync(data);

			// Attach validated data to context for later use
			c.set("validated", validatedData);

			await next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const formattedErrors = error.issues.map((err) => ({
					path: err.path.join("."),
					message: err.message,
					code: err.code,
				}));

				c.status(400);
				return c.json({
					status: "fail",
					message: "Validation failed",
					errors: formattedErrors,
				});
			}
			throw error;
		}
	};
};

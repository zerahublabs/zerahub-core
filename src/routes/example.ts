import { Hono } from "hono";
import { z } from "zod";
import { zodValidator } from "../middlewares/validator";

// Define validation schemas
const userSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(2),
});

const searchSchema = z.object({
	query: z.string().min(1),
	page: z.string().transform(Number).pipe(z.number().positive()),
	limit: z.string().transform(Number).pipe(z.number().min(1).max(100)),
});

// Define types
type UserSchema = typeof userSchema;
type SearchSchema = typeof searchSchema;

type Variables = {
	validated: z.infer<UserSchema> | z.infer<SearchSchema>;
};

const router = new Hono<{ Variables: Variables }>();

// Example route with validation
router.post(
	"/register",
	zodValidator(userSchema), // Validate request body
	async (c) => {
		// Get the validated data
		const validatedData = c.get("validated") as z.infer<UserSchema>;

		// Your logic here...
		return c.json({
			status: "success",
			message: "User registered successfully",
			data: validatedData,
		});
	},
);

router.get(
	"/search",
	zodValidator(searchSchema, "query"), // Validate query parameters
	async (c) => {
		const validatedData = c.get("validated") as z.infer<SearchSchema>;

		return c.json({
			status: "success",
			data: validatedData,
		});
	},
);

export default router;

import type { User } from "@/generated/prisma";
import type { ContextVariableMap } from "hono";

declare module "hono" {
	interface ContextVariableMap {
		user: User;
	}
}

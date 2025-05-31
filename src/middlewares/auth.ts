import { createMiddleware } from "hono/factory";

export const jwtAuthMiddleware = createMiddleware(async (c, next) => {
    console.log(c.header)

    await next()
})

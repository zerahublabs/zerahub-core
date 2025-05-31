import { jwtAuthMiddleware } from "@/middlewares/auth";
import { Hono } from "hono";

const app = new Hono()

app.use(jwtAuthMiddleware)

app.get('/me', (c) => {
    return c.json({
        status: 'ok'
    })
})

export default app

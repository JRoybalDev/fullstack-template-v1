import type { MiddlewareHandler } from "hono";
import { env } from "../env";

export const requireAdminKey: MiddlewareHandler = async (c, next) => {
  if (!env.adminKey) {
    return c.json({ error: "ADMIN_KEY is not configured on the server" }, 503);
  }

  const provided = c.req.header("X-Admin-Key");

  if (!provided || provided !== env.adminKey) {
    return c.json({ error: "Missing or invalid admin key" }, 401);
  }

  await next();
};

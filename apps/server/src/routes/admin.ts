import { desc } from "drizzle-orm";
import { Hono } from "hono";
import { sites } from "../../db/schema";
import { db } from "../db";
import { toSite } from "../mappers";
import { requireAdminKey } from "../middleware/admin";

export const adminRoute = new Hono();

adminRoute.use("*", requireAdminKey);

adminRoute.get("/session", (c) =>
  c.json({
    ok: true
  })
);

adminRoute.get("/sites", async (c) => {
  const rows = await db.select().from(sites).orderBy(desc(sites.updatedAt));
  return c.json(rows.map(toSite));
});

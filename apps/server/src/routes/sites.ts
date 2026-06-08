import { SiteDraftSchema } from "@fullstack-template/schema";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { sites } from "../../db/schema";
import { toSite } from "../mappers";
import { requireAdminKey } from "../middleware/admin";

export const sitesRoute = new Hono();

sitesRoute.get("/", async (c) => {
  const rows = await db.select().from(sites).where(eq(sites.published, true)).orderBy(desc(sites.updatedAt));
  return c.json(rows.map(toSite));
});

sitesRoute.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [site] = await db.select().from(sites).where(and(eq(sites.slug, slug), eq(sites.published, true))).limit(1);

  if (!site) {
    return c.json({ error: "Site not found" }, 404);
  }

  return c.json(toSite(site));
});

sitesRoute.post("/", requireAdminKey, async (c) => {
  const body = await c.req.json();
  const parsed = SiteDraftSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid site payload", details: parsed.error.flatten() }, 400);
  }

  const [site] = await db
    .insert(sites)
    .values({
      ...parsed.data,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: sites.slug,
      set: {
        title: parsed.data.title,
        description: parsed.data.description,
        heroImageUrl: parsed.data.heroImageUrl,
        metadata: parsed.data.metadata,
        branding: parsed.data.branding,
        links: parsed.data.links,
        published: parsed.data.published,
        updatedAt: new Date()
      }
    })
    .returning();

  if (!site) {
    return c.json({ error: "Site was not saved" }, 500);
  }

  return c.json(toSite(site), 201);
});

sitesRoute.delete("/:slug", requireAdminKey, async (c) => {
  const slug = c.req.param("slug");
  const [deleted] = await db.delete(sites).where(eq(sites.slug, slug)).returning();

  if (!deleted) {
    return c.json({ error: "Site not found" }, 404);
  }

  return c.json(toSite(deleted));
});

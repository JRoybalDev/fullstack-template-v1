import { Hono } from "hono";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { db } from "../db";
import { env } from "../env";
import { uploads } from "../../db/schema";
import { toUpload } from "../mappers";
import { requireAdminKey } from "../middleware/admin";
import { createThumbnail } from "../uploads/thumbnail";

export const uploadsRoute = new Hono();

uploadsRoute.post("/", requireAdminKey, async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return c.json({ error: "Expected a file field" }, 400);
  }

  await mkdir(env.uploadDir, { recursive: true });

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const safeName = `${crypto.randomUUID()}.${extension}`;
  const path = join(env.uploadDir, safeName);
  await Bun.write(path, file);
  const thumbnail = await createThumbnail(file, env.uploadDir);

  const [upload] = await db
    .insert(uploads)
    .values({
      filename: file.name,
      url: `/uploads/${safeName}`,
      thumbnailUrl: thumbnail?.url ?? "",
      contentType: file.type || "application/octet-stream",
      size: file.size
    })
    .returning();

  if (!upload) {
    return c.json({ error: "Upload was not saved" }, 500);
  }

  return c.json(toUpload(upload), 201);
});

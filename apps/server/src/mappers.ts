import type { Site, Upload } from "@fullstack-template/schema";
import type { SiteRow, UploadRow } from "../db/schema";

export function toSite(row: SiteRow): Site {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    heroImageUrl: row.heroImageUrl,
    links: row.links,
    published: row.published,
    updatedAt: row.updatedAt.toISOString()
  };
}

export function toUpload(row: UploadRow): Upload {
  return {
    id: row.id,
    filename: row.filename,
    url: row.url,
    contentType: row.contentType,
    size: row.size,
    createdAt: row.createdAt.toISOString()
  };
}

import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  heroImageUrl: text("hero_image_url").notNull().default(""),
  links: jsonb("links").$type<Array<{ label: string; href: string; kind: "primary" | "secondary" | "social" }>>().notNull().default([]),
  published: boolean("published").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const uploads = pgTable("uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type SiteRow = typeof sites.$inferSelect;
export type NewSiteRow = typeof sites.$inferInsert;
export type UploadRow = typeof uploads.$inferSelect;

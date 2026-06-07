import { z } from "zod";

export const LinkSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().url(),
  kind: z.enum(["primary", "secondary", "social"]).default("secondary")
});

export const UploadSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1),
  url: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
  createdAt: z.string().datetime()
});

export const SiteSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(160),
  description: z.string().max(1000).default(""),
  heroImageUrl: z.string().url().or(z.literal("")).default(""),
  links: z.array(LinkSchema).default([]),
  published: z.boolean().default(false),
  updatedAt: z.string().datetime()
});

export const SiteDraftSchema = SiteSchema.omit({
  id: true,
  updatedAt: true
}).extend({
  slug: SiteSchema.shape.slug,
  title: SiteSchema.shape.title
});

export const SiteListSchema = z.array(SiteSchema);

export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional()
});

export type Link = z.infer<typeof LinkSchema>;
export type Upload = z.infer<typeof UploadSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type SiteDraft = z.infer<typeof SiteDraftSchema>;
export type SiteDraftInput = z.input<typeof SiteDraftSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

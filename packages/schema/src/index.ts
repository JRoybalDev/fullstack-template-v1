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
  thumbnailUrl: z.string().default(""),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
  createdAt: z.string().datetime()
});

export const defaultSiteMetadata = {
  tabTitle: "",
  seoTitle: "",
  seoDescription: "",
  faviconUrl: "",
  ogImageUrl: ""
};

export const defaultSiteBranding = {
  backgroundColor: "#f7f7f2",
  surfaceColor: "#ffffff",
  textColor: "#18212f",
  headingColor: "#101828",
  accentColor: "#006d77"
};

export const SiteMetadataSchema = z.object({
  tabTitle: z.string().max(80).default(""),
  seoTitle: z.string().max(160).default(""),
  seoDescription: z.string().max(300).default(""),
  faviconUrl: z.string().url().or(z.literal("")).default(""),
  ogImageUrl: z.string().url().or(z.literal("")).default("")
});

export const SiteBrandingSchema = z.object({
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f7f7f2"),
  surfaceColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff"),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#18212f"),
  headingColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#101828"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#006d77")
});

export const SiteSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(160),
  description: z.string().max(1000).default(""),
  heroImageUrl: z.string().url().or(z.literal("")).default(""),
  metadata: SiteMetadataSchema.default(defaultSiteMetadata),
  branding: SiteBrandingSchema.default(defaultSiteBranding),
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
export type SiteMetadata = z.infer<typeof SiteMetadataSchema>;
export type SiteBranding = z.infer<typeof SiteBrandingSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type SiteDraft = z.infer<typeof SiteDraftSchema>;
export type SiteDraftInput = z.input<typeof SiteDraftSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

# Branding And Marketing Guide

This guide is for people updating public-facing content, brand language, colors, and launch materials without needing to understand the full codebase.

## Dashboard Access

Open:

```txt
http://localhost:5173/dashboard
```

Enter the dashboard access code provided by the developer or project owner. This code is stored as `ADMIN_KEY` on the server.

The dashboard opens on a Start Guide tab with the recommended setup order for a new site record.

## Public Site Content

The dashboard manages public site records. A record can include:

- Slug
- Title
- Description
- Hero image URL
- Links
- Published status

Only published records appear on the public site.

## Images And Thumbnails

When images are uploaded through the API, the server stores the original file and creates a smaller WebP thumbnail.

Use thumbnails for previews, cards, and lists. They load faster and avoid using the full original image size in small spaces.

Use original images only when the user needs the full-size asset.

## Brand Colors And Themes

Brand colors live in:

```txt
apps/web/src/styles/branding.css
```

That file contains the global light and dark theme color tokens for the public site and shared app shell. Other CSS files reference those tokens instead of hard-coding colors.

Dashboard-specific branding lives in:

```txt
apps/web/src/styles/dashboard-branding.css
```

Use this file when the private admin dashboard should have its own company look without changing the public site.

Important token groups:

- `--brand-*`: core brand palette values
- `--app-*`: semantic app colors used by components

Examples:

```css
--app-bg
--app-text
--app-heading
--app-accent
--app-surface
```

When changing public site colors, update `branding.css` first. When changing only the private dashboard colors, update `dashboard-branding.css`.

## Dashboard Branding Tab

The dashboard also includes a Branding tab for client-editable public site colors. These colors are saved with the site record and can be changed without editing code:

- Browser tab title
- Favicon URL
- Background
- Surface
- Body text
- Headings
- Accent

These saved colors affect the public site record after saving. They do not change the private dashboard's company-branded palette.

## Dashboard Metadata Tab

The Metadata tab controls search and sharing fields for a site record:

- SEO title
- SEO description
- Open Graph image URL

These values are applied to the browser document metadata when the public site loads.

## Theme Switching

The app supports:

- Light mode
- Dark mode
- System auto-detection

The selector is in the top navigation. System mode follows the visitor's operating system preference.

## Writing Guidelines

Keep public copy short, direct, and useful. Prefer clear page titles, concrete descriptions, and links with action-oriented labels.

Good link labels:

- Contact
- Listen
- Book Now
- Download Press Kit

Avoid vague labels:

- Click Here
- Learn More
- Stuff

## Before Publishing

Check:

- The record is marked published.
- The title fits well on mobile.
- The description is not too long.
- Links open the intended pages.
- Thumbnail images look clear.
- Light and dark themes both look readable.

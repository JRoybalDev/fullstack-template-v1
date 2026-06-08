# Developer Onboarding

This project is a Bun-first TypeScript app split into three main parts:

- `apps/web`: React 19 + Vite public site and admin dashboard.
- `apps/server`: Bun + Hono API with Postgres, Drizzle ORM, uploads, and protected admin writes.
- `packages/schema`: shared Zod schemas and inferred TypeScript types used by the API and frontend.

## Local Setup

Install dependencies in each Bun context:

```bash
bun install
cd packages/schema && bun install
cd ../../apps/server && bun install
cd ../web && bun install
cd ../..
```

Create env files:

```bash
cp .env.example .env
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Start Postgres:

```bash
bun run db:up
```

Run migrations:

```bash
cd apps/server
bunx drizzle-kit migrate
cd ../..
```

Start the stack:

```bash
bun run dev
```

## Local URLs

- Public site: `http://localhost:5173`
- Dashboard: `http://localhost:5173/dashboard`
- API health: `http://localhost:3001/health`

## Common Workflows

Run typechecks:

```bash
bun run typecheck
```

Run builds:

```bash
bun run build
```

Generate a Drizzle migration after changing `apps/server/db/schema.ts`:

```bash
cd apps/server
bun run db:generate
```

Apply migrations:

```bash
cd apps/server
bun run db:migrate
```

## Important Concepts

The shared schema package is the contract between the web app and server. Add or change validation in `packages/schema/src/index.ts` first, then update server routes and frontend forms to match.

Protected dashboard and write requests use the `ADMIN_KEY` environment variable. The dashboard asks for this value as an access code and sends it as the `X-Admin-Key` header.

Uploads store the original file and generate optimized WebP thumbnails for supported image files. Use `thumbnailUrl` for thumbnail displays instead of the original `url`.


# Fullstack Template V1

Bun-first TypeScript template with a React 19 + Vite frontend, Bun + Hono API, Postgres 16 persistence through Drizzle ORM, protected admin writes, local uploads, and a shared Zod schema package.

## Start A New Project

Use this section when creating a fresh app from the template.

### 1. Copy The Template

From the directory where you keep projects:

```bash
cp -R /path/to/fullstack-template-v1 my-new-project
cd my-new-project
```

If the copied template includes installed dependencies or local env files, remove them before installing fresh:

```bash
rm -rf node_modules apps/web/node_modules apps/server/node_modules packages/schema/node_modules
rm -f .env apps/web/.env apps/server/.env
```

### 2. Rename The Project

Update package names to match the new project:

- Root `package.json`: change `"name"`
- `apps/web/package.json`: change `"name"`
- `apps/server/package.json`: change `"name"`
- `packages/schema/package.json`: change `"name"` if you want a project-specific package scope

If you rename `@fullstack-template/schema`, also update imports and package dependencies that reference it:

```bash
rg "@fullstack-template/schema"
```

### 3. Initialize Git

If you copied this template outside an existing repository, create a fresh repo:

```bash
rm -rf .git
git init
git add .
git commit -m "Initial project from fullstack template"
```

Keep `.env` files out of source control. They are ignored by default.

### 4. Configure Env Files

Create local env files from the examples:

```bash
cp .env.example .env
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Set a real dashboard/API access code in both `.env` and `apps/server/.env`:

```txt
ADMIN_KEY=replace-with-a-long-random-secret
```

The dashboard at `/dashboard` uses this value as its access code. Protected API requests use the same value in the `X-Admin-Key` header.

The local database defaults to host port `5433` to avoid conflicts with an existing Postgres on `5432`:

```txt
POSTGRES_HOST_PORT=5433
DATABASE_URL=postgres://postgres:postgres@localhost:5433/fullstack_template
```

For a new project, rename the database in `DATABASE_URL` and `docker-compose.yml` if you do not want to use `fullstack_template`.

### 5. Install Dependencies

This template intentionally uses separate Bun install contexts at the root, `apps/web`, `apps/server`, and `packages/schema`.

```bash
bun install
cd packages/schema && bun install
cd ../../apps/server && bun install
cd ../web && bun install
cd ../..
```

### 6. Start Postgres

```bash
bun run db:up
```

The DB helper supports both Docker Compose v2 (`docker compose`) and legacy Compose v1 (`docker-compose`).

### 7. Run Migrations

```bash
cd apps/server
bunx drizzle-kit migrate
cd ../..
```

### 8. Start Development

```bash
bun run dev
```

Open:

- Public site: `http://localhost:5173`
- Dashboard: `http://localhost:5173/dashboard`
- API health: `http://localhost:3001/health`

If the API is already running when you change `.env` files, stop and restart it so Bun reloads the environment.

### 9. Smoke Check

Before building on the template, run:

```bash
bun run typecheck
bun run build
```

## Project Shape

```txt
apps/
  web/       React 19, Vite 8, React Router, React Query, Zustand, Tailwind 4, DaisyUI
  server/    Bun, Hono, Drizzle ORM, Postgres, uploads, X-Admin-Key writes
packages/
  schema/    Shared Zod schemas and inferred TypeScript types
scripts/
  dev.ts     Bun full stack dev runner
docs/        Project documentation for developers, deployment, database setup, and branding
```

This template intentionally uses separate Bun install contexts at the root, `apps/web`, `apps/server`, and `packages/schema`.

## Stack

- Runtime: Bun
- Language: TypeScript
- Database: Postgres 16, exposed locally on host port `5433` by default
- ORM and migrations: Drizzle ORM + Drizzle Kit
- Frontend: React 19, Vite 8, React Router 7, TanStack Query 5, Zustand 5
- Styling: Tailwind CSS 4, DaisyUI 5, regular CSS files
- API: Hono on port `3001`
- Web: Vite on port `5173`
- Dashboard: `http://localhost:5173/dashboard`

## First Run In This Template

If you are working directly inside this template checkout rather than copying it into a new project, run:

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

The Docker database maps container port `5432` to host port `5433` by default. Change `POSTGRES_HOST_PORT` and `DATABASE_URL` if you prefer another host port.

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

If the API is already running when you change `.env` files, stop and restart it so Bun reloads the environment.

Open:

- Web: `http://localhost:5173`
- Dashboard: `http://localhost:5173/dashboard`
- API health: `http://localhost:3001/health`

## Dashboard Access And Admin Writes

The dashboard and private API routes use the server-side `ADMIN_KEY` environment value as the access code.

Open `http://localhost:5173/dashboard` and enter the same value configured in `apps/server/.env`:

```txt
ADMIN_KEY=replace-with-a-long-random-secret
```

Protected API requests send that value through:

```txt
X-Admin-Key: replace-with-a-long-random-secret
```

Set `ADMIN_KEY` before using the dashboard or protected API routes. The server returns a configuration error for protected requests when it is missing.

## Useful Commands

```bash
bun run typecheck
bun run build
bun run db:logs
bun run db:down
```

Server-only:

```bash
cd apps/server
bun run db:generate
bun run db:migrate
bun run db:studio
```

## API Routes

- `GET /health`
- `GET /api/sites` published public records only
- `GET /api/sites/:slug` published public records only
- `GET /api/admin/session` with `X-Admin-Key`
- `GET /api/admin/sites` with `X-Admin-Key`
- `POST /api/sites` with `X-Admin-Key`
- `DELETE /api/sites/:slug` with `X-Admin-Key`
- `POST /api/uploads` with multipart `file` and `X-Admin-Key`
- `GET /uploads/*`

Image uploads also generate compressed WebP thumbnails. The upload response includes both:

- `url`: original uploaded asset
- `thumbnailUrl`: optimized 640px thumbnail for supported image files, or an empty string for non-image files

## Shared Schema

`packages/schema` exports:

- `SiteSchema`
- `SiteDraftSchema`
- `SiteListSchema`
- `SiteMetadataSchema`
- `SiteBrandingSchema`
- `UploadSchema`
- `ApiErrorSchema`
- Inferred TypeScript types for the API, dashboard, and import or validation scripts

## More Documentation

See [docs/README.md](./docs/README.md) for:

- Developer onboarding
- Deployment and hosting
- External PostgreSQL setup
- Branding and marketing guidance
# fullstack-template-v1

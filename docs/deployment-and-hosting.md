# Deployment And Hosting

This template can be deployed in a few different ways. The important requirement is that the web app can reach the API server, and the API server can reach Postgres.

## Environment Variables

Server:

```txt
DATABASE_URL=postgres://user:password@host:5432/database
ADMIN_KEY=replace-with-a-long-random-secret
PORT=3001
UPLOAD_DIR=uploads
PUBLIC_API_URL=https://api.example.com
```

Web:

```txt
VITE_API_PROXY_TARGET=https://api.example.com
```

For production builds, prefer configuring the frontend with a stable public API base URL if the API is not served from the same origin.

## Vercel

The Vite web app can be hosted on Vercel as a static frontend.

Recommended shape:

- Deploy `apps/web` to Vercel.
- Deploy `apps/server` separately to a Bun-compatible host.
- Use a hosted Postgres provider.
- Configure the web app to point to the deployed API URL.

Vercel project settings:

- Root directory: `apps/web`
- Install command: `bun install`
- Build command: `bun run build`
- Output directory: `dist`

Add the web env variable:

```txt
VITE_API_PROXY_TARGET=https://api.example.com
```

## Self-Hosting

For a single VPS or server:

1. Install Bun, Docker, and Docker Compose.
2. Copy the project to the server.
3. Configure production `.env` files.
4. Run migrations against the production database.
5. Build the web app.
6. Run the API server with a process manager.
7. Serve the web `dist` directory and proxy API traffic through Nginx, Caddy, or another reverse proxy.

Example production commands:

```bash
bun install
cd packages/schema && bun install
cd ../../apps/server && bun install
cd ../web && bun install
cd ../..

cd apps/server && bunx drizzle-kit migrate && cd ../..
cd apps/web && bun run build && cd ../..
```

## Other Hosts

Use this checklist for Render, Railway, Fly.io, DigitalOcean, or similar platforms:

- Confirm Bun is supported or use a container image that includes Bun.
- Set `DATABASE_URL`.
- Set a strong `ADMIN_KEY`.
- Ensure uploaded files are written to persistent storage, object storage, or a mounted volume.
- Run Drizzle migrations before or during release.
- Point the web app at the deployed API URL.

## Upload Storage Note

Local uploads are filesystem-based. On platforms with ephemeral filesystems, move uploads to persistent disk or object storage before production use.


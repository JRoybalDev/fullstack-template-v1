import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { env } from "./env";
import { adminRoute } from "./routes/admin";
import { sitesRoute } from "./routes/sites";
import { uploadsRoute } from "./routes/uploads";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowHeaders: ["Content-Type", "X-Admin-Key"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"]
  })
);

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "fullstack-template-api"
  })
);

app.get("/", (c) =>
  c.json({
    ok: true,
    service: "fullstack-template-api",
    routes: {
      health: "/health",
      publicSites: "/api/sites",
      adminSession: "/api/admin/session",
      adminSites: "/api/admin/sites",
      uploads: "/api/uploads"
    }
  })
);

app.route("/api/sites", sitesRoute);
app.route("/api/admin", adminRoute);
app.route("/api/uploads", uploadsRoute);
app.use("/uploads/*", serveStatic({ root: "./" }));

export default {
  port: env.port,
  fetch: app.fetch
};

console.log(`API listening on http://localhost:${env.port}`);

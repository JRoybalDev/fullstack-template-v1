export const env = {
  port: Number(process.env.PORT ?? 3001),
  adminKey: process.env.ADMIN_KEY,
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  publicApiUrl: process.env.PUBLIC_API_URL ?? "http://localhost:3001"
};

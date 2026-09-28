import "dotenv/config";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig } from "prisma/config";

const isStudio = process.argv.includes("studio");
const rawUrl = process.env.DATABASE_URL ?? "file:./database.sqlite";

// Prisma Studio in v7 has a bug where it splits by '://', and doesn't URL-decode paths.
// So we provide an unencoded file:/// URL with absolute path.
const filePath = path.resolve(rawUrl.replace(/^file:/, "")).replace(/\\/g, "/");
const studioUrl = "file:///" + filePath.replace(/^\/+/, "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: isStudio ? studioUrl : rawUrl,
  },
});

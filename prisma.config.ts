import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use session-mode pooler for migrations (supports DDL),
    // transaction-mode pooler (DATABASE_URL) is used at runtime by the app
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});

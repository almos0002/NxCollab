import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_DIRECT_URL, DATABASE_URL, or NEON_DATABASE_URL must be set.");
}

export default defineConfig({
  schema: "./lib/db/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});

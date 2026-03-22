import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@workspace/db";
import {
  usersTable,
  sessionsTable,
  accountsTable,
  verificationsTable,
} from "@workspace/db";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:18724";

export const auth = betterAuth({
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: ["*"],
});

export type Session = typeof auth.$Infer.Session;

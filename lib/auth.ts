import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import {
  usersTable,
  sessionsTable,
  accountsTable,
  verificationsTable,
} from "@/lib/db";
import { eq, sql } from "drizzle-orm";

const baseURL = process.env.BETTER_AUTH_URL
  || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
  || `http://localhost:${process.env.PORT || 3000}`;

const trustedOrigins = [baseURL];
if (process.env.REPLIT_DEV_DOMAIN) {
  const replitOrigin = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  if (!trustedOrigins.includes(replitOrigin)) {
    trustedOrigins.push(replitOrigin);
  }
}

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
    rememberMeExpiresIn: 60 * 60 * 24 * 30,
  },
  trustedOrigins,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.execute(
            sql`UPDATE users SET is_admin = true WHERE id = ${user.id} AND (SELECT count(*) FROM users) = 1`
          );
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;

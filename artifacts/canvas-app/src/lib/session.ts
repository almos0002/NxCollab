import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) return null;
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return null;

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1);

  if (!user[0]?.isAdmin) return null;
  return { ...session, user: user[0] };
}

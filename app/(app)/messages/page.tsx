import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { asc, ne } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { db, usersTable } from "@/lib/db";
import { MessagesPageClient } from "@/components/chat/messages-page-client";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      image: usersTable.image,
    })
    .from(usersTable)
    .where(ne(usersTable.id, session.user.id))
    .orderBy(asc(usersTable.name))
    .limit(200);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Messages</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Private realtime conversations with your teammates</p>
      </div>

      <MessagesPageClient
        currentUser={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        users={users}
      />
    </div>
  );
}

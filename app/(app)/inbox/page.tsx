import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/db";
import { eq, desc, isNull, isNotNull, and } from "drizzle-orm";
import { InboxClient } from "@/components/inbox/inbox-client";

export const metadata: Metadata = { title: "Inbox — Canvas" };

export default async function InboxPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const notifications = await db.select()
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, session.user.id), isNull(notificationsTable.deletedAt)))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(100);

  const trashedNotifications = await db.select()
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, session.user.id), isNotNull(notificationsTable.deletedAt)))
    .orderBy(desc(notificationsTable.deletedAt))
    .limit(100);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Inbox</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Your notifications and workspace invitations</p>
      </div>
      <InboxClient
        initialNotifications={notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          metadata: n.metadata,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        }))}
        initialTrashedNotifications={trashedNotifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          metadata: n.metadata,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
          deletedAt: n.deletedAt?.toISOString() || "",
        }))}
      />
    </div>
  );
}

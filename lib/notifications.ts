import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/db";
import { generateId } from "@/lib/utils";

type NotificationType = "workspace_invite" | "role_changed" | "member_removed" | "canvas_deleted" | "canvas_created" | "member_joined" | "general";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

export async function createNotification({ userId, type, title, message, link, metadata }: CreateNotificationParams) {
  await db.insert(notificationsTable).values({
    id: generateId(),
    userId,
    type,
    title,
    message,
    link: link ?? null,
    metadata: metadata ? JSON.stringify(metadata) : null,
    isRead: false,
    createdAt: new Date(),
  });
}

export async function notifyWorkspaceMembers(
  workspaceId: string,
  excludeUserId: string,
  params: Omit<CreateNotificationParams, "userId">
) {
  const { workspaceMembersTable, workspacesTable } = await import("@/lib/db");
  const { eq } = await import("drizzle-orm");

  const members = await db.select({ userId: workspaceMembersTable.userId })
    .from(workspaceMembersTable)
    .where(eq(workspaceMembersTable.workspaceId, workspaceId));

  const ws = await db.select({ ownerId: workspacesTable.ownerId })
    .from(workspacesTable)
    .where(eq(workspacesTable.id, workspaceId))
    .limit(1);

  const userIds = new Set(members.map(m => m.userId));
  if (ws[0]) userIds.add(ws[0].ownerId);
  userIds.delete(excludeUserId);

  for (const userId of userIds) {
    await createNotification({ ...params, userId });
  }
}

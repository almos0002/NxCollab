import { db } from "@/lib/db";
import { workspacesTable, workspaceMembersTable } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function getUserWorkspaceRole(
  userId: string,
  workspaceId: string
): Promise<string | null> {
  const workspace = await db
    .select()
    .from(workspacesTable)
    .where(eq(workspacesTable.id, workspaceId))
    .limit(1);

  if (workspace[0]?.ownerId === userId) return "owner";

  const member = await db
    .select()
    .from(workspaceMembersTable)
    .where(
      and(
        eq(workspaceMembersTable.workspaceId, workspaceId),
        eq(workspaceMembersTable.userId, userId)
      )
    )
    .limit(1);

  return member[0]?.role ?? null;
}

export function canEdit(role: string | null): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

export function canManageMembers(role: string | null): boolean {
  return role === "owner" || role === "admin";
}

export function canDelete(role: string | null): boolean {
  return role === "owner";
}

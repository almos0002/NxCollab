import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspacesTable, workspaceMembersTable, canvasesTable, activityLogsTable, usersTable } from "@/lib/db";
import { eq, desc, and, isNull } from "drizzle-orm";
import { getUserWorkspaceRole } from "@/lib/workspace";
import { WorkspaceDetailClient } from "@/components/workspace/workspace-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ws = await db.select({ name: workspacesTable.name }).from(workspacesTable).where(eq(workspacesTable.id, id)).limit(1);
  return { title: ws[0] ? `${ws[0].name} — Canvas` : "Workspace — Canvas" };
}

interface Props { params: Promise<{ id: string }> }

export default async function WorkspacePage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const workspace = await db.select().from(workspacesTable).where(and(eq(workspacesTable.id, id), isNull(workspacesTable.deletedAt))).limit(1);
  if (!workspace[0]) notFound();

  const role = await getUserWorkspaceRole(session.user.id, id);
  if (!role) notFound();

  const canvases = await db.select().from(canvasesTable).where(and(eq(canvasesTable.workspaceId, id), isNull(canvasesTable.deletedAt))).orderBy(desc(canvasesTable.updatedAt));
  const members = await db.select({
    id: workspaceMembersTable.id, role: workspaceMembersTable.role, joinedAt: workspaceMembersTable.joinedAt,
    userId: usersTable.id, userName: usersTable.name, userEmail: usersTable.email,
  }).from(workspaceMembersTable).innerJoin(usersTable, eq(workspaceMembersTable.userId, usersTable.id)).where(eq(workspaceMembersTable.workspaceId, id));

  const recentActivity = await db.select({
    id: activityLogsTable.id, action: activityLogsTable.action, createdAt: activityLogsTable.createdAt, userName: usersTable.name,
  }).from(activityLogsTable).leftJoin(usersTable, eq(activityLogsTable.userId, usersTable.id))
    .where(eq(activityLogsTable.workspaceId, id)).orderBy(desc(activityLogsTable.createdAt)).limit(10);

  const ws = workspace[0];

  return (
    <WorkspaceDetailClient
      workspace={{ id: ws.id, name: ws.name, description: ws.description, ownerId: ws.ownerId }}
      role={role}
      canvases={canvases.map(c => ({ id: c.id, name: c.name, description: c.description, updatedAt: c.updatedAt.toISOString() }))}
      members={members.map(m => ({ id: m.id, role: m.role, userId: m.userId, userName: m.userName, userEmail: m.userEmail }))}
      recentActivity={recentActivity.map(l => ({ id: l.id, action: l.action, createdAt: l.createdAt.toISOString(), userName: l.userName }))}
    />
  );
}

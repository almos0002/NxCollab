import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspacesTable, activityLogsTable, canvasesTable } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { getUserWorkspaceRole, canEdit, canDelete } from "@/lib/workspace";
import { generateId } from "@/lib/utils";
import { notifyWorkspaceMembers } from "@/lib/notifications";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await db.select().from(workspacesTable).where(and(eq(workspacesTable.id, id), isNull(workspacesTable.deletedAt))).limit(1);
  if (!workspace[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, id);
  if (!role || !canEdit(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description } = await req.json();
  const updates: Record<string, any> = { updatedAt: new Date() };

  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    updates.name = name.trim();
  }
  if (description !== undefined) {
    updates.description = description.trim() || null;
  }

  await db.update(workspacesTable).set(updates).where(eq(workspacesTable.id, id));

  await db.insert(activityLogsTable).values({
    id: generateId(),
    workspaceId: id,
    userId: session.user.id,
    action: "updated workspace details",
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await db.select().from(workspacesTable).where(and(eq(workspacesTable.id, id), isNull(workspacesTable.deletedAt))).limit(1);
  if (!workspace[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, id);
  if (!role || !canDelete(role)) return NextResponse.json({ error: "Only the owner can delete a workspace" }, { status: 403 });

  const now = new Date();
  const wsName = workspace[0].name;

  await db.update(workspacesTable).set({ deletedAt: now }).where(eq(workspacesTable.id, id));
  await db.update(canvasesTable).set({ deletedAt: now }).where(eq(canvasesTable.workspaceId, id));

  await db.insert(activityLogsTable).values({
    id: generateId(),
    workspaceId: id,
    userId: session.user.id,
    action: `moved workspace "${wsName}" to trash`,
    createdAt: now,
  });

  await notifyWorkspaceMembers(id, session.user.id, {
    type: "general",
    title: `Workspace "${wsName}" moved to trash`,
    message: `${session.user.name} moved the workspace "${wsName}" to trash.`,
    link: "/workspaces",
    metadata: { workspaceId: id, workspaceName: wsName },
  });

  return NextResponse.json({ success: true });
}

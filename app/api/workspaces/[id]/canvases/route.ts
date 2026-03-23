import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { canvasesTable, activityLogsTable, workspacesTable } from "@/lib/db";
import { getUserWorkspaceRole, canEdit } from "@/lib/workspace";
import { generateId } from "@/lib/utils";
import { notifyWorkspaceMembers } from "@/lib/notifications";
import { eq, isNull, and } from "drizzle-orm";

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id: workspaceId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ws = await db.select().from(workspacesTable).where(and(eq(workspacesTable.id, workspaceId), isNull(workspacesTable.deletedAt))).limit(1);
  if (!ws[0]) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, workspaceId);
  if (!role || !canEdit(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const id = generateId();
  const now = new Date();

  await db.insert(canvasesTable).values({ id, name: name.trim(), description: description?.trim() ?? null, workspaceId, content: "{}", createdBy: session.user.id, updatedBy: session.user.id, createdAt: now, updatedAt: now });
  await db.insert(activityLogsTable).values({ id: generateId(), workspaceId, userId: session.user.id, action: `created canvas "${name.trim()}"`, createdAt: now });

  const ws = await db.select({ name: workspacesTable.name }).from(workspacesTable).where(eq(workspacesTable.id, workspaceId)).limit(1);
  const wsName = ws[0]?.name ?? "a workspace";

  await notifyWorkspaceMembers(workspaceId, session.user.id, {
    type: "canvas_created",
    title: `New canvas in ${wsName}`,
    message: `${session.user.name} created a new canvas "${name.trim()}" in "${wsName}".`,
    link: `/canvas/${id}`,
    metadata: { workspaceId, workspaceName: wsName, canvasId: id, canvasName: name.trim() },
  });

  return NextResponse.json({ id, name: name.trim() });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspaceMembersTable, workspacesTable } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getUserWorkspaceRole, canManageMembers } from "@/lib/workspace";

interface Params { params: Promise<{ id: string; memberId: string }> }

async function getWorkspaceOwner(workspaceId: string) {
  const ws = await db.select({ ownerId: workspacesTable.ownerId }).from(workspacesTable).where(eq(workspacesTable.id, workspaceId)).limit(1);
  return ws[0]?.ownerId ?? null;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id, memberId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserWorkspaceRole(session.user.id, id);
  if (!role || !canManageMembers(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { role: newRole } = await req.json();
  const validRoles = ["admin", "member", "viewer"];
  if (!validRoles.includes(newRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const member = await db.select().from(workspaceMembersTable)
    .where(and(eq(workspaceMembersTable.id, memberId), eq(workspaceMembersTable.workspaceId, id))).limit(1);
  if (!member[0]) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const ownerId = await getWorkspaceOwner(id);
  if (member[0].userId === ownerId) {
    return NextResponse.json({ error: "Cannot change the workspace owner's role" }, { status: 403 });
  }

  await db.update(workspaceMembersTable).set({ role: newRole }).where(eq(workspaceMembersTable.id, memberId));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, memberId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserWorkspaceRole(session.user.id, id);
  if (!role || !canManageMembers(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const member = await db.select().from(workspaceMembersTable)
    .where(and(eq(workspaceMembersTable.id, memberId), eq(workspaceMembersTable.workspaceId, id))).limit(1);
  if (!member[0]) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const ownerId = await getWorkspaceOwner(id);
  if (member[0].userId === ownerId) {
    return NextResponse.json({ error: "Cannot remove the workspace owner" }, { status: 403 });
  }

  await db.delete(workspaceMembersTable).where(eq(workspaceMembersTable.id, memberId));
  return NextResponse.json({ success: true });
}

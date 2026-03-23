import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspaceInvitesTable, workspaceMembersTable, workspacesTable } from "@/lib/db";
import { eq, and, gt } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { notifyWorkspaceMembers } from "@/lib/notifications";

interface Params { params: Promise<{ token: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invite = await db.select({
    id: workspaceInvitesTable.id, workspaceId: workspaceInvitesTable.workspaceId,
    role: workspaceInvitesTable.role, usedAt: workspaceInvitesTable.usedAt,
    email: workspaceInvitesTable.email, workspaceName: workspacesTable.name,
  }).from(workspaceInvitesTable).innerJoin(workspacesTable, eq(workspaceInvitesTable.workspaceId, workspacesTable.id))
    .where(and(eq(workspaceInvitesTable.token, token), gt(workspaceInvitesTable.expiresAt, new Date()))).limit(1);

  if (!invite[0]) return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
  if (invite[0].usedAt) return NextResponse.json({ error: "Invite already used" }, { status: 400 });
  if (invite[0].email && invite[0].email.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "This invite was sent to a different email" }, { status: 403 });
  }

  const result = await db.transaction(async (tx) => {
    const existing = await tx.select().from(workspaceMembersTable)
      .where(and(eq(workspaceMembersTable.workspaceId, invite[0].workspaceId), eq(workspaceMembersTable.userId, session.user.id))).limit(1);

    if (existing[0]) {
      return { alreadyMember: true };
    }

    const now = new Date();
    await tx.insert(workspaceMembersTable).values({ id: generateId(), workspaceId: invite[0].workspaceId, userId: session.user.id, role: invite[0].role, joinedAt: now });
    await tx.update(workspaceInvitesTable).set({ usedAt: now }).where(eq(workspaceInvitesTable.id, invite[0].id));
    return { alreadyMember: false };
  });

  if (!result.alreadyMember) {
    await notifyWorkspaceMembers(invite[0].workspaceId, session.user.id, {
      type: "member_joined",
      title: `New member in ${invite[0].workspaceName}`,
      message: `${session.user.name} joined "${invite[0].workspaceName}" as ${invite[0].role}.`,
      link: `/workspaces/${invite[0].workspaceId}`,
      metadata: { workspaceId: invite[0].workspaceId, workspaceName: invite[0].workspaceName, memberName: session.user.name, role: invite[0].role },
    });
  }

  return NextResponse.json({ success: true, workspaceId: invite[0].workspaceId, alreadyMember: result.alreadyMember });
}

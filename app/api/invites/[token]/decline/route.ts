import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspaceInvitesTable } from "@/lib/db";
import { eq, and, gt } from "drizzle-orm";

interface Params { params: Promise<{ token: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invite = await db.select({
    id: workspaceInvitesTable.id,
    email: workspaceInvitesTable.email,
    usedAt: workspaceInvitesTable.usedAt,
  }).from(workspaceInvitesTable)
    .where(and(eq(workspaceInvitesTable.token, token), gt(workspaceInvitesTable.expiresAt, new Date()))).limit(1);

  if (!invite[0] || invite[0].usedAt) {
    return NextResponse.json({ success: true });
  }

  if (invite[0].email && invite[0].email.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json({ success: true });
  }

  await db.update(workspaceInvitesTable).set({ usedAt: new Date() }).where(eq(workspaceInvitesTable.id, invite[0].id));

  return NextResponse.json({ success: true });
}

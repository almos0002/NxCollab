import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@workspace/db";
import { workspaceInvitesTable } from "@workspace/db";
import { getUserWorkspaceRole, canManageMembers } from "@/lib/workspace";
import { generateId } from "@/lib/utils";
import { headers } from "next/headers";

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id: workspaceId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserWorkspaceRole(session.user.id, workspaceId);
  if (!role || !canManageMembers(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, role: inviteRole = "member" } = await req.json();
  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const id = generateId();

  await db.insert(workspaceInvitesTable).values({ id, workspaceId, invitedBy: session.user.id, email: email ?? null, role: inviteRole, token, expiresAt, createdAt: now });

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const inviteUrl = `${proto}://${host}/invite/${token}`;

  return NextResponse.json({ inviteUrl, token, expiresAt });
}

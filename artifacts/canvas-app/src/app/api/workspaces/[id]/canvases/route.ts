import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@workspace/db";
import { canvasesTable, activityLogsTable } from "@workspace/db";
import { getUserWorkspaceRole, canEdit } from "@/lib/workspace";
import { generateId } from "@/lib/utils";

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id: workspaceId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getUserWorkspaceRole(session.user.id, workspaceId);
  if (!role || !canEdit(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const id = generateId();
  const now = new Date();

  await db.insert(canvasesTable).values({ id, name: name.trim(), description: description?.trim() ?? null, workspaceId, content: "{}", createdBy: session.user.id, updatedBy: session.user.id, createdAt: now, updatedAt: now });
  await db.insert(activityLogsTable).values({ id: generateId(), workspaceId, userId: session.user.id, action: `created canvas "${name.trim()}"`, createdAt: now });

  return NextResponse.json({ id, name: name.trim() });
}

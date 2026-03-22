import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { canvasesTable, canvasVersionsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getUserWorkspaceRole, canEdit } from "@/lib/workspace";

interface Params { params: Promise<{ id: string; versionId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id, versionId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canvas = await db.select().from(canvasesTable).where(eq(canvasesTable.id, id)).limit(1);
  if (!canvas[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
  if (!role || !canEdit(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const version = await db.select().from(canvasVersionsTable).where(eq(canvasVersionsTable.id, versionId)).limit(1);
  if (!version[0]) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  await db.update(canvasesTable).set({ content: version[0].content, updatedBy: session.user.id, updatedAt: new Date() }).where(eq(canvasesTable.id, id));

  return NextResponse.json({ success: true, content: version[0].content });
}

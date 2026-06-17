import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { canvasesTable, canvasVersionsTable, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getUserWorkspaceRole } from "@/lib/workspace";

interface Params { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canvas = await db
    .select({ workspaceId: canvasesTable.workspaceId })
    .from(canvasesTable)
    .where(eq(canvasesTable.id, id))
    .limit(1);
  if (!canvas[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const versions = await db.select({
    id: canvasVersionsTable.id, version: canvasVersionsTable.version, createdAt: canvasVersionsTable.createdAt, createdBy: usersTable.name,
  }).from(canvasVersionsTable).leftJoin(usersTable, eq(canvasVersionsTable.createdBy, usersTable.id))
    .where(eq(canvasVersionsTable.canvasId, id)).orderBy(canvasVersionsTable.version);

  return NextResponse.json({ versions: versions.reverse() });
}

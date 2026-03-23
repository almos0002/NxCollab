import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspacesTable, canvasesTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getUserWorkspaceRole, canDelete } from "@/lib/workspace";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, id } = await req.json();

  if (type === "workspace") {
    const workspace = await db.select().from(workspacesTable).where(eq(workspacesTable.id, id)).limit(1);
    if (!workspace[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (workspace[0].ownerId !== session.user.id) return NextResponse.json({ error: "Only the owner can permanently delete" }, { status: 403 });
    if (!workspace[0].deletedAt) return NextResponse.json({ error: "Item must be in trash first" }, { status: 400 });

    await db.delete(workspacesTable).where(eq(workspacesTable.id, id));
    return NextResponse.json({ success: true });
  }

  if (type === "canvas") {
    const canvas = await db.select().from(canvasesTable).where(eq(canvasesTable.id, id)).limit(1);
    if (!canvas[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canvas[0].deletedAt) return NextResponse.json({ error: "Item must be in trash first" }, { status: 400 });

    const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
    if (!role || !canDelete(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.delete(canvasesTable).where(eq(canvasesTable.id, id));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

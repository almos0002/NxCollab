import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspacesTable, canvasesTable, activityLogsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getUserWorkspaceRole, canEdit } from "@/lib/workspace";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, id } = await req.json();

  if (type === "workspace") {
    const workspace = await db.select().from(workspacesTable).where(eq(workspacesTable.id, id)).limit(1);
    if (!workspace[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (workspace[0].ownerId !== session.user.id) return NextResponse.json({ error: "Only the owner can restore" }, { status: 403 });

    await db.update(workspacesTable).set({ deletedAt: null }).where(eq(workspacesTable.id, id));
    await db.update(canvasesTable).set({ deletedAt: null }).where(eq(canvasesTable.workspaceId, id));

    await db.insert(activityLogsTable).values({
      id: generateId(),
      workspaceId: id,
      userId: session.user.id,
      action: `restored workspace "${workspace[0].name}" from trash`,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  }

  if (type === "canvas") {
    const canvas = await db.select().from(canvasesTable).where(eq(canvasesTable.id, id)).limit(1);
    if (!canvas[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const workspace = await db.select().from(workspacesTable).where(eq(workspacesTable.id, canvas[0].workspaceId)).limit(1);
    if (!workspace[0] || workspace[0].deletedAt) {
      return NextResponse.json({ error: "Cannot restore canvas: workspace is deleted" }, { status: 400 });
    }

    const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
    if (!role || !canEdit(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.update(canvasesTable).set({ deletedAt: null }).where(eq(canvasesTable.id, id));

    await db.insert(activityLogsTable).values({
      id: generateId(),
      workspaceId: canvas[0].workspaceId,
      userId: session.user.id,
      action: `restored canvas "${canvas[0].name}" from trash`,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

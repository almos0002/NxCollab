import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { canvasesTable, canvasVersionsTable, activityLogsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getUserWorkspaceRole, canEdit } from "@/lib/workspace";
import { generateId } from "@/lib/utils";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canvas = await db.select().from(canvasesTable).where(eq(canvasesTable.id, id)).limit(1);
  if (!canvas[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
  if (!role || !canEdit(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { content, name, createVersion, libraryData } = await req.json();
  const now = new Date();

  if (content !== undefined) {
    if (createVersion && canvas[0].content && canvas[0].content !== "{}") {
      const contentChanged = content !== canvas[0].content;
      if (contentChanged) {
        const versions = await db.select().from(canvasVersionsTable).where(eq(canvasVersionsTable.canvasId, id)).orderBy(canvasVersionsTable.version);
        const lastVersion = versions[versions.length - 1];
        const nextVersion = (lastVersion?.version ?? 0) + 1;

        await db.insert(canvasVersionsTable).values({ id: generateId(), canvasId: id, version: nextVersion, content: canvas[0].content, createdBy: session.user.id, createdAt: now });
        if (versions.length >= 50) {
          const oldest = versions[0];
          await db.delete(canvasVersionsTable).where(eq(canvasVersionsTable.id, oldest.id));
        }
      }
    }

    await db.update(canvasesTable).set({ content, updatedBy: session.user.id, updatedAt: now }).where(eq(canvasesTable.id, id));
  }

  if (libraryData !== undefined) {
    await db.update(canvasesTable).set({ libraryData, updatedAt: now }).where(eq(canvasesTable.id, id));
  }

  if (name !== undefined) {
    await db.update(canvasesTable).set({ name: name.trim(), updatedAt: now }).where(eq(canvasesTable.id, id));
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canvas = await db.select().from(canvasesTable).where(eq(canvasesTable.id, id)).limit(1);
  if (!canvas[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(canvas[0]);
}

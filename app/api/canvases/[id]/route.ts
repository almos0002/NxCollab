import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { canvasesTable, canvasVersionsTable, activityLogsTable, workspacesTable } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { getUserWorkspaceRole, canEdit } from "@/lib/workspace";
import { generateId } from "@/lib/utils";
import { notifyWorkspaceMembers } from "@/lib/notifications";

function elementsChanged(storedContent: string, newContent: string): boolean {
  try {
    const stored = JSON.parse(storedContent);
    const incoming = JSON.parse(newContent);
    const storedEls = stored.elements ?? [];
    const incomingEls = incoming.elements ?? [];
    if (storedEls.length !== incomingEls.length) return true;
    const storedIds = storedEls.map((e: any) => e.id).sort().join(",");
    const incomingIds = incomingEls.map((e: any) => e.id).sort().join(",");
    if (storedIds !== incomingIds) return true;
    const storedMap = new Map(storedEls.map((e: any) => [e.id, e]));
    for (const el of incomingEls) {
      const prev = storedMap.get(el.id) as any;
      if (!prev) return true;
      if (el.type !== prev.type || el.x !== prev.x || el.y !== prev.y ||
          el.width !== prev.width || el.height !== prev.height ||
          el.angle !== prev.angle || el.isDeleted !== prev.isDeleted ||
          el.strokeColor !== prev.strokeColor || el.backgroundColor !== prev.backgroundColor ||
          el.fillStyle !== prev.fillStyle || el.strokeWidth !== prev.strokeWidth ||
          el.roughness !== prev.roughness || el.opacity !== prev.opacity ||
          JSON.stringify(el.points) !== JSON.stringify(prev.points) ||
          el.text !== prev.text) {
        return true;
      }
    }
    return false;
  } catch {
    return storedContent !== newContent;
  }
}

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canvas = await db.select().from(canvasesTable).where(and(eq(canvasesTable.id, id), isNull(canvasesTable.deletedAt))).limit(1);
  if (!canvas[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
  if (!role || !canEdit(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { content, name, createVersion, libraryData, description } = body;
  const now = new Date();

  if (content !== undefined) {
    if (createVersion) {
      const oldContent = canvas[0].content;
      const oldIsEmpty = !oldContent || oldContent === "{}" || oldContent === '{"elements":[],"appState":{}}';
      const snapshotContent = oldIsEmpty ? content : oldContent;
      const hasRealChanges = oldIsEmpty
        ? (() => { try { const p = JSON.parse(content); return Array.isArray(p.elements) && p.elements.length > 0; } catch { return false; } })()
        : elementsChanged(oldContent!, content);

      if (hasRealChanges) {
        const versions = await db.select().from(canvasVersionsTable).where(eq(canvasVersionsTable.canvasId, id)).orderBy(canvasVersionsTable.version);
        const lastVersion = versions[versions.length - 1];
        const nextVersion = (lastVersion?.version ?? 0) + 1;

        const isDuplicate = lastVersion && lastVersion.content === snapshotContent;
        if (!isDuplicate) {
          await db.insert(canvasVersionsTable).values({ id: generateId(), canvasId: id, version: nextVersion, content: snapshotContent, createdBy: session.user.id, createdAt: now });
          if (versions.length >= 50) {
            const oldest = versions[0];
            await db.delete(canvasVersionsTable).where(eq(canvasVersionsTable.id, oldest.id));
          }
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

  if (description !== undefined) {
    await db.update(canvasesTable).set({ description: description.trim() || null, updatedAt: now }).where(eq(canvasesTable.id, id));
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canvas = await db.select().from(canvasesTable).where(and(eq(canvasesTable.id, id), isNull(canvasesTable.deletedAt))).limit(1);
  if (!canvas[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(canvas[0]);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canvas = await db.select().from(canvasesTable).where(and(eq(canvasesTable.id, id), isNull(canvasesTable.deletedAt))).limit(1);
  if (!canvas[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
  if (!role || !canEdit(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ws = await db.select({ name: workspacesTable.name }).from(workspacesTable).where(eq(workspacesTable.id, canvas[0].workspaceId)).limit(1);
  const wsName = ws[0]?.name ?? "a workspace";
  const canvasName = canvas[0].name;
  const workspaceId = canvas[0].workspaceId;

  await db.update(canvasesTable).set({ deletedAt: new Date() }).where(eq(canvasesTable.id, id));
  await db.insert(activityLogsTable).values({ id: generateId(), workspaceId, userId: session.user.id, action: `moved canvas "${canvasName}" to trash`, createdAt: new Date() });

  await notifyWorkspaceMembers(workspaceId, session.user.id, {
    type: "canvas_deleted",
    title: `Canvas deleted in ${wsName}`,
    message: `${session.user.name} deleted the canvas "${canvasName}" from "${wsName}".`,
    link: `/workspaces/${workspaceId}`,
    metadata: { workspaceId, workspaceName: wsName, canvasName },
  });

  return NextResponse.json({ success: true });
}

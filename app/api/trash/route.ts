import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspacesTable, canvasesTable, workspaceMembersTable } from "@/lib/db";
import { eq, isNotNull, and, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const ownedWorkspaces = await db
    .select()
    .from(workspacesTable)
    .where(
      and(
        eq(workspacesTable.ownerId, userId),
        isNotNull(workspacesTable.deletedAt)
      )
    );

  const deletedCanvases = await db
    .select({
      id: canvasesTable.id,
      name: canvasesTable.name,
      description: canvasesTable.description,
      workspaceId: canvasesTable.workspaceId,
      workspaceName: workspacesTable.name,
      deletedAt: canvasesTable.deletedAt,
      createdAt: canvasesTable.createdAt,
    })
    .from(canvasesTable)
    .innerJoin(workspacesTable, eq(canvasesTable.workspaceId, workspacesTable.id))
    .where(
      and(
        isNotNull(canvasesTable.deletedAt),
        or(
          eq(workspacesTable.ownerId, userId),
          eq(canvasesTable.createdBy, userId)
        )
      )
    );

  return NextResponse.json({
    workspaces: ownedWorkspaces.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      deletedAt: w.deletedAt?.toISOString(),
      createdAt: w.createdAt.toISOString(),
    })),
    canvases: deletedCanvases.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      workspaceId: c.workspaceId,
      workspaceName: c.workspaceName,
      deletedAt: c.deletedAt?.toISOString(),
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

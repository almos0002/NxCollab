import { db } from "@/lib/db";
import { appSettingsTable } from "@/lib/db/schema/settings";
import { userLimitsTable } from "@/lib/db/schema/limits";
import { workspacesTable } from "@/lib/db/schema/workspaces";
import { canvasesTable } from "@/lib/db/schema/canvases";
import { eq, and, isNull } from "drizzle-orm";

const DEFAULT_WORKSPACE_LIMIT = 5;
const DEFAULT_CANVAS_PER_WORKSPACE_LIMIT = 10;

export async function getDefaultLimits() {
  const wsRow = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, "default_workspace_limit"))
    .limit(1);
  const canvasRow = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, "default_canvas_per_workspace_limit"))
    .limit(1);

  return {
    workspaceLimit: wsRow[0] ? parseInt(wsRow[0].value, 10) : DEFAULT_WORKSPACE_LIMIT,
    canvasPerWorkspaceLimit: canvasRow[0]
      ? parseInt(canvasRow[0].value, 10)
      : DEFAULT_CANVAS_PER_WORKSPACE_LIMIT,
  };
}

export async function getUserLimits(userId: string) {
  const defaults = await getDefaultLimits();
  const userRow = await db
    .select()
    .from(userLimitsTable)
    .where(eq(userLimitsTable.userId, userId))
    .limit(1);

  return {
    workspaceLimit: userRow[0]?.workspaceLimit ?? defaults.workspaceLimit,
    canvasPerWorkspaceLimit:
      userRow[0]?.canvasPerWorkspaceLimit ?? defaults.canvasPerWorkspaceLimit,
    hasCustomLimits: !!userRow[0],
    customWorkspaceLimit: userRow[0]?.workspaceLimit ?? null,
    customCanvasPerWorkspaceLimit: userRow[0]?.canvasPerWorkspaceLimit ?? null,
  };
}

export async function getUserWorkspaceCount(userId: string) {
  const rows = await db
    .select({ id: workspacesTable.id })
    .from(workspacesTable)
    .where(
      and(eq(workspacesTable.ownerId, userId), isNull(workspacesTable.deletedAt))
    );
  return rows.length;
}

export async function getWorkspaceCanvasCount(workspaceId: string) {
  const rows = await db
    .select({ id: canvasesTable.id })
    .from(canvasesTable)
    .where(
      and(
        eq(canvasesTable.workspaceId, workspaceId),
        isNull(canvasesTable.deletedAt)
      )
    );
  return rows.length;
}

export async function checkWorkspaceLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
}> {
  const limits = await getUserLimits(userId);
  const count = await getUserWorkspaceCount(userId);
  return {
    allowed: count < limits.workspaceLimit,
    current: count,
    limit: limits.workspaceLimit,
  };
}

export async function checkCanvasLimit(
  workspaceId: string
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const workspace = await db
    .select({ ownerId: workspacesTable.ownerId })
    .from(workspacesTable)
    .where(eq(workspacesTable.id, workspaceId))
    .limit(1);

  if (!workspace[0]) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const limits = await getUserLimits(workspace[0].ownerId);
  const count = await getWorkspaceCanvasCount(workspaceId);
  return {
    allowed: count < limits.canvasPerWorkspaceLimit,
    current: count,
    limit: limits.canvasPerWorkspaceLimit,
  };
}

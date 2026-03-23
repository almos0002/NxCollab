import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { appSettingsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const wsRow = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "default_workspace_limit")).limit(1);
  const canvasRow = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "default_canvas_per_workspace_limit")).limit(1);

  return NextResponse.json({
    defaultWorkspaceLimit: wsRow[0] ? parseInt(wsRow[0].value, 10) : 5,
    defaultCanvasPerWorkspaceLimit: canvasRow[0] ? parseInt(canvasRow[0].value, 10) : 10,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { defaultWorkspaceLimit, defaultCanvasPerWorkspaceLimit } = await req.json();

  const errors: string[] = [];
  const updates: { key: string; value: number }[] = [];

  for (const [key, value, label] of [
    ["default_workspace_limit", defaultWorkspaceLimit, "Workspace limit"],
    ["default_canvas_per_workspace_limit", defaultCanvasPerWorkspaceLimit, "Canvas limit"],
  ] as const) {
    if (value !== undefined && value !== null) {
      const numVal = parseInt(String(value), 10);
      if (isNaN(numVal) || numVal < 1) {
        errors.push(`${label} must be a positive number`);
      } else {
        updates.push({ key, value: numVal });
      }
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
  }

  const now = new Date();
  for (const { key, value } of updates) {
    const existing = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, key)).limit(1);
    if (existing[0]) {
      await db.update(appSettingsTable).set({ value: String(value), updatedAt: now }).where(eq(appSettingsTable.key, key));
    } else {
      await db.insert(appSettingsTable).values({ id: generateId(), key, value: String(value), createdAt: now, updatedAt: now });
    }
  }

  return NextResponse.json({ success: true });
}

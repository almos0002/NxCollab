import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { userLimitsTable, usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { getUserLimits } from "@/lib/limits";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: userId } = await params;
  const limits = await getUserLimits(userId);
  return NextResponse.json(limits);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: userId } = await params;

  const user = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { workspaceLimit, canvasPerWorkspaceLimit } = await req.json();
  const now = new Date();

  const wsLimit = workspaceLimit !== null && workspaceLimit !== undefined
    ? parseInt(String(workspaceLimit), 10)
    : null;
  const cvLimit = canvasPerWorkspaceLimit !== null && canvasPerWorkspaceLimit !== undefined
    ? parseInt(String(canvasPerWorkspaceLimit), 10)
    : null;

  if (wsLimit !== null && (isNaN(wsLimit) || wsLimit < 1)) {
    return NextResponse.json({ error: "Workspace limit must be a positive number" }, { status: 400 });
  }
  if (cvLimit !== null && (isNaN(cvLimit) || cvLimit < 1)) {
    return NextResponse.json({ error: "Canvas limit must be a positive number" }, { status: 400 });
  }

  const existing = await db.select().from(userLimitsTable).where(eq(userLimitsTable.userId, userId)).limit(1);

  if (wsLimit === null && cvLimit === null) {
    if (existing[0]) {
      await db.delete(userLimitsTable).where(eq(userLimitsTable.userId, userId));
    }
    return NextResponse.json({ success: true, message: "Custom limits removed, using defaults" });
  }

  if (existing[0]) {
    await db.update(userLimitsTable).set({
      workspaceLimit: wsLimit,
      canvasPerWorkspaceLimit: cvLimit,
      updatedAt: now,
    }).where(eq(userLimitsTable.userId, userId));
  } else {
    await db.insert(userLimitsTable).values({
      id: generateId(),
      userId,
      workspaceLimit: wsLimit,
      canvasPerWorkspaceLimit: cvLimit,
      createdAt: now,
      updatedAt: now,
    });
  }

  return NextResponse.json({ success: true });
}

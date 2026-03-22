import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@workspace/db";
import { appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { disabled } = await req.json();
  const existing = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "signup_disabled")).limit(1);
  const now = new Date();

  if (existing[0]) {
    await db.update(appSettingsTable).set({ value: disabled ? "true" : "false", updatedAt: now }).where(eq(appSettingsTable.key, "signup_disabled"));
  } else {
    await db.insert(appSettingsTable).values({ id: generateId(), key: "signup_disabled", value: disabled ? "true" : "false", createdAt: now, updatedAt: now });
  }

  return NextResponse.json({ success: true, disabled });
}

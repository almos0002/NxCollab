import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { appSettingsTable } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { generateId } from "@/lib/utils";

const BRANDING_KEYS = ["site_name", "site_favicon", "site_logo"] as const;

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({ key: appSettingsTable.key, value: appSettingsTable.value })
    .from(appSettingsTable)
    .where(inArray(appSettingsTable.key, BRANDING_KEYS));
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date();

  for (const key of BRANDING_KEYS) {
    if (body[key] !== undefined) {
      const value = String(body[key]).trim();
      const existing = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, key)).limit(1);
      if (existing[0]) {
        await db.update(appSettingsTable).set({ value, updatedAt: now }).where(eq(appSettingsTable.key, key));
      } else {
        await db.insert(appSettingsTable).values({ id: generateId(), key, value, createdAt: now, updatedAt: now });
      }
    }
  }

  revalidateTag("branding", "max");

  return NextResponse.json({ success: true });
}

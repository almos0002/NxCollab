import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/db";
import { eq, desc, isNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const trashed = searchParams.get("trashed") === "true";

  if (trashed) {
    const { isNotNull, and } = await import("drizzle-orm");
    const notifications = await db.select()
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, session.user.id), isNotNull(notificationsTable.deletedAt)))
      .orderBy(desc(notificationsTable.deletedAt))
      .limit(100);
    return NextResponse.json(notifications);
  }

  const { and } = await import("drizzle-orm");
  const notifications = await db.select()
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, session.user.id), isNull(notificationsTable.deletedAt)))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  return NextResponse.json(notifications);
}

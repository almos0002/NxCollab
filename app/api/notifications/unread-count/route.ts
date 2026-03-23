import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/db";
import { eq, and, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.select({ count: count() })
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, session.user.id), eq(notificationsTable.isRead, false)));

  return NextResponse.json({ count: result[0]?.count ?? 0 });
}

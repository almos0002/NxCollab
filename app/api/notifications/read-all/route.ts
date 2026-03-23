import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(and(
      eq(notificationsTable.userId, session.user.id),
      eq(notificationsTable.isRead, false),
      isNull(notificationsTable.deletedAt)
    ));

  return NextResponse.json({ success: true });
}

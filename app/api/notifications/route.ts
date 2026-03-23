import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await db.select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, session.user.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  return NextResponse.json(notifications);
}

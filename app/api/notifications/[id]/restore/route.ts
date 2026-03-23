import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/db";
import { eq, and, isNotNull } from "drizzle-orm";

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notification = await db.select()
    .from(notificationsTable)
    .where(and(
      eq(notificationsTable.id, id),
      eq(notificationsTable.userId, session.user.id),
      isNotNull(notificationsTable.deletedAt)
    ))
    .limit(1);

  if (!notification[0]) return NextResponse.json({ error: "Not found or not in trash" }, { status: 404 });

  await db.update(notificationsTable)
    .set({ deletedAt: null })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, session.user.id)));

  return NextResponse.json({ success: true });
}

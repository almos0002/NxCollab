import { NextResponse } from "next/server";
import { and, count, eq, gt, isNull, ne, sql } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { db, chatMessagesTable, chatParticipantsTable, chatThreadsTable } from "@/lib/db";


export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select({ value: count(chatMessagesTable.id) })
    .from(chatParticipantsTable)
    .innerJoin(chatThreadsTable, eq(chatParticipantsTable.threadId, chatThreadsTable.id))
    .innerJoin(
      chatMessagesTable,
      and(
        eq(chatMessagesTable.threadId, chatParticipantsTable.threadId),
        gt(chatMessagesTable.createdAt, sql<Date>`coalesce(${chatParticipantsTable.lastReadAt}, ${chatParticipantsTable.joinedAt})`),
        ne(chatMessagesTable.senderId, session.user.id),
        isNull(chatMessagesTable.deletedAt)
      )
    )
    .where(and(
        eq(chatParticipantsTable.userId, session.user.id),
        eq(chatThreadsTable.type, "dm")
      )
    );

  return NextResponse.json({ count: result[0]?.value ?? 0 });
}

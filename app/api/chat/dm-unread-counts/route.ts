import { NextResponse } from "next/server";
import { and, count, eq, gt, isNull, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getServerSession } from "@/lib/session";
import { db, chatMessagesTable, chatParticipantsTable, chatThreadsTable } from "@/lib/db";


export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const otherParticipant = alias(chatParticipantsTable, "other_participant");

  const counts = await db
    .select({
      userId: otherParticipant.userId,
      threadId: chatParticipantsTable.threadId,
      count: count(chatMessagesTable.id),
    })
    .from(chatParticipantsTable)
    .innerJoin(chatThreadsTable, eq(chatParticipantsTable.threadId, chatThreadsTable.id))
    .innerJoin(
      otherParticipant,
      and(
        eq(otherParticipant.threadId, chatParticipantsTable.threadId),
        ne(otherParticipant.userId, session.user.id)
      )
    )
    .leftJoin(
      chatMessagesTable,
      and(
        eq(chatMessagesTable.threadId, chatParticipantsTable.threadId),
        gt(chatMessagesTable.createdAt, sql<Date>`coalesce(${chatParticipantsTable.lastReadAt}, ${chatParticipantsTable.joinedAt})`),
        ne(chatMessagesTable.senderId, session.user.id),
        isNull(chatMessagesTable.deletedAt)
      )
    )
    .where(
      and(
        eq(chatParticipantsTable.userId, session.user.id),
        eq(chatThreadsTable.type, "dm")
      )
    )
    .groupBy(otherParticipant.userId, chatParticipantsTable.threadId);

  return NextResponse.json({ counts });
}

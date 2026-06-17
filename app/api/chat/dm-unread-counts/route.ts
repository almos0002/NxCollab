import { NextResponse } from "next/server";
import { and, count, eq, gt, isNull, ne } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { db, chatMessagesTable, chatParticipantsTable, chatThreadsTable } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dmParticipants = await db
    .select({
      threadId: chatParticipantsTable.threadId,
      joinedAt: chatParticipantsTable.joinedAt,
      lastReadAt: chatParticipantsTable.lastReadAt,
    })
    .from(chatParticipantsTable)
    .innerJoin(chatThreadsTable, eq(chatParticipantsTable.threadId, chatThreadsTable.id))
    .where(
      and(
        eq(chatParticipantsTable.userId, session.user.id),
        eq(chatThreadsTable.type, "dm")
      )
    );

  const counts = await Promise.all(
    dmParticipants.map(async (participant) => {
      const otherParticipants = await db
        .select({ userId: chatParticipantsTable.userId })
        .from(chatParticipantsTable)
        .where(
          and(
            eq(chatParticipantsTable.threadId, participant.threadId),
            ne(chatParticipantsTable.userId, session.user.id)
          )
        )
        .limit(1);

      const otherUserId = otherParticipants[0]?.userId;
      if (!otherUserId) return null;

      const since = participant.lastReadAt ?? participant.joinedAt;
      const result = await db
        .select({ value: count() })
        .from(chatMessagesTable)
        .where(
          and(
            eq(chatMessagesTable.threadId, participant.threadId),
            gt(chatMessagesTable.createdAt, since),
            ne(chatMessagesTable.senderId, session.user.id),
            isNull(chatMessagesTable.deletedAt)
          )
        );

      return {
        userId: otherUserId,
        threadId: participant.threadId,
        count: result[0]?.value ?? 0,
      };
    })
  );

  return NextResponse.json({ counts: counts.filter(Boolean) });
}

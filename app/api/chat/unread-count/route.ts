import { NextResponse } from "next/server";
import { and, count, eq, gt, isNull, ne } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { db, chatMessagesTable, chatParticipantsTable } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const participants = await db
    .select({
      threadId: chatParticipantsTable.threadId,
      joinedAt: chatParticipantsTable.joinedAt,
      lastReadAt: chatParticipantsTable.lastReadAt,
    })
    .from(chatParticipantsTable)
    .where(eq(chatParticipantsTable.userId, session.user.id));

  if (participants.length === 0) return NextResponse.json({ count: 0 });

  const counts = await Promise.all(
    participants.map(async (participant) => {
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

      return result[0]?.value ?? 0;
    })
  );

  return NextResponse.json({ count: counts.reduce((sum, value) => sum + value, 0) });
}

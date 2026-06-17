import { and, eq } from "drizzle-orm";
import { db, chatParticipantsTable, chatThreadsTable } from "@/lib/db";

export async function getChatParticipant(userId: string, threadId: string) {
  const participants = await db
    .select()
    .from(chatParticipantsTable)
    .where(
      and(
        eq(chatParticipantsTable.userId, userId),
        eq(chatParticipantsTable.threadId, threadId)
      )
    )
    .limit(1);

  return participants[0] ?? null;
}

export async function requireChatParticipant(userId: string, threadId: string) {
  const participant = await getChatParticipant(userId, threadId);
  if (!participant) return null;

  const threads = await db
    .select()
    .from(chatThreadsTable)
    .where(eq(chatThreadsTable.id, threadId))
    .limit(1);

  if (!threads[0]) return null;
  return { participant, thread: threads[0] };
}

export function getDmKey(userAId: string, userBId: string) {
  return [userAId, userBId].sort().join(":");
}

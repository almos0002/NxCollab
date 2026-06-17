import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { db, chatParticipantsTable, chatThreadsTable } from "@/lib/db";


export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads = await db
    .select({
      id: chatThreadsTable.id,
      type: chatThreadsTable.type,
      workspaceId: chatThreadsTable.workspaceId,
      dmKey: chatThreadsTable.dmKey,
      createdBy: chatThreadsTable.createdBy,
      createdAt: chatThreadsTable.createdAt,
      updatedAt: chatThreadsTable.updatedAt,
      lastMessageAt: chatThreadsTable.lastMessageAt,
      lastReadMessageId: chatParticipantsTable.lastReadMessageId,
      lastReadAt: chatParticipantsTable.lastReadAt,
      mutedAt: chatParticipantsTable.mutedAt,
    })
    .from(chatParticipantsTable)
    .innerJoin(chatThreadsTable, eq(chatParticipantsTable.threadId, chatThreadsTable.id))
    .where(eq(chatParticipantsTable.userId, session.user.id))
    .orderBy(desc(chatThreadsTable.lastMessageAt), desc(chatThreadsTable.updatedAt));

  return NextResponse.json(threads);
}

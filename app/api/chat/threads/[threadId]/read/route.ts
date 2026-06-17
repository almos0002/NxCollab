import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { db, chatMessagesTable, chatParticipantsTable } from "@/lib/db";
import { ablyChannels } from "@/lib/ably/channels";
import { publishAblyEvent } from "@/lib/ably/server";
import { requireChatParticipant } from "@/lib/chat/access";


interface Params {
  params: Promise<{ threadId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { threadId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await requireChatParticipant(session.user.id, threadId);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payload = await req.json().catch(() => null) as { messageId?: unknown } | null;
  const messageId = typeof payload?.messageId === "string" ? payload.messageId : null;

  if (messageId) {
    const messages = await db
      .select({ id: chatMessagesTable.id })
      .from(chatMessagesTable)
      .where(and(eq(chatMessagesTable.id, messageId), eq(chatMessagesTable.threadId, threadId)))
      .limit(1);

    if (!messages[0]) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const now = new Date();
  await db
    .update(chatParticipantsTable)
    .set({ lastReadMessageId: messageId, lastReadAt: now })
    .where(
      and(
        eq(chatParticipantsTable.threadId, threadId),
        eq(chatParticipantsTable.userId, session.user.id)
      )
    );

  await publishAblyEvent(ablyChannels.threadMessages(threadId), "receipt.updated", {
    threadId,
    userId: session.user.id,
    lastReadMessageId: messageId,
    lastReadAt: now.toISOString(),
  });

  return NextResponse.json({ success: true, lastReadMessageId: messageId, lastReadAt: now });
}

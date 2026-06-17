import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, isNull, lt } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { db, chatMessagesTable, chatParticipantsTable, chatThreadsTable, usersTable } from "@/lib/db";
import { ablyChannels } from "@/lib/ably/channels";
import { publishAblyEvent } from "@/lib/ably/server";
import { requireChatParticipant } from "@/lib/chat/access";
import { generateId } from "@/lib/utils";

async function publishChatUnreadEvents(threadId: string, senderId: string, messageId: string) {
  const participants = await db
    .select({ userId: chatParticipantsTable.userId })
    .from(chatParticipantsTable)
    .where(eq(chatParticipantsTable.threadId, threadId));

  await Promise.all(
    participants
      .filter((participant) => participant.userId !== senderId)
      .map((participant) =>
        publishAblyEvent(
          ablyChannels.userNotifications(participant.userId),
          "chat.unread",
          { threadId, messageId }
        ).catch(() => undefined)
      )
  );
}

export const runtime = "nodejs";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_MESSAGE_LENGTH = 4000;

interface Params {
  params: Promise<{ threadId: string }>;
}

function parseLimit(value: string | null) {
  const parsed = Number(value ?? DEFAULT_LIMIT);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

export async function GET(req: NextRequest, { params }: Params) {
  const { threadId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await requireChatParticipant(session.user.id, threadId);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const limit = parseLimit(searchParams.get("limit"));
  const cursor = searchParams.get("cursor");
  const cursorDate = cursor ? new Date(cursor) : null;

  const conditions = [
    eq(chatMessagesTable.threadId, threadId),
    isNull(chatMessagesTable.deletedAt),
  ];

  if (cursorDate && !Number.isNaN(cursorDate.getTime())) {
    conditions.push(lt(chatMessagesTable.createdAt, cursorDate));
  }

  const rows = await db
    .select()
    .from(chatMessagesTable)
    .where(and(...conditions))
    .orderBy(desc(chatMessagesTable.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const pageRows = rows.slice(0, limit).reverse();
  const senderIds = Array.from(new Set(pageRows.map((message) => message.senderId).filter(Boolean))) as string[];
  const senders = senderIds.length > 0
    ? await db
        .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
        .from(usersTable)
        .where(inArray(usersTable.id, senderIds))
    : [];
  const senderMap = new Map(senders.map((sender) => [sender.id, sender]));
  const messages = pageRows.map((message) => ({
    ...message,
    sender: message.senderId ? senderMap.get(message.senderId) ?? null : null,
  }));
  const nextCursor = hasMore ? messages[0]?.createdAt.toISOString() ?? null : null;

  return NextResponse.json({ messages, nextCursor, hasMore });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { threadId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await requireChatParticipant(session.user.id, threadId);
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payload = await req.json().catch(() => null) as {
    body?: unknown;
    clientNonce?: unknown;
    metadata?: unknown;
  } | null;

  const body = typeof payload?.body === "string" ? payload.body.trim() : "";
  if (!body) return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  if (body.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` }, { status: 400 });
  }

  const clientNonce = typeof payload?.clientNonce === "string" && payload.clientNonce.trim()
    ? payload.clientNonce.trim().slice(0, 128)
    : null;
  const metadata = payload?.metadata && typeof payload.metadata === "object" ? payload.metadata : null;
  const now = new Date();

  const insertedMessages = await db
    .insert(chatMessagesTable)
    .values({
      id: generateId(),
      threadId,
      senderId: session.user.id,
      body,
      metadata,
      clientNonce,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({
      target: [chatMessagesTable.threadId, chatMessagesTable.clientNonce],
    })
    .returning();

  const message = insertedMessages[0] ?? (clientNonce
    ? (await db
        .select()
        .from(chatMessagesTable)
        .where(
          and(
            eq(chatMessagesTable.threadId, threadId),
            eq(chatMessagesTable.clientNonce, clientNonce)
          )
        )
        .limit(1))[0]
    : null);

  if (!message) return NextResponse.json({ error: "Failed to create message" }, { status: 500 });

  const isNewMessage = insertedMessages.length > 0;
  if (isNewMessage) {
    await db
      .update(chatThreadsTable)
      .set({ lastMessageAt: now, updatedAt: now })
      .where(eq(chatThreadsTable.id, threadId));

    await publishAblyEvent(ablyChannels.threadMessages(threadId), "message.created", {
      message,
      sender: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });

    await publishChatUnreadEvents(threadId, session.user.id, message.id).catch((error) => {
      console.error("Failed to publish chat unread events", error);
    });
  }

  return NextResponse.json({ message, duplicate: !isNewMessage }, { status: isNewMessage ? 201 : 200 });
}

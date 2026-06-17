import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { db, chatParticipantsTable, chatThreadsTable, usersTable } from "@/lib/db";
import { getDmKey } from "@/lib/chat/access";
import { generateId } from "@/lib/utils";


interface Params {
  params: Promise<{ userId: string }>;
}

export async function POST(_req: Request, { params }: Params) {
  const { userId: targetUserId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "Cannot create a DM with yourself" }, { status: 400 });
  }

  const targetUsers = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, targetUserId))
    .limit(1);

  if (!targetUsers[0]) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const dmKey = getDmKey(session.user.id, targetUserId);
  const existingThreads = await db
    .select()
    .from(chatThreadsTable)
    .where(eq(chatThreadsTable.dmKey, dmKey))
    .limit(1);

  if (existingThreads[0]) {
    return NextResponse.json({ thread: existingThreads[0], user: targetUsers[0] });
  }

  const now = new Date();
  const threadId = generateId();

  const thread = await db.transaction(async (tx) => {
    const insertedThreads = await tx
      .insert(chatThreadsTable)
      .values({
        id: threadId,
        type: "dm",
        dmKey,
        createdBy: session.user.id,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: chatThreadsTable.dmKey })
      .returning();

    const createdThread = insertedThreads[0] ?? (
      await tx.select().from(chatThreadsTable).where(eq(chatThreadsTable.dmKey, dmKey)).limit(1)
    )[0];

    if (!createdThread) return null;

    await tx
      .insert(chatParticipantsTable)
      .values([
        { id: generateId(), threadId: createdThread.id, userId: session.user.id, joinedAt: now },
        { id: generateId(), threadId: createdThread.id, userId: targetUserId, joinedAt: now },
      ])
      .onConflictDoNothing({
        target: [chatParticipantsTable.threadId, chatParticipantsTable.userId],
      });

    return createdThread;
  });

  if (!thread) return NextResponse.json({ error: "Failed to create DM thread" }, { status: 500 });

  return NextResponse.json({ thread, user: targetUsers[0] }, { status: 201 });
}

import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import {
  db,
  chatParticipantsTable,
  chatThreadsTable,
  workspaceMembersTable,
  workspacesTable,
} from "@/lib/db";
import { getUserWorkspaceRole } from "@/lib/workspace";
import { generateId } from "@/lib/utils";


interface Params {
  params: Promise<{ workspaceId: string }>;
}

export async function POST(_req: Request, { params }: Params) {
  const { workspaceId } = await params;
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceRows = await db
    .select()
    .from(workspacesTable)
    .where(and(eq(workspacesTable.id, workspaceId), isNull(workspacesTable.deletedAt)))
    .limit(1);

  const workspace = workspaceRows[0];
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const role = await getUserWorkspaceRole(session.user.id, workspaceId);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existingThreads = await db
    .select()
    .from(chatThreadsTable)
    .where(and(eq(chatThreadsTable.workspaceId, workspaceId), eq(chatThreadsTable.type, "workspace")))
    .limit(1);

  if (existingThreads[0]) {
    await db
      .insert(chatParticipantsTable)
      .values({
        id: generateId(),
        threadId: existingThreads[0].id,
        userId: session.user.id,
        joinedAt: new Date(),
      })
      .onConflictDoNothing({
        target: [chatParticipantsTable.threadId, chatParticipantsTable.userId],
      });

    return NextResponse.json(existingThreads[0]);
  }

  const now = new Date();
  const threadId = generateId();

  const members = await db
    .select({ userId: workspaceMembersTable.userId })
    .from(workspaceMembersTable)
    .where(eq(workspaceMembersTable.workspaceId, workspaceId));

  const participantIds = Array.from(
    new Set([workspace.ownerId, ...members.map((member) => member.userId)])
  );

  const createdThreads = await db.transaction(async (tx) => {
    const insertedThreads = await tx
      .insert(chatThreadsTable)
      .values({
        id: threadId,
        type: "workspace",
        workspaceId,
        createdBy: session.user.id,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: chatThreadsTable.workspaceId })
      .returning();

    const thread = insertedThreads[0] ?? (
      await tx
        .select()
        .from(chatThreadsTable)
        .where(and(eq(chatThreadsTable.workspaceId, workspaceId), eq(chatThreadsTable.type, "workspace")))
        .limit(1)
    )[0];

    if (!thread) return [];

    await tx
      .insert(chatParticipantsTable)
      .values(
        participantIds.map((userId) => ({
          id: generateId(),
          threadId: thread.id,
          userId,
          joinedAt: now,
        }))
      )
      .onConflictDoNothing({
        target: [chatParticipantsTable.threadId, chatParticipantsTable.userId],
      });

    return [thread];
  });

  const thread = createdThreads[0];
  if (!thread) return NextResponse.json({ error: "Failed to create workspace thread" }, { status: 500 });

  return NextResponse.json(thread, { status: 201 });
}

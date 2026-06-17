import type { CapabilityOp } from "ably";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { db, chatParticipantsTable } from "@/lib/db";
import { ablyChannels } from "@/lib/ably/channels";
import { getAblyRest } from "@/lib/ably/server";


type Capability = Record<string, CapabilityOp[]>;


async function buildUserCapability(userId: string): Promise<Capability> {
  const participantRows = await db
    .select({ threadId: chatParticipantsTable.threadId })
    .from(chatParticipantsTable)
    .where(eq(chatParticipantsTable.userId, userId));

  const capability: Capability = {
    [ablyChannels.userNotifications(userId)]: ["subscribe", "presence"],
  };

  for (const { threadId } of participantRows) {
    capability[ablyChannels.threadMessages(threadId)] = ["subscribe", "presence"];
    capability[ablyChannels.threadTyping(threadId)] = ["publish", "subscribe"];
  }

  return capability;
}

async function handler() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tokenRequest = await getAblyRest().auth.createTokenRequest({
      clientId: session.user.id,
      ttl: 60 * 60 * 1000,
      capability: await buildUserCapability(session.user.id),
    });

    return NextResponse.json(tokenRequest, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to create Ably token request", error);
    return NextResponse.json({ error: "Failed to create Ably token" }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;

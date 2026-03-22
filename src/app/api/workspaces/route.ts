import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspacesTable, activityLogsTable } from "@/lib/db";
import { generateId, generateSlug } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const id = generateId();
  const slug = generateSlug(name);
  const now = new Date();

  await db.insert(workspacesTable).values({ id, name: name.trim(), slug: `${slug}-${id.slice(0, 6)}`, description: description?.trim() ?? null, ownerId: session.user.id, createdAt: now, updatedAt: now });
  await db.insert(activityLogsTable).values({ id: generateId(), workspaceId: id, userId: session.user.id, action: "created workspace", createdAt: now });

  return NextResponse.json({ id, name: name.trim(), slug });
}

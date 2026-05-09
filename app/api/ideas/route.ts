import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ideasTable } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ideas = await db
    .select()
    .from(ideasTable)
    .where(eq(ideasTable.userId, session.user.id))
    .orderBy(desc(ideasTable.createdAt));

  return NextResponse.json({ ideas });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, status = "idea", color = "gray" } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const [idea] = await db
    .insert(ideasTable)
    .values({
      id: randomUUID(),
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      status,
      color,
    })
    .returning();

  return NextResponse.json({ idea });
}

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ideasTable } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, description, status, color } = body;

  const updates: Partial<typeof ideasTable.$inferInsert> = { updatedAt: new Date() };
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description?.trim() || null;
  if (status !== undefined) updates.status = status;
  if (color !== undefined) updates.color = color;

  const [idea] = await db
    .update(ideasTable)
    .set(updates)
    .where(and(eq(ideasTable.id, id), eq(ideasTable.userId, session.user.id)))
    .returning();

  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ idea });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [deleted] = await db
    .delete(ideasTable)
    .where(and(eq(ideasTable.id, id), eq(ideasTable.userId, session.user.id)))
    .returning();

  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

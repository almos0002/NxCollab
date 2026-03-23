import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email } = await req.json();
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (name && typeof name === "string" && name.trim()) updates.name = name.trim();
  if (email && typeof email === "string" && email.trim()) updates.email = email.trim().toLowerCase();

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  if (updates.email) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, updates.email)).limit(1);
    if (existing[0] && existing[0].id !== id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
  }

  await db.update(usersTable).set(updates).where(eq(usersTable.id, id));
  return NextResponse.json({ success: true });
}

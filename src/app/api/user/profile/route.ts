import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await db.update(usersTable).set({ name: name.trim(), updatedAt: new Date() }).where(eq(usersTable.id, session.user.id));
  return NextResponse.json({ success: true });
}

import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ideasTable } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { IdeaBank } from "@/components/dashboard/idea-bank";

export const metadata: Metadata = { title: "Idea Bank" };

const VALID_COLORS = ["gray", "violet", "blue", "green", "yellow", "rose"] as const;
type Color = typeof VALID_COLORS[number];

function toColor(c: string): Color {
  return VALID_COLORS.includes(c as Color) ? (c as Color) : "gray";
}

export default async function IdeaBankPage() {
  const session = await getServerSession();
  if (!session?.user) return null;

  const rows = await db
    .select()
    .from(ideasTable)
    .where(eq(ideasTable.userId, session.user.id))
    .orderBy(desc(ideasTable.createdAt));

  const initialIdeas = rows.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    status: i.status as "idea" | "in_progress" | "done",
    color: toColor(i.color),
    createdAt: i.createdAt.toISOString(),
  }));

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Idea Bank</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Capture and track your ideas</p>
      </div>
      <IdeaBank initialIdeas={initialIdeas} />
    </div>
  );
}

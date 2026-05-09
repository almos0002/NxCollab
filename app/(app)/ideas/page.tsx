import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ideasTable } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { IdeaBank } from "@/components/dashboard/idea-bank";
import { Lightbulb } from "lucide-react";

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
    <div className="p-4 sm:p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Idea Bank</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Capture and track your ideas</p>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <IdeaBank initialIdeas={initialIdeas} />
      </div>
    </div>
  );
}

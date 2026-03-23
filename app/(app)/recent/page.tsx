import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = { title: "Recent — Canvas" };
import { db } from "@/lib/db";
import { canvasesTable, workspacesTable } from "@/lib/db";
import { eq, desc, and, isNull } from "drizzle-orm";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { FileText, Clock } from "lucide-react";

export default async function RecentPage() {
  const session = await getServerSession();
  if (!session?.user) return null;

  const recentCanvases = await db.select({
    id: canvasesTable.id, name: canvasesTable.name, workspaceId: canvasesTable.workspaceId,
    updatedAt: canvasesTable.updatedAt, workspaceName: workspacesTable.name,
  }).from(canvasesTable).innerJoin(workspacesTable, eq(canvasesTable.workspaceId, workspacesTable.id))
    .where(and(eq(workspacesTable.ownerId, session.user.id), isNull(canvasesTable.deletedAt), isNull(workspacesTable.deletedAt))).orderBy(desc(canvasesTable.updatedAt)).limit(20);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Recent</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Your recently updated canvases</p>
      </div>
      {recentCanvases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">No recent canvases</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Your recent work will appear here</p>
          <Link href="/workspaces" className="text-sm text-[hsl(var(--foreground))] font-medium hover:underline">Go to workspaces</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {recentCanvases.map(canvas => (
            <Link key={canvas.id} href={`/canvas/${canvas.id}`} className="group flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--ring)/0.2)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">{canvas.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{canvas.workspaceName}</p>
                </div>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(canvas.updatedAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

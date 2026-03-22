import { getServerSession } from "@/lib/session";
import { db } from "@workspace/db";
import { canvasesTable, workspacesTable, activityLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function RecentPage() {
  const session = await getServerSession();
  if (!session?.user) return null;

  const recentCanvases = await db.select({
    id: canvasesTable.id, name: canvasesTable.name, workspaceId: canvasesTable.workspaceId,
    updatedAt: canvasesTable.updatedAt, workspaceName: workspacesTable.name,
  }).from(canvasesTable).innerJoin(workspacesTable, eq(canvasesTable.workspaceId, workspacesTable.id))
    .where(eq(workspacesTable.ownerId, session.user.id)).orderBy(desc(canvasesTable.updatedAt)).limit(20);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Recent</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Your recently updated canvases</p>
      </div>
      {recentCanvases.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-12 text-center">
          <FileText className="w-10 h-10 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No recent canvases</p>
          <Link href="/workspaces" className="text-sm text-[hsl(var(--foreground))] font-medium mt-1 inline-block hover:underline">Go to workspaces</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {recentCanvases.map(canvas => (
            <Link key={canvas.id} href={`/canvas/${canvas.id}`} className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[hsl(var(--muted))] flex items-center justify-center"><FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /></div>
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

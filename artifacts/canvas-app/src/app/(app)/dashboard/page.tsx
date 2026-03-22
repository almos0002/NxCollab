import { getServerSession } from "@/lib/session";
import { db } from "@workspace/db";
import { workspacesTable, workspaceMembersTable, canvasesTable, activityLogsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Plus, Layers, Clock, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session?.user) return null;
  const userId = session.user.id;

  const ownedWorkspaces = await db.select().from(workspacesTable).where(eq(workspacesTable.ownerId, userId)).limit(5);
  const memberWorkspaceIds = await db.select({ workspaceId: workspaceMembersTable.workspaceId }).from(workspaceMembersTable).where(eq(workspaceMembersTable.userId, userId));

  const recentCanvases = await db.select({
    id: canvasesTable.id, name: canvasesTable.name, workspaceId: canvasesTable.workspaceId,
    updatedAt: canvasesTable.updatedAt, workspaceName: workspacesTable.name,
  }).from(canvasesTable).innerJoin(workspacesTable, eq(canvasesTable.workspaceId, workspacesTable.id))
    .where(eq(workspacesTable.ownerId, userId)).orderBy(desc(canvasesTable.updatedAt)).limit(6);

  const totalWorkspaces = ownedWorkspaces.length + memberWorkspaceIds.length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Dashboard</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Welcome back, {session.user.name}</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Workspaces", value: totalWorkspaces, icon: Layers },
          { label: "Canvases", value: recentCanvases.length, icon: Clock },
          { label: "Members", value: memberWorkspaceIds.length, icon: Activity },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-md bg-[hsl(var(--muted))] flex items-center justify-center">
                <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
            </div>
            <p className="text-3xl font-semibold text-[hsl(var(--foreground))]">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Recent Canvases</h2>
            <Link href="/workspaces" className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentCanvases.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-6 text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No canvases yet</p>
                <Link href="/workspaces" className="text-sm text-[hsl(var(--foreground))] font-medium mt-1 inline-block hover:underline">Create your first workspace</Link>
              </div>
            ) : recentCanvases.map(canvas => (
              <Link key={canvas.id} href={`/canvas/${canvas.id}`} className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))] transition-colors">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">{canvas.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{canvas.workspaceName}</p>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(canvas.updatedAt)}</p>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Your Workspaces</h2>
            <Link href="/workspaces/new" className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><Plus className="w-3 h-3" /> New</Link>
          </div>
          <div className="space-y-2">
            {ownedWorkspaces.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-6 text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No workspaces yet</p>
                <Link href="/workspaces/new" className="text-sm text-[hsl(var(--foreground))] font-medium mt-1 inline-block hover:underline">Create one now</Link>
              </div>
            ) : ownedWorkspaces.map(ws => (
              <Link key={ws.id} href={`/workspaces/${ws.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))] transition-colors">
                <div className="w-8 h-8 rounded-md bg-[hsl(var(--muted))] flex items-center justify-center text-sm font-medium">
                  {ws.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">{ws.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Owner</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

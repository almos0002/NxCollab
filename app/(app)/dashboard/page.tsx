import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };
import { db } from "@/lib/db";
import { workspacesTable, workspaceMembersTable, canvasesTable, ideasTable } from "@/lib/db";
import { eq, desc, inArray, and, isNull, count } from "drizzle-orm";
import Link from "next/link";
import { Plus, Layers, FileText, Activity, ArrowRight, Lightbulb } from "lucide-react";
import { RecentCanvases } from "@/components/dashboard/recent-canvases";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session?.user) return null;
  const userId = session.user.id;

  const [ownedWorkspaces, memberEntries, ideasCount] = await Promise.all([
    db.select().from(workspacesTable).where(and(eq(workspacesTable.ownerId, userId), isNull(workspacesTable.deletedAt))),
    db.select({ workspaceId: workspaceMembersTable.workspaceId }).from(workspaceMembersTable).where(eq(workspaceMembersTable.userId, userId)),
    db.select({ value: count() }).from(ideasTable).where(eq(ideasTable.userId, userId)),
  ]);

  const allWsIds = [...new Set([...ownedWorkspaces.map(w => w.id), ...memberEntries.map(m => m.workspaceId)])];

  let recentCanvases: { id: string; name: string; workspaceName: string; updatedAt: string }[] = [];
  if (allWsIds.length > 0) {
    const rows = await db.select({
      id: canvasesTable.id, name: canvasesTable.name, workspaceId: canvasesTable.workspaceId,
      updatedAt: canvasesTable.updatedAt, workspaceName: workspacesTable.name,
    }).from(canvasesTable).innerJoin(workspacesTable, eq(canvasesTable.workspaceId, workspacesTable.id))
      .where(and(inArray(canvasesTable.workspaceId, allWsIds), isNull(canvasesTable.deletedAt))).orderBy(desc(canvasesTable.updatedAt)).limit(50);
    recentCanvases = rows.map(r => ({ id: r.id, name: r.name, workspaceName: r.workspaceName, updatedAt: r.updatedAt.toISOString() }));
  }

  const totalWorkspaces = allWsIds.length;
  const totalIdeas = ideasCount[0]?.value ?? 0;

  const stats = [
    { label: "Workspaces", value: totalWorkspaces, icon: Layers },
    { label: "Canvases", value: recentCanvases.length, icon: FileText },
    { label: "Memberships", value: memberEntries.length, icon: Activity },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Welcome back, {session.user.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-3xl font-bold text-[hsl(var(--foreground))] tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Recent Canvases</h2>
            <Link href="/workspaces" className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <RecentCanvases canvases={recentCanvases} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Your Workspaces</h2>
            <Link href="/workspaces" className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              <Plus className="w-3 h-3" /> New
            </Link>
          </div>
          <div className="space-y-2">
            {ownedWorkspaces.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">No workspaces yet</p>
                <Link href="/workspaces" className="text-sm text-[hsl(var(--foreground))] font-medium hover:underline">Create one now</Link>
              </div>
            ) : ownedWorkspaces.map(ws => (
              <Link key={ws.id} href={`/workspaces/${ws.id}`} className="group flex items-center gap-3 p-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--ring)/0.2)] transition-all">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                  {ws.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{ws.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Owner</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Idea Bank teaser */}
      <Link
        href="/ideas"
        className="group flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Idea Bank</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {totalIdeas === 0 ? "Capture your ideas before they slip away" : `${totalIdeas} idea${totalIdeas === 1 ? "" : "s"} saved`}
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
}

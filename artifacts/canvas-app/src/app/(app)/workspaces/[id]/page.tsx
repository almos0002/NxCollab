import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { db } from "@workspace/db";
import { workspacesTable, workspaceMembersTable, canvasesTable, activityLogsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getUserWorkspaceRole, canEdit, canManageMembers } from "@/lib/workspace";
import { Plus, FileText, Users, Activity } from "lucide-react";
import { WorkspaceActions } from "@/components/workspace/workspace-actions";

interface Props { params: Promise<{ id: string }> }

export default async function WorkspacePage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const workspace = await db.select().from(workspacesTable).where(eq(workspacesTable.id, id)).limit(1);
  if (!workspace[0]) notFound();

  const role = await getUserWorkspaceRole(session.user.id, id);
  if (!role) notFound();

  const canvases = await db.select().from(canvasesTable).where(eq(canvasesTable.workspaceId, id)).orderBy(desc(canvasesTable.updatedAt));
  const members = await db.select({
    id: workspaceMembersTable.id, role: workspaceMembersTable.role, joinedAt: workspaceMembersTable.joinedAt,
    userId: usersTable.id, userName: usersTable.name, userEmail: usersTable.email,
  }).from(workspaceMembersTable).innerJoin(usersTable, eq(workspaceMembersTable.userId, usersTable.id)).where(eq(workspaceMembersTable.workspaceId, id));

  const recentActivity = await db.select({
    id: activityLogsTable.id, action: activityLogsTable.action, createdAt: activityLogsTable.createdAt, userName: usersTable.name,
  }).from(activityLogsTable).leftJoin(usersTable, eq(activityLogsTable.userId, usersTable.id))
    .where(eq(activityLogsTable.workspaceId, id)).orderBy(desc(activityLogsTable.createdAt)).limit(10);

  const ws = workspace[0];
  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
            <Link href="/workspaces" className="hover:text-[hsl(var(--foreground))] transition-colors">Workspaces</Link>
            <span className="opacity-40">/</span>
            <span className="text-[hsl(var(--foreground))] font-medium">{ws.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">{ws.name}</h1>
          {ws.description && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{ws.description}</p>}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs px-2.5 py-1 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium capitalize">{role}</span>
          {canManageMembers(role) && <WorkspaceActions workspaceId={id} role={role} />}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> Canvases
              </h2>
              {canEdit(role) && (
                <Link href={`/workspaces/${id}/canvas/new`} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity font-medium">
                  <Plus className="w-3 h-3" /> New canvas
                </Link>
              )}
            </div>
            {canvases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-10 text-center">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">No canvases yet</p>
                {canEdit(role) && <Link href={`/workspaces/${id}/canvas/new`} className="text-sm text-[hsl(var(--foreground))] font-medium hover:underline">Create your first canvas</Link>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {canvases.map(canvas => (
                  <Link key={canvas.id} href={`/canvas/${canvas.id}`} className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:shadow-sm hover:border-[hsl(var(--ring)/0.2)] transition-all">
                    <div className="w-full h-20 rounded-lg bg-[hsl(var(--muted))] mb-3 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{canvas.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{formatDate(canvas.updatedAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> Members
            </h2>
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                      {m.userName[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-[hsl(var(--foreground))] font-medium">{m.userName}</span>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] capitalize bg-[hsl(var(--muted))] px-2 py-0.5 rounded-md">{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">No activity yet</p>
              ) : recentActivity.map(log => (
                <div key={log.id} className="text-xs border-l-2 border-[hsl(var(--border))] pl-3">
                  <span className="font-medium text-[hsl(var(--foreground))]">{log.userName}</span>{" "}
                  <span className="text-[hsl(var(--muted-foreground))]">{log.action}</span>
                  <div className="text-[hsl(var(--muted-foreground))] mt-0.5">{formatDate(log.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

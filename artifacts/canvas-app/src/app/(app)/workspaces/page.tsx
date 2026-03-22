import { getServerSession } from "@/lib/session";
import { db } from "@workspace/db";
import { workspacesTable, workspaceMembersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Plus, Layers, ArrowRight } from "lucide-react";

export default async function WorkspacesPage() {
  const session = await getServerSession();
  if (!session?.user) return null;
  const userId = session.user.id;

  const ownedWorkspaces = await db.select().from(workspacesTable).where(eq(workspacesTable.ownerId, userId));
  const memberWorkspaces = await db.select({
    id: workspacesTable.id, name: workspacesTable.name, slug: workspacesTable.slug,
    description: workspacesTable.description, ownerId: workspacesTable.ownerId,
    createdAt: workspacesTable.createdAt, updatedAt: workspacesTable.updatedAt,
    role: workspaceMembersTable.role,
  }).from(workspaceMembersTable).innerJoin(workspacesTable, eq(workspaceMembersTable.workspaceId, workspacesTable.id)).where(eq(workspaceMembersTable.userId, userId));

  const allWorkspaces = [
    ...ownedWorkspaces.map(w => ({ ...w, role: "owner" as const })),
    ...memberWorkspaces,
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Workspaces</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{allWorkspaces.length} workspace{allWorkspaces.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/workspaces/new" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New workspace
        </Link>
      </div>
      {allWorkspaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
            <Layers className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1.5">No workspaces yet</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">Create your first workspace to start collaborating</p>
          <Link href="/workspaces/new" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Create workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allWorkspaces.map(ws => (
            <Link key={ws.id} href={`/workspaces/${ws.id}`} className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:border-[hsl(var(--ring)/0.2)] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center text-base font-semibold text-[hsl(var(--muted-foreground))]">
                  {ws.name[0]?.toUpperCase()}
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium capitalize">{ws.role}</span>
              </div>
              <h3 className="font-medium text-[hsl(var(--foreground))] mb-1">{ws.name}</h3>
              {ws.description && <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3 line-clamp-2 leading-relaxed">{ws.description}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Created {formatDate(ws.createdAt)}</p>
                <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = { title: "Workspaces — Canvas" };
import { db } from "@/lib/db";
import { workspacesTable, workspaceMembersTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Plus } from "lucide-react";
import { WorkspacesList } from "@/components/workspace/workspaces-list";

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
    ...ownedWorkspaces.map(w => ({ id: w.id, name: w.name, description: w.description, role: "owner", createdAt: w.createdAt.toISOString() })),
    ...memberWorkspaces.map(w => ({ id: w.id, name: w.name, description: w.description, role: w.role, createdAt: w.createdAt.toISOString() })),
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Workspaces</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{allWorkspaces.length} workspace{allWorkspaces.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/workspaces/new" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New workspace
        </Link>
      </div>
      <WorkspacesList workspaces={allWorkspaces} />
    </div>
  );
}

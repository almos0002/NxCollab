import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = { title: "Workspaces" };
import { db } from "@/lib/db";
import { workspacesTable, workspaceMembersTable } from "@/lib/db";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { WorkspacesPageClient } from "@/components/workspace/workspaces-page-client";

export default async function WorkspacesPage() {
  const session = await getServerSession();
  if (!session?.user) return null;
  const userId = session.user.id;

  const [ownedWorkspaces, memberWorkspaces, trashedWorkspaces] = await Promise.all([
    db.select({
      id: workspacesTable.id, name: workspacesTable.name,
      description: workspacesTable.description, createdAt: workspacesTable.createdAt,
    }).from(workspacesTable).where(and(eq(workspacesTable.ownerId, userId), isNull(workspacesTable.deletedAt))),
    db.select({
      id: workspacesTable.id, name: workspacesTable.name,
      description: workspacesTable.description, createdAt: workspacesTable.createdAt,
      role: workspaceMembersTable.role,
    }).from(workspaceMembersTable).innerJoin(workspacesTable, eq(workspaceMembersTable.workspaceId, workspacesTable.id)).where(and(eq(workspaceMembersTable.userId, userId), isNull(workspacesTable.deletedAt))),
    db.select({
      id: workspacesTable.id, name: workspacesTable.name,
      description: workspacesTable.description, deletedAt: workspacesTable.deletedAt,
      createdAt: workspacesTable.createdAt,
    }).from(workspacesTable).where(and(eq(workspacesTable.ownerId, userId), isNotNull(workspacesTable.deletedAt))),
  ]);

  const allWorkspaces = [
    ...ownedWorkspaces.map(w => ({ id: w.id, name: w.name, description: w.description, role: "owner", createdAt: w.createdAt.toISOString() })),
    ...memberWorkspaces.map(w => ({ id: w.id, name: w.name, description: w.description, role: w.role, createdAt: w.createdAt.toISOString() })),
  ];


  return (
    <WorkspacesPageClient
      workspaces={allWorkspaces}
      trashedWorkspaces={trashedWorkspaces.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        deletedAt: w.deletedAt?.toISOString() || "",
        createdAt: w.createdAt.toISOString(),
      }))}
    />
  );
}

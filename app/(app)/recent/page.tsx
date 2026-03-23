import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = { title: "Recent — Canvas" };
import { db } from "@/lib/db";
import { canvasesTable, workspacesTable, workspaceMembersTable } from "@/lib/db";
import { eq, desc, and, isNull, inArray } from "drizzle-orm";
import { RecentPageClient } from "@/components/dashboard/recent-page-client";

export default async function RecentPage() {
  const session = await getServerSession();
  if (!session?.user) return null;
  const userId = session.user.id;

  const ownedWorkspaces = await db.select({ id: workspacesTable.id }).from(workspacesTable).where(and(eq(workspacesTable.ownerId, userId), isNull(workspacesTable.deletedAt)));
  const memberEntries = await db.select({ workspaceId: workspaceMembersTable.workspaceId }).from(workspaceMembersTable).where(eq(workspaceMembersTable.userId, userId));

  const allWsIds = [...new Set([...ownedWorkspaces.map(w => w.id), ...memberEntries.map(m => m.workspaceId)])];

  let recentCanvases: { id: string; name: string; workspaceName: string; updatedAt: string }[] = [];
  if (allWsIds.length > 0) {
    const rows = await db.select({
      id: canvasesTable.id, name: canvasesTable.name,
      updatedAt: canvasesTable.updatedAt, workspaceName: workspacesTable.name,
    }).from(canvasesTable).innerJoin(workspacesTable, eq(canvasesTable.workspaceId, workspacesTable.id))
      .where(and(inArray(canvasesTable.workspaceId, allWsIds), isNull(canvasesTable.deletedAt), isNull(workspacesTable.deletedAt)))
      .orderBy(desc(canvasesTable.updatedAt))
      .limit(500);
    recentCanvases = rows.map(r => ({ id: r.id, name: r.name, workspaceName: r.workspaceName, updatedAt: r.updatedAt.toISOString() }));
  }

  return <RecentPageClient canvases={recentCanvases} />;
}

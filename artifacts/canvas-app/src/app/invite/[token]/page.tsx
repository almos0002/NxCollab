import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { db } from "@workspace/db";
import { workspaceInvitesTable, workspaceMembersTable, workspacesTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import Link from "next/link";

interface Props { params: Promise<{ token: string }> }

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const session = await getServerSession();

  const invite = await db.select({
    id: workspaceInvitesTable.id, workspaceId: workspaceInvitesTable.workspaceId,
    role: workspaceInvitesTable.role, expiresAt: workspaceInvitesTable.expiresAt,
    usedAt: workspaceInvitesTable.usedAt, workspaceName: workspacesTable.name,
  }).from(workspaceInvitesTable).innerJoin(workspacesTable, eq(workspaceInvitesTable.workspaceId, workspacesTable.id))
    .where(and(eq(workspaceInvitesTable.token, token), gt(workspaceInvitesTable.expiresAt, new Date()))).limit(1);

  if (!invite[0]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center p-8">
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Invalid or expired invite</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">This invite link is no longer valid.</p>
          <Link href="/dashboard" className="text-sm font-medium text-[hsl(var(--foreground))] hover:underline">Go to dashboard</Link>
        </div>
      </div>
    );
  }

  if (invite[0].usedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center p-8">
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Invite already used</h1>
          <Link href="/dashboard" className="text-sm font-medium text-[hsl(var(--foreground))] hover:underline">Go to dashboard</Link>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect(`/auth/sign-in?redirect=/invite/${token}`);
  }

  const existing = await db.select().from(workspaceMembersTable)
    .where(and(eq(workspaceMembersTable.workspaceId, invite[0].workspaceId), eq(workspaceMembersTable.userId, session.user.id))).limit(1);

  if (!existing[0]) {
    const now = new Date();
    await db.insert(workspaceMembersTable).values({ id: generateId(), workspaceId: invite[0].workspaceId, userId: session.user.id, role: invite[0].role, joinedAt: now });
    await db.update(workspaceInvitesTable).set({ usedAt: now }).where(eq(workspaceInvitesTable.id, invite[0].id));
  }

  redirect(`/workspaces/${invite[0].workspaceId}`);
}

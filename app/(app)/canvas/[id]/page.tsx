import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { canvasesTable, workspacesTable } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { getUserWorkspaceRole, canEdit } from "@/lib/workspace";
import { CanvasPageClient } from "./canvas-page-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await db.select({ name: canvasesTable.name }).from(canvasesTable).where(eq(canvasesTable.id, id)).limit(1);
  return { title: c[0] ? `${c[0].name} — Canvas` : "Canvas" };
}

interface Props { params: Promise<{ id: string }> }

export default async function CanvasPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const canvas = await db.select({
    id: canvasesTable.id, name: canvasesTable.name, workspaceId: canvasesTable.workspaceId,
    content: canvasesTable.content, libraryData: canvasesTable.libraryData, updatedAt: canvasesTable.updatedAt,
    workspaceName: workspacesTable.name,
  }).from(canvasesTable).innerJoin(workspacesTable, eq(canvasesTable.workspaceId, workspacesTable.id))
    .where(and(eq(canvasesTable.id, id), isNull(canvasesTable.deletedAt))).limit(1);

  if (!canvas[0]) notFound();

  const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
  if (!role) notFound();

  const isEditable = canEdit(role);

  return (
    <CanvasPageClient
      canvas={{
        id: canvas[0].id,
        name: canvas[0].name,
        workspaceId: canvas[0].workspaceId,
        workspaceName: canvas[0].workspaceName,
        content: canvas[0].content ?? "{}",
        libraryData: canvas[0].libraryData ?? null,
      }}
      role={role}
      isEditable={isEditable}
      userId={session.user.id}
      userName={session.user.name ?? "Anonymous"}
    />
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { db } from "@workspace/db";
import { canvasesTable, workspacesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getUserWorkspaceRole, canEdit } from "@/lib/workspace";
import { CollaborativeCanvas } from "@/components/canvas/collaborative-canvas";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    content: canvasesTable.content, updatedAt: canvasesTable.updatedAt,
    workspaceName: workspacesTable.name,
  }).from(canvasesTable).innerJoin(workspacesTable, eq(canvasesTable.workspaceId, workspacesTable.id))
    .where(eq(canvasesTable.id, id)).limit(1);

  if (!canvas[0]) notFound();

  const role = await getUserWorkspaceRole(session.user.id, canvas[0].workspaceId);
  if (!role) notFound();

  const isEditable = canEdit(role);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-5 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/workspaces/${canvas[0].workspaceId}`} className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> {canvas[0].workspaceName}
          </Link>
          <span className="text-[hsl(var(--border))]">|</span>
          <h1 className="text-sm font-semibold text-[hsl(var(--foreground))]">{canvas[0].name}</h1>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium capitalize">{role}</span>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <CollaborativeCanvas
          canvasId={id}
          initialContent={canvas[0].content ?? "{}"}
          isEditable={isEditable}
          userId={session.user.id}
          userName={session.user.name ?? "Anonymous"}
        />
      </div>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getUserWorkspaceRole, canEdit } from "@/lib/workspace";
import { NewCanvasForm } from "@/components/workspace/new-canvas-form";
import Link from "next/link";

interface Props { params: Promise<{ id: string }> }

export default async function NewCanvasPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const role = await getUserWorkspaceRole(session.user.id, id);
  if (!role || !canEdit(role)) notFound();

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
          <Link href="/workspaces" className="hover:text-[hsl(var(--foreground))]">Workspaces</Link>
          <span>/</span>
          <Link href={`/workspaces/${id}`} className="hover:text-[hsl(var(--foreground))]">Workspace</Link>
          <span>/</span><span>New Canvas</span>
        </div>
        <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">New Canvas</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Create a new collaborative canvas</p>
      </div>
      <NewCanvasForm workspaceId={id} />
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Users, Activity, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { WorkspaceActions } from "@/components/workspace/workspace-actions";
import { CanvasesList } from "@/components/workspace/canvases-list";
import { MembersList } from "@/components/workspace/members-list";
import { ResourceFormDialog } from "@/components/shared/resource-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface WorkspaceDetailClientProps {
  workspace: { id: string; name: string; description: string | null; ownerId: string };
  role: string;
  canvases: { id: string; name: string; description: string | null; updatedAt: string }[];
  members: { id: string; role: string; userId: string; userName: string; userEmail: string }[];
  recentActivity: { id: string; action: string; createdAt: string; userName: string | null }[];
}

export function WorkspaceDetailClient({
  workspace,
  role,
  canvases,
  members,
  recentActivity,
}: WorkspaceDetailClientProps) {
  const router = useRouter();
  const [showCreateCanvas, setShowCreateCanvas] = useState(false);
  const [showEditWorkspace, setShowEditWorkspace] = useState(false);
  const [showDeleteWorkspace, setShowDeleteWorkspace] = useState(false);
  const canEditWs = role === "owner" || role === "admin" || role === "member";
  const canManage = role === "owner" || role === "admin";
  const isOwner = role === "owner";

  async function handleCreateCanvas(data: { name: string; description: string }) {
    const res = await fetch(`/api/workspaces/${workspace.id}/canvases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to create canvas");
    setShowCreateCanvas(false);
    router.push(`/canvas/${result.id}`);
    router.refresh();
  }

  async function handleEditWorkspace(data: { name: string; description: string }) {
    const res = await fetch(`/api/workspaces/${workspace.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to update workspace");
    setShowEditWorkspace(false);
    router.refresh();
  }

  async function handleDeleteWorkspace() {
    const res = await fetch(`/api/workspaces/${workspace.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete workspace");
    }
    setShowDeleteWorkspace(false);
    router.push("/workspaces");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
            <Link href="/workspaces" className="hover:text-[hsl(var(--foreground))] transition-colors">Workspaces</Link>
            <span className="opacity-40">/</span>
            <span className="text-[hsl(var(--foreground))] font-medium">{workspace.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">{workspace.name}</h1>
          {workspace.description && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{workspace.description}</p>}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs px-2.5 py-1 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium capitalize">{role}</span>
          {canEditWs && (
            <button onClick={() => setShowEditWorkspace(true)} className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors" title="Edit workspace">
              <Pencil className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </button>
          )}
          {isOwner && (
            <button onClick={() => setShowDeleteWorkspace(true)} className="p-2 rounded-lg hover:bg-[hsl(var(--destructive)/0.1)] transition-colors" title="Delete workspace">
              <Trash2 className="w-4 h-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]" />
            </button>
          )}
          {canManage && <WorkspaceActions workspaceId={workspace.id} role={role} />}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> Canvases
                <span className="text-xs text-[hsl(var(--muted-foreground))] font-normal">({canvases.length})</span>
              </h2>
              {canEditWs && (
                <button onClick={() => setShowCreateCanvas(true)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity font-medium">
                  <Plus className="w-3 h-3" /> New canvas
                </button>
              )}
            </div>
            {canvases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-10 text-center">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">No canvases yet</p>
                {canEditWs && <button onClick={() => setShowCreateCanvas(true)} className="text-sm text-[hsl(var(--foreground))] font-medium hover:underline">Create your first canvas</button>}
              </div>
            ) : (
              <CanvasesList canvases={canvases} workspaceId={workspace.id} userRole={role} />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <MembersList
            members={members}
            workspaceId={workspace.id}
            currentUserRole={role}
            ownerId={workspace.ownerId}
          />

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

      <ResourceFormDialog
        open={showCreateCanvas}
        onClose={() => setShowCreateCanvas(false)}
        onSubmit={handleCreateCanvas}
        title="Create Canvas"
        submitLabel="Create canvas"
        namePlaceholder="My Canvas"
        descriptionPlaceholder="What will you create?"
      />
      <ResourceFormDialog
        open={showEditWorkspace}
        onClose={() => setShowEditWorkspace(false)}
        onSubmit={handleEditWorkspace}
        title="Edit Workspace"
        submitLabel="Save changes"
        initialName={workspace.name}
        initialDescription={workspace.description || ""}
        namePlaceholder="Workspace name"
        descriptionPlaceholder="Workspace description"
      />
      <ConfirmDialog
        open={showDeleteWorkspace}
        onClose={() => setShowDeleteWorkspace(false)}
        onConfirm={handleDeleteWorkspace}
        title="Move workspace to trash?"
        description={`"${workspace.name}" and all its canvases will be moved to trash. You can restore them from the trash later.`}
        confirmLabel="Move to trash"
        variant="danger"
      />
    </div>
  );
}

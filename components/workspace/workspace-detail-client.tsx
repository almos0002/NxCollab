"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, Users, Activity, Pencil, Trash2, ChevronDown, ChevronUp, RotateCcw, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { WorkspaceActions } from "@/components/workspace/workspace-actions";
import { CanvasesList } from "@/components/workspace/canvases-list";
import { MembersList } from "@/components/workspace/members-list";
import { WorkspaceChat } from "@/components/workspace/workspace-chat";
import { ResourceFormDialog } from "@/components/shared/resource-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const ACTIVITY_PREVIEW_COUNT = 5;

function ActivitySection({ recentActivity }: { recentActivity: { id: string; action: string; createdAt: string; userName: string | null }[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = recentActivity.length > ACTIVITY_PREVIEW_COUNT;
  const visible = expanded ? recentActivity : recentActivity.slice(0, ACTIVITY_PREVIEW_COUNT);

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> Activity
        {recentActivity.length > 0 && (
          <span className="text-xs text-[hsl(var(--muted-foreground))] font-normal">({recentActivity.length})</span>
        )}
      </h2>
      <div className="space-y-3">
        {recentActivity.length === 0 ? (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">No activity yet</p>
        ) : visible.map(log => (
          <div key={log.id} className="text-xs border-l-2 border-[hsl(var(--border))] pl-3">
            <span className="font-medium text-[hsl(var(--foreground))]">{log.userName}</span>{" "}
            <span className="text-[hsl(var(--muted-foreground))]">{log.action}</span>
            <div className="text-[hsl(var(--muted-foreground))] mt-0.5">{formatDate(log.createdAt)}</div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors w-full justify-center pt-2 border-t border-[hsl(var(--border))]"
        >
          {expanded ? (
            <><ChevronUp className="w-3 h-3" /> Show less</>
          ) : (
            <><ChevronDown className="w-3 h-3" /> View all activity</>
          )}
        </button>
      )}
    </div>
  );
}

interface CanvasItem {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

interface TrashedCanvas {
  id: string;
  name: string;
  description: string | null;
  deletedAt: string;
}

interface WorkspaceDetailClientProps {
  workspace: { id: string; name: string; description: string | null; ownerId: string };
  currentUser: { id: string; name: string; email?: string | null };
  role: string;
  canvases: CanvasItem[];
  trashedCanvases: TrashedCanvas[];
  members: { id: string; role: string; userId: string; userName: string; userEmail: string }[];
  recentActivity: { id: string; action: string; createdAt: string; userName: string | null }[];
}

export function WorkspaceDetailClient({
  workspace,
  currentUser,
  role,
  canvases: initialCanvases,
  trashedCanvases: initialTrashed,
  members,
  recentActivity,
}: WorkspaceDetailClientProps) {
  const router = useRouter();
  const [showCreateCanvas, setShowCreateCanvas] = useState(false);
  const [showEditWorkspace, setShowEditWorkspace] = useState(false);
  const [showDeleteWorkspace, setShowDeleteWorkspace] = useState(false);
  const [showCanvasTrash, setShowCanvasTrash] = useState(false);
  const [activeTab, setActiveTab] = useState<"canvases" | "chat">("canvases");
  const [canvases, setCanvases] = useState(initialCanvases);
  const [trashedCanvases, setTrashedCanvases] = useState(initialTrashed);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<TrashedCanvas | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<TrashedCanvas | null>(null);
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

  function handleCanvasDeleted(canvas: CanvasItem) {
    setCanvases(prev => prev.filter(c => c.id !== canvas.id));
    setTrashedCanvases(prev => [{
      id: canvas.id,
      name: canvas.name,
      description: canvas.description,
      deletedAt: new Date().toISOString(),
    }, ...prev]);
  }

  async function handleRestoreCanvas() {
    if (!restoreTarget) return;
    const res = await fetch("/api/trash/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "canvas", id: restoreTarget.id }),
    });
    if (res.ok) {
      const restored = restoreTarget;
      setTrashedCanvases(prev => prev.filter(c => c.id !== restored.id));
      setCanvases(prev => [{
        id: restored.id,
        name: restored.name,
        description: restored.description,
        updatedAt: new Date().toISOString(),
      }, ...prev]);
      setRestoreTarget(null);
      router.refresh();
    }
  }

  async function handlePermanentDeleteCanvas() {
    if (!permanentDeleteTarget) return;
    const res = await fetch("/api/trash/permanent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "canvas", id: permanentDeleteTarget.id }),
    });
    if (res.ok) {
      setTrashedCanvases(prev => prev.filter(c => c.id !== permanentDeleteTarget.id));
      setPermanentDeleteTarget(null);
      router.refresh();
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
            <Link href="/workspaces" className="hover:text-[hsl(var(--foreground))] transition-colors">Workspaces</Link>
            <span className="opacity-40">/</span>
            <span className="text-[hsl(var(--foreground))] font-medium truncate">{workspace.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight truncate">{workspace.name}</h1>
          {workspace.description && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">{workspace.description}</p>}
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="inline-flex rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.35)] p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("canvases")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${activeTab === "canvases" ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}
                >
                  <FileText className="w-4 h-4" />
                  Canvases
                  <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">({canvases.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${activeTab === "chat" ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
              {activeTab === "canvases" && (
                <div className="flex items-center gap-2">
                  {trashedCanvases.length > 0 && canEditWs && (
                    <button
                      onClick={() => setShowCanvasTrash(!showCanvasTrash)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors ${showCanvasTrash ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
                    >
                      <Trash2 className="w-3 h-3" /> Trash ({trashedCanvases.length})
                    </button>
                  )}
                  {canEditWs && (
                    <button onClick={() => setShowCreateCanvas(true)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity font-medium">
                      <Plus className="w-3 h-3" /> New canvas
                    </button>
                  )}
                </div>
              )}
            </div>

            {activeTab === "chat" ? (
              <WorkspaceChat
                workspaceId={workspace.id}
                workspaceName={workspace.name}
                currentUser={currentUser}
              />
            ) : (
              <>
                {showCanvasTrash && trashedCanvases.length > 0 && (
                  <div className="mb-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent)/0.15)] p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                      <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Deleted canvases</span>
                    </div>
                    {trashedCanvases.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{item.name}</p>
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Deleted {formatDate(item.deletedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => setRestoreTarget(item)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Restore
                          </button>
                          <button
                            onClick={() => setPermanentDeleteTarget(item)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[hsl(var(--destructive))] text-white hover:opacity-90 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" /> Delete forever
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {canvases.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-10 text-center">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">No canvases yet</p>
                    {canEditWs && <button onClick={() => setShowCreateCanvas(true)} className="text-sm text-[hsl(var(--foreground))] font-medium hover:underline">Create your first canvas</button>}
                  </div>
                ) : (
                  <CanvasesList canvases={canvases} workspaceId={workspace.id} userRole={role} onCanvasDeleted={handleCanvasDeleted} />
                )}
              </>
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


          <ActivitySection recentActivity={recentActivity} />
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
      <ConfirmDialog
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestoreCanvas}
        title="Restore canvas?"
        description={`"${restoreTarget?.name}" will be restored and will appear in the canvases list again.`}
        confirmLabel="Restore"
      />
      <ConfirmDialog
        open={!!permanentDeleteTarget}
        onClose={() => setPermanentDeleteTarget(null)}
        onConfirm={handlePermanentDeleteCanvas}
        title="Permanently delete?"
        description={`"${permanentDeleteTarget?.name}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete forever"
        variant="danger"
      />
    </div>
  );
}

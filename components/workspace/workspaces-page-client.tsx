"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, RotateCcw, Layers } from "lucide-react";
import { WorkspacesList } from "@/components/workspace/workspaces-list";
import { ResourceFormDialog } from "@/components/shared/resource-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/utils";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  role: string;
  createdAt: string;
}

interface TrashedWorkspace {
  id: string;
  name: string;
  description: string | null;
  deletedAt: string;
  createdAt: string;
}

interface WorkspacesPageClientProps {
  workspaces: Workspace[];
  trashedWorkspaces: TrashedWorkspace[];
}

export function WorkspacesPageClient({ workspaces, trashedWorkspaces: initialTrashed }: WorkspacesPageClientProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"active" | "trash">("active");
  const [trashedWorkspaces, setTrashedWorkspaces] = useState(initialTrashed);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<TrashedWorkspace | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<TrashedWorkspace | null>(null);

  async function handleCreate(data: { name: string; description: string }) {
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to create workspace");
    setShowCreate(false);
    router.push(`/workspaces/${result.id}`);
    router.refresh();
  }

  async function handleRestore() {
    if (!restoreTarget) return;
    const res = await fetch("/api/trash/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "workspace", id: restoreTarget.id }),
    });
    if (res.ok) {
      setTrashedWorkspaces(prev => prev.filter(w => w.id !== restoreTarget.id));
      setRestoreTarget(null);
      router.refresh();
    }
  }

  async function handlePermanentDelete() {
    if (!permanentDeleteTarget) return;
    const res = await fetch("/api/trash/permanent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "workspace", id: permanentDeleteTarget.id }),
    });
    if (res.ok) {
      setTrashedWorkspaces(prev => prev.filter(w => w.id !== permanentDeleteTarget.id));
      setPermanentDeleteTarget(null);
      router.refresh();
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Workspaces</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {tab === "active"
              ? `${workspaces.length} workspace${workspaces.length !== 1 ? "s" : ""}`
              : `${trashedWorkspaces.length} in trash`}
          </p>
        </div>
        {tab === "active" && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> New workspace
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setTab("active")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === "active" ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
        >
          Active ({workspaces.length})
        </button>
        <button
          onClick={() => setTab("trash")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === "trash" ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"}`}
        >
          <Trash2 className="w-3 h-3" /> Trash ({trashedWorkspaces.length})
        </button>
      </div>

      {tab === "active" ? (
        <WorkspacesList workspaces={workspaces} />
      ) : trashedWorkspaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1.5">No deleted workspaces</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Deleted workspaces you own will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trashedWorkspaces.map(item => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.description && (
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] line-clamp-1">{item.description}</span>
                    )}
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      Deleted {formatDate(item.deletedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => setRestoreTarget(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Restore
                </button>
                <button
                  onClick={() => setPermanentDeleteTarget(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[hsl(var(--destructive))] text-white hover:opacity-90 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" /> Delete forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResourceFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        title="Create Workspace"
        submitLabel="Create workspace"
        namePlaceholder="My Workspace"
        descriptionPlaceholder="What is this workspace for?"
      />
      <ConfirmDialog
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        title="Restore workspace?"
        description={`"${restoreTarget?.name}" and all its canvases will be restored.`}
        confirmLabel="Restore"
      />
      <ConfirmDialog
        open={!!permanentDeleteTarget}
        onClose={() => setPermanentDeleteTarget(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently delete?"
        description={`"${permanentDeleteTarget?.name}" will be permanently deleted along with all its canvases. This action cannot be undone.`}
        confirmLabel="Delete forever"
        variant="danger"
      />
    </div>
  );
}

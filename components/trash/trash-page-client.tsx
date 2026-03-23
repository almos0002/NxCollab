"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, Layers, FileText, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface TrashItem {
  id: string;
  name: string;
  description: string | null;
  deletedAt: string;
  createdAt: string;
  type: "workspace" | "canvas";
  workspaceName?: string;
  workspaceId?: string;
}

export function TrashPageClient() {
  const router = useRouter();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "workspaces" | "canvases">("all");
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<TrashItem | null>(null);

  async function fetchTrash() {
    setLoading(true);
    try {
      const res = await fetch("/api/trash");
      if (res.ok) {
        const data = await res.json();
        const allItems: TrashItem[] = [
          ...data.workspaces.map((w: any) => ({ ...w, type: "workspace" as const })),
          ...data.canvases.map((c: any) => ({ ...c, type: "canvas" as const })),
        ];
        allItems.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
        setItems(allItems);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchTrash(); }, []);

  async function handleRestore(item: TrashItem) {
    const res = await fetch("/api/trash/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: item.type, id: item.id }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => !(i.id === item.id && i.type === item.type)));
      router.refresh();
    }
  }

  async function handlePermanentDelete() {
    if (!permanentDeleteTarget) return;
    const res = await fetch("/api/trash/permanent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: permanentDeleteTarget.type, id: permanentDeleteTarget.id }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => !(i.id === permanentDeleteTarget.id && i.type === permanentDeleteTarget.type)));
      setPermanentDeleteTarget(null);
      router.refresh();
    }
  }

  const filtered = filter === "all" ? items : items.filter((i) => (filter === "workspaces" ? i.type === "workspace" : i.type === "canvas"));

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight flex items-center gap-2">
            <Trash2 className="w-6 h-6" /> Trash
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} in trash
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        {(["all", "workspaces", "canvases"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
              filter === f
                ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-12 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1.5">Trash is empty</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Deleted workspaces and canvases will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                  {item.type === "workspace" ? (
                    <Layers className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium capitalize">
                      {item.type}
                    </span>
                    {item.workspaceName && (
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        in {item.workspaceName}
                      </span>
                    )}
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      Deleted {formatDate(item.deletedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRestore(item)}
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

      <ConfirmDialog
        open={!!permanentDeleteTarget}
        onClose={() => setPermanentDeleteTarget(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently delete?"
        description={`"${permanentDeleteTarget?.name}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete forever"
        variant="danger"
      />
    </div>
  );
}

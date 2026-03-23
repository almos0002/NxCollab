"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { FileText, Pencil, Trash2, MoreVertical } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { ViewToggle } from "@/components/shared/view-toggle";
import { ResourceFormDialog } from "@/components/shared/resource-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface Canvas {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

interface CanvasesListProps {
  canvases: Canvas[];
  workspaceId: string;
  userRole?: string;
}

const PAGE_SIZE = 12;
const VIEW_KEY = "canvases-view";

export function CanvasesList({ canvases: initialCanvases, workspaceId, userRole }: CanvasesListProps) {
  const router = useRouter();
  const [canvases, setCanvases] = useState(initialCanvases);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editTarget, setEditTarget] = useState<Canvas | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Canvas | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const canEdit = userRole === "owner" || userRole === "admin" || userRole === "member";

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_KEY);
    if (stored === "list" || stored === "grid") setView(stored);
  }, []);

  function handleViewChange(v: "grid" | "list") {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return canvases;
    const q = search.trim().toLowerCase();
    return canvases.filter(c => c.name.toLowerCase().includes(q));
  }, [canvases, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  async function handleEdit(data: { name: string; description: string }) {
    if (!editTarget) return;
    const res = await fetch(`/api/canvases/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, description: data.description }),
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Failed to update canvas");
    }
    setCanvases(prev => prev.map(c => c.id === editTarget.id ? { ...c, name: data.name, description: data.description || null } : c));
    setEditTarget(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/canvases/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setCanvases(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    }
  }

  function ActionMenu({ canvas }: { canvas: Canvas }) {
    if (!canEdit) return null;
    const isOpen = menuOpen === canvas.id;
    return (
      <div className="relative" onClick={(e) => e.preventDefault()}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(isOpen ? null : canvas.id); }}
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
        >
          <MoreVertical className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
            <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] py-1.5 shadow-lg animate-scale-in">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(null); setEditTarget(canvas); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
              >
                <Pencil className="w-3 h-3 text-[hsl(var(--muted-foreground))]" /> Edit details
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(null); setDeleteTarget(canvas); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Move to trash
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (canvases.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search canvases..." />
        </div>
        <ViewToggle view={view} onViewChange={handleViewChange} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No canvases match "{search}"</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3">
          {paginated.map(canvas => (
            <div key={canvas.id} className="relative group">
              <Link href={`/canvas/${canvas.id}`} className="block rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--ring)/0.2)] transition-all">
                <div className="w-full h-20 rounded-lg bg-[hsl(var(--muted))] mb-3 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{canvas.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{formatDate(canvas.updatedAt)}</p>
              </Link>
              {canEdit && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ActionMenu canvas={canvas} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map(canvas => (
            <div key={canvas.id} className="relative group">
              <Link href={`/canvas/${canvas.id}`} className="flex items-center justify-between p-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--ring)/0.2)] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">{canvas.name}</p>
                    {canvas.description && <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-1 mt-0.5">{canvas.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(canvas.updatedAt)}</p>
                  {canEdit && <ActionMenu canvas={canvas} />}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />

      <ResourceFormDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        title="Edit Canvas"
        submitLabel="Save changes"
        initialName={editTarget?.name || ""}
        initialDescription={editTarget?.description || ""}
        namePlaceholder="Canvas name"
        descriptionPlaceholder="Canvas description"
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Move canvas to trash?"
        description={`"${deleteTarget?.name}" will be moved to trash. You can restore it later.`}
        confirmLabel="Move to trash"
        variant="danger"
      />
    </div>
  );
}

"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { ViewToggle } from "@/components/shared/view-toggle";

interface Canvas {
  id: string;
  name: string;
  updatedAt: string;
}

interface CanvasesListProps {
  canvases: Canvas[];
  workspaceId: string;
}

const PAGE_SIZE = 12;
const VIEW_KEY = "canvases-view";

export function CanvasesList({ canvases, workspaceId }: CanvasesListProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");

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
            <Link key={canvas.id} href={`/canvas/${canvas.id}`} className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--ring)/0.2)] transition-all">
              <div className="w-full h-20 rounded-lg bg-[hsl(var(--muted))] mb-3 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{canvas.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{formatDate(canvas.updatedAt)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map(canvas => (
            <Link key={canvas.id} href={`/canvas/${canvas.id}`} className="group flex items-center justify-between p-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--ring)/0.2)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{canvas.name}</p>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(canvas.updatedAt)}</p>
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

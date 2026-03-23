"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";

interface Canvas {
  id: string;
  name: string;
  workspaceName: string;
  updatedAt: string;
}

interface RecentCanvasesProps {
  canvases: Canvas[];
}

const PAGE_SIZE = 8;

export function RecentCanvases({ canvases }: RecentCanvasesProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return canvases;
    const q = search.trim().toLowerCase();
    return canvases.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.workspaceName.toLowerCase().includes(q)
    );
  }, [canvases, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (canvases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center">
        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
          <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">No canvases yet</p>
        <Link href="/workspaces" className="text-sm text-[hsl(var(--foreground))] font-medium hover:underline">Create your first workspace</Link>
      </div>
    );
  }

  return (
    <div>
      {canvases.length > 3 && (
        <div className="mb-3">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search canvases..." />
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No canvases match "{search}"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map(canvas => (
            <Link key={canvas.id} href={`/canvas/${canvas.id}`} className="group flex items-center justify-between p-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--ring)/0.2)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">{canvas.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{canvas.workspaceName}</p>
                </div>
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

"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { FileText, Clock } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";

interface Canvas {
  id: string;
  name: string;
  workspaceName: string;
  updatedAt: string;
}

const PAGE_SIZE = 10;

export function RecentPageClient({ canvases }: { canvases: Canvas[] }) {
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

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Recent</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Your recently updated canvases</p>
      </div>
      {canvases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">No recent canvases</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Your recent work will appear here</p>
          <Link href="/workspaces" className="text-sm text-[hsl(var(--foreground))] font-medium hover:underline">Go to workspaces</Link>
        </div>
      ) : (
        <>
          {canvases.length > 3 && (
            <div className="mb-4">
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search recent canvases..." />
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-12 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No canvases match "{search}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginated.map(canvas => (
                <Link key={canvas.id} href={`/canvas/${canvas.id}`} className="group flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--ring)/0.2)] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
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
        </>
      )}
    </div>
  );
}

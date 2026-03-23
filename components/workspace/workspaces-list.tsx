"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ArrowRight, Layers } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { ViewToggle } from "@/components/shared/view-toggle";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  role: string;
  createdAt: string;
}

interface WorkspacesListProps {
  workspaces: Workspace[];
}

const PAGE_SIZE = 6;
const VIEW_KEY = "workspaces-view";

export function WorkspacesList({ workspaces }: WorkspacesListProps) {
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
    if (!search.trim()) return workspaces;
    const q = search.trim().toLowerCase();
    return workspaces.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.description?.toLowerCase().includes(q) ||
      w.role.toLowerCase().includes(q)
    );
  }, [workspaces, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  if (workspaces.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
          <Layers className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
        </div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1.5">No workspaces yet</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">Create your first workspace to start collaborating</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search workspaces..." />
        </div>
        <ViewToggle view={view} onViewChange={handleViewChange} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-12 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No workspaces match "{search}"</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map(ws => (
            <Link key={ws.id} href={`/workspaces/${ws.id}`} className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:border-[hsl(var(--ring)/0.2)] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center text-base font-semibold text-[hsl(var(--muted-foreground))]">
                  {ws.name[0]?.toUpperCase()}
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium capitalize">{ws.role}</span>
              </div>
              <h3 className="font-medium text-[hsl(var(--foreground))] mb-1">{ws.name}</h3>
              {ws.description && <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3 line-clamp-2 leading-relaxed">{ws.description}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Created {formatDate(ws.createdAt)}</p>
                <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map(ws => (
            <Link key={ws.id} href={`/workspaces/${ws.id}`} className="group flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--ring)/0.2)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                  {ws.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">{ws.name}</p>
                  {ws.description && <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-1 mt-0.5">{ws.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium capitalize">{ws.role}</span>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(ws.createdAt)}</p>
                <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

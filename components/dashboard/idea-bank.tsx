"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, ChevronDown, X, Lightbulb } from "lucide-react";

type Status = "idea" | "in_progress" | "done";
type Color = "gray" | "violet" | "blue" | "green" | "yellow" | "rose";

interface Idea {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  color: Color;
  createdAt: string;
}

const STATUS_CONFIG: Record<Status, { label: string; dot: string }> = {
  idea:        { label: "Idea",        dot: "bg-[hsl(var(--muted-foreground))]" },
  in_progress: { label: "In progress", dot: "bg-amber-400" },
  done:        { label: "Done",        dot: "bg-emerald-500" },
};

const STATUS_BADGE: Record<Status, string> = {
  idea:        "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  done:        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const COLOR_DOT: Record<Color, string> = {
  gray:   "bg-zinc-400",
  violet: "bg-violet-500",
  blue:   "bg-blue-500",
  green:  "bg-emerald-500",
  yellow: "bg-amber-400",
  rose:   "bg-rose-500",
};

const COLOR_BAR: Record<Color, string> = {
  gray:   "bg-zinc-300 dark:bg-zinc-600",
  violet: "bg-violet-400",
  blue:   "bg-blue-400",
  green:  "bg-emerald-400",
  yellow: "bg-amber-300",
  rose:   "bg-rose-400",
};

const COLORS: Color[] = ["gray", "violet", "blue", "green", "yellow", "rose"];
const STATUSES: Status[] = ["idea", "in_progress", "done"];

function ColorPicker({ value, onChange }: { value: Color; onChange: (c: Color) => void }) {
  return (
    <div className="flex items-center gap-2">
      {COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-5 h-5 rounded-full ${COLOR_DOT[c]} transition-all ${
            value === c
              ? "ring-2 ring-offset-2 ring-[hsl(var(--ring))] ring-offset-[hsl(var(--background))] scale-110"
              : "opacity-50 hover:opacity-90 hover:scale-110"
          }`}
          title={c}
        />
      ))}
    </div>
  );
}

function StatusDropdown({ value, onChange }: { value: Status; onChange: (s: Status) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[value]} cursor-pointer`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[value].dot}`} />
        {STATUS_CONFIG[value].label}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg py-1.5 min-w-[150px]">
          {STATUSES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-[hsl(var(--accent))] transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
              <span className={`font-medium ${value === s ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                {STATUS_CONFIG[s].label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaModal({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string | null; color: Color; status: Status }) => Promise<void>;
  title: string;
  submitLabel: string;
  initial?: { title: string; description: string | null; color: Color; status: Status };
}) {
  const [ideaTitle, setIdeaTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState<Color>(initial?.color ?? "gray");
  const [status, setStatus] = useState<Status>(initial?.status ?? "idea");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setIdeaTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setColor(initial?.color ?? "gray");
      setStatus(initial?.status ?? "idea");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ideaTitle.trim()) { setError("Title is required"); return; }
    setError("");
    setLoading(true);
    try {
      await onSubmit({ title: ideaTitle.trim(), description: description.trim() || null, color, status });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
            <X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.15)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">
              Title <span className="text-[hsl(var(--destructive))]">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={ideaTitle}
              onChange={e => setIdeaTitle(e.target.value)}
              placeholder="What's your idea?"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--ring)/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.15)] focus:border-[hsl(var(--ring)/0.4)] transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe it a bit... (optional)"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--ring)/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.15)] focus:border-[hsl(var(--ring)/0.4)] transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">Color</label>
              <ColorPicker value={color} onChange={setColor} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">Status</label>
              <StatusDropdown value={status} onChange={setStatus} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IdeaCard({
  idea,
  onDelete,
  onUpdate,
}: {
  idea: Idea;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Idea>) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);

  async function handleStatusChange(status: Status) {
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdate(idea.id, data.idea);
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
    if (res.ok) onDelete(idea.id);
  }

  async function handleEdit(data: { title: string; description: string | null; color: Color; status: Status }) {
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update idea");
    const json = await res.json();
    onUpdate(idea.id, json.idea);
    setEditOpen(false);
  }

  return (
    <>
      <div className="group flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden hover:border-[hsl(var(--ring)/0.25)] hover:shadow-sm transition-all">
        <div className={`h-1 w-full ${COLOR_BAR[idea.color]}`} />
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] leading-snug flex-1">{idea.title}</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {idea.description && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-2">{idea.description}</p>
          )}
          <div className="mt-1">
            <StatusDropdown value={idea.status} onChange={handleStatusChange} />
          </div>
        </div>
      </div>

      <IdeaModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        title="Edit Idea"
        submitLabel="Save changes"
        initial={{ title: idea.title, description: idea.description, color: idea.color, status: idea.status }}
      />
    </>
  );
}

export function IdeaBank({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [createOpen, setCreateOpen] = useState(false);

  async function handleCreate(data: { title: string; description: string | null; color: Color; status: Status }) {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create idea");
    const json = await res.json();
    setIdeas(prev => [json.idea, ...prev]);
    setCreateOpen(false);
  }

  function handleDelete(id: string) {
    setIdeas(prev => prev.filter(i => i.id !== id));
  }

  function handleUpdate(id: string, patch: Partial<Idea>) {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }

  const counts = {
    all: ideas.length,
    idea: ideas.filter(i => i.status === "idea").length,
    in_progress: ideas.filter(i => i.status === "in_progress").length,
    done: ideas.filter(i => i.status === "done").length,
  };

  const filtered = filter === "all" ? ideas : ideas.filter(i => i.status === filter);

  const filterTabs: Array<{ key: "all" | Status; label: string; count: number }> = [
    { key: "all",         label: "All",         count: counts.all },
    { key: "idea",        label: "Ideas",       count: counts.idea },
    { key: "in_progress", label: "In progress", count: counts.in_progress },
    { key: "done",        label: "Done",        count: counts.done },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          {filterTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === t.key
                  ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 tabular-nums ${filter === t.key ? "opacity-70" : "opacity-50"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New idea
        </button>
      </div>

      {filtered.length === 0 && ideas.length > 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] py-10 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No {filter === "in_progress" ? "in-progress" : filter} ideas yet
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1.5">No ideas yet</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Capture your ideas before they slip away</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add your first idea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(idea => (
            <IdeaCard key={idea.id} idea={idea} onDelete={handleDelete} onUpdate={handleUpdate} />
          ))}
        </div>
      )}

      <IdeaModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        title="New Idea"
        submitLabel="Add idea"
      />
    </>
  );
}

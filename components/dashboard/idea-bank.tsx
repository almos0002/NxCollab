"use client";

import { useState, useRef, useEffect } from "react";
import { Lightbulb, Plus, Trash2, Pencil, Check, X, ChevronDown } from "lucide-react";

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

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  idea:        { label: "Idea",        className: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]" },
  in_progress: { label: "In progress", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  done:        { label: "Done",        className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

const COLOR_MAP: Record<Color, string> = {
  gray:   "bg-zinc-400",
  violet: "bg-violet-500",
  blue:   "bg-blue-500",
  green:  "bg-emerald-500",
  yellow: "bg-amber-400",
  rose:   "bg-rose-500",
};

const COLORS: Color[] = ["gray", "violet", "blue", "green", "yellow", "rose"];
const STATUSES: Status[] = ["idea", "in_progress", "done"];

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
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[value].className} cursor-pointer`}
      >
        {STATUS_CONFIG[value].label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg py-1 min-w-[130px]">
          {STATUSES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[hsl(var(--accent))] transition-colors ${value === s ? "font-semibold" : ""}`}
            >
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${STATUS_CONFIG[s].className}`}>
                {STATUS_CONFIG[s].label}
              </span>
            </button>
          ))}
        </div>
      )}
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
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description ?? "");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) titleRef.current?.focus();
  }, [editing]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(idea.id, data.idea);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

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

  function cancelEdit() {
    setTitle(idea.title);
    setDescription(idea.description ?? "");
    setEditing(false);
  }

  return (
    <div className="group relative flex gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--ring)/0.2)] transition-all">
      <div className={`w-1 flex-shrink-0 rounded-full self-stretch ${COLOR_MAP[idea.color as Color] ?? "bg-zinc-400"}`} />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <input
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") cancelEdit(); }}
              className="w-full text-sm font-medium bg-[hsl(var(--muted))] rounded-md px-2 py-1 outline-none border border-[hsl(var(--border))] focus:border-[hsl(var(--ring)/0.5)] text-[hsl(var(--foreground))]"
              placeholder="Idea title"
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full text-xs bg-[hsl(var(--muted))] rounded-md px-2 py-1.5 outline-none border border-[hsl(var(--border))] focus:border-[hsl(var(--ring)/0.5)] resize-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              placeholder="Add a description (optional)"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] disabled:opacity-50"
              >
                <Check className="w-3 h-3" /> Save
              </button>
              <button onClick={cancelEdit} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-sm font-medium text-[hsl(var(--foreground))] leading-snug">{idea.title}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDelete}
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/30 text-[hsl(var(--muted-foreground))] hover:text-rose-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {idea.description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-2">{idea.description}</p>
            )}
            <StatusDropdown value={idea.status as Status} onChange={handleStatusChange} />
          </>
        )}
      </div>
    </div>
  );
}

function AddIdeaForm({ onAdd }: { onAdd: (idea: Idea) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<Color>("gray");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null, color }),
      });
      if (res.ok) {
        const data = await res.json();
        onAdd(data.idea);
        setTitle("");
        setDescription("");
        setColor("gray");
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--ring)/0.3)] hover:bg-[hsl(var(--accent)/0.5)] transition-all text-sm"
      >
        <Plus className="w-4 h-4" />
        Add idea
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[hsl(var(--ring)/0.3)] bg-[hsl(var(--card))] p-4 space-y-3">
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === "Escape" && setOpen(false)}
        className="w-full text-sm font-medium bg-[hsl(var(--muted))] rounded-md px-3 py-2 outline-none border border-[hsl(var(--border))] focus:border-[hsl(var(--ring)/0.5)] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
        placeholder="What's your idea?"
        required
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={2}
        className="w-full text-xs bg-[hsl(var(--muted))] rounded-md px-3 py-2 outline-none border border-[hsl(var(--border))] focus:border-[hsl(var(--ring)/0.5)] resize-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
        placeholder="Describe it a bit... (optional)"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-4 h-4 rounded-full ${COLOR_MAP[c]} transition-transform ${color === c ? "ring-2 ring-offset-2 ring-[hsl(var(--ring))] ring-offset-[hsl(var(--card))] scale-110" : "opacity-60 hover:opacity-100 hover:scale-110"}`}
              title={c}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setOpen(false); setTitle(""); setDescription(""); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? "Adding…" : "Add idea"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function IdeaBank({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [filter, setFilter] = useState<"all" | Status>("all");

  function handleAdd(idea: Idea) {
    setIdeas(prev => [idea, ...prev]);
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Idea Bank</h2>
          {ideas.length > 0 && (
            <span className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums">{ideas.length}</span>
          )}
        </div>

        {ideas.length > 0 && (
          <div className="flex items-center gap-0.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-0.5">
            {filterTabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === t.key
                    ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {t.label}
                {t.count > 0 && <span className="ml-1 opacity-60">{t.count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {filtered.length === 0 && ideas.length > 0 ? (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] py-6 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No {filter === "in_progress" ? "in-progress" : filter} ideas yet</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] py-8 text-center">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">No ideas yet</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] opacity-60">Capture your ideas before they slip away</p>
          </div>
        ) : (
          filtered.map(idea => (
            <IdeaCard key={idea.id} idea={idea} onDelete={handleDelete} onUpdate={handleUpdate} />
          ))
        )}
      </div>

      <AddIdeaForm onAdd={handleAdd} />
    </div>
  );
}

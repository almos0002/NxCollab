"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewWorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/workspaces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create workspace"); }
      else { router.push(`/workspaces/${data.id}`); router.refresh(); }
    } catch { setError("An error occurred."); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[hsl(var(--foreground))]">Name <span className="text-red-500">*</span></label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="My Workspace" className="w-full px-3 py-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[hsl(var(--foreground))]">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What is this workspace for?" className="w-full px-3 py-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent resize-none" />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="flex-1 py-2 px-4 text-sm font-medium rounded-md border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 py-2 px-4 text-sm font-medium rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity">{loading ? "Creating..." : "Create workspace"}</button>
      </div>
    </form>
  );
}

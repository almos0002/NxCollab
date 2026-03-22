"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewCanvasForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/canvases`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create canvas"); }
      else { router.push(`/canvas/${data.id}`); router.refresh(); }
    } catch { setError("An error occurred."); }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.15)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">{error}</div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Canvas Name <span className="text-[hsl(var(--destructive))]">*</span></label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="My Canvas" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--ring)/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.15)] focus:border-[hsl(var(--ring)/0.4)] transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What will you create?" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--ring)/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.15)] focus:border-[hsl(var(--ring)/0.4)] transition-all resize-none" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => router.back()} className="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity">{loading ? "Creating..." : "Create canvas"}</button>
        </div>
      </form>
    </div>
  );
}

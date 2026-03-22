"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface InviteModalProps { workspaceId: string; onClose: () => void; }

export function InviteModal({ workspaceId, onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch(`/api/workspaces/${workspaceId}/invite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to send invite"); } else { setSuccess(true); }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Invite members</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><X className="w-4 h-4" /></button>
        </div>
        {success ? (
          <div className="text-center py-4">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Invite sent!</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@example.com" className="w-full px-3 py-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as typeof role)} className="w-full px-3 py-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent">
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2 px-4 text-sm font-medium rounded-md border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2 px-4 text-sm font-medium rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50">{loading ? "Sending..." : "Send invite"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

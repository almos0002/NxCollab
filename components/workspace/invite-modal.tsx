"use client";
import { useState } from "react";
import { X, Link2, Copy, CheckCircle2 } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";

interface InviteModalProps { workspaceId: string; onClose: () => void; }

const roleOptions = [
  { value: "admin", label: "Admin", description: "Can manage members and all canvases" },
  { value: "member", label: "Member", description: "Can create and edit canvases" },
  { value: "viewer", label: "Viewer", description: "View-only access to canvases" },
];

export function InviteModal({ workspaceId, onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch(`/api/workspaces/${workspaceId}/invite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to send invite"); }
    else {
      setSuccess(true);
      if (data.inviteUrl) setInviteLink(data.inviteUrl);
    }
    setLoading(false);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
              <Link2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Invite members</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {success ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--success)/0.1)] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-[hsl(var(--success))]" />
            </div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">Invite sent!</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">{email ? `An invitation has been sent to ${email}'s inbox. You can also share the link below.` : "Share the link below with your teammate."}</p>
            {inviteLink && (
              <div className="flex gap-2 mb-4">
                <input value={inviteLink} readOnly className="flex-1 px-3 py-2 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-mono" />
                <button onClick={handleCopyLink} className="px-3 py-2 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-medium hover:opacity-90 flex items-center gap-1.5 transition-opacity">
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            )}
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.15)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">{error}</div>}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@example.com" className="w-full px-3 py-2.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--ring)/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.15)] focus:border-[hsl(var(--ring)/0.4)] transition-all" />
            </div>
            <Combobox
              label="Role"
              options={roleOptions}
              value={role}
              onChange={(v) => setRole(v as typeof role)}
              placeholder="Select a role"
            />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity">{loading ? "Sending..." : "Send invite"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

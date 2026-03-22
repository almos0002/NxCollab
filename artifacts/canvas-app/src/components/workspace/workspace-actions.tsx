"use client";
import { useState } from "react";
import { MoreHorizontal, UserPlus, Link2, CheckCircle2 } from "lucide-react";
import { InviteModal } from "./invite-modal";

interface WorkspaceActionsProps { workspaceId: string; role: string; }

export function WorkspaceActions({ workspaceId, role }: WorkspaceActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <>
      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
          <MoreHorizontal className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1.5 z-20 w-52 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg shadow-black/5 py-1.5 animate-scale-in">
              <button onClick={() => { setShowMenu(false); setShowInvite(true); }} className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                <UserPlus className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> Invite members
              </button>
              <button onClick={async () => {
                setShowMenu(false);
                const res = await fetch(`/api/workspaces/${workspaceId}/invite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "member" }) });
                const data = await res.json();
                if (data.inviteUrl) {
                  await navigator.clipboard.writeText(data.inviteUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }} className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                {copied ? <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" /> : <Link2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
                {copied ? "Copied!" : "Copy invite link"}
              </button>
            </div>
          </>
        )}
      </div>
      {showInvite && <InviteModal workspaceId={workspaceId} onClose={() => setShowInvite(false)} />}
    </>
  );
}

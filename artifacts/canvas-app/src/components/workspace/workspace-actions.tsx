"use client";
import { useState } from "react";
import { MoreHorizontal, UserPlus, Link2 } from "lucide-react";
import { InviteModal } from "./invite-modal";

interface WorkspaceActionsProps { workspaceId: string; role: string; }

export function WorkspaceActions({ workspaceId, role }: WorkspaceActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <>
      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-md hover:bg-[hsl(var(--accent))] transition-colors">
          <MoreHorizontal className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg py-1">
              <button onClick={() => { setShowMenu(false); setShowInvite(true); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                <UserPlus className="w-4 h-4" /> Invite members
              </button>
              <button onClick={async () => {
                setShowMenu(false);
                const res = await fetch(`/api/workspaces/${workspaceId}/invite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "member" }) });
                const data = await res.json();
                if (data.inviteUrl) { await navigator.clipboard.writeText(data.inviteUrl); alert("Invite link copied!"); }
              }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                <Link2 className="w-4 h-4" /> Copy invite link
              </button>
            </div>
          </>
        )}
      </div>
      {showInvite && <InviteModal workspaceId={workspaceId} onClose={() => setShowInvite(false)} />}
    </>
  );
}

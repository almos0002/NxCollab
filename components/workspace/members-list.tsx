"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronDown, Trash2, AlertTriangle, X, Crown } from "lucide-react";

interface Member {
  id: string;
  role: string;
  userId: string;
  userName: string;
  userEmail: string;
}

interface MembersListProps {
  members: Member[];
  workspaceId: string;
  currentUserRole: string;
  ownerId: string;
}

export function MembersList({ members: initialMembers, workspaceId, currentUserRole, ownerId }: MembersListProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [roleMenuOpen, setRoleMenuOpen] = useState<string | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";
  const roles = ["admin", "member", "viewer"];

  async function handleChangeRole(memberId: string, newRole: string) {
    setChangingRole(memberId);
    setRoleMenuOpen(null);
    setError(null);
    const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to change role");
    }
    setChangingRole(null);
  }

  async function handleRemove(memberId: string) {
    setRemoving(memberId);
    setError(null);
    const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, { method: "DELETE" });
    if (res.ok) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setRemoveConfirm(null);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to remove member");
    }
    setRemoving(null);
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> Members
        <span className="text-xs text-[hsl(var(--muted-foreground))] font-normal">({members.length})</span>
      </h2>

      {error && (
        <div className="mb-3 p-2.5 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.2)] flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--destructive))]" />
          <span className="text-xs text-[hsl(var(--destructive))] font-medium flex-1">{error}</span>
          <button onClick={() => setError(null)}><X className="w-3 h-3 text-[hsl(var(--destructive))]" /></button>
        </div>
      )}

      <div className="space-y-2">
        {members.map(m => (
          <div key={m.id}>
            {removeConfirm === m.id ? (
              <div className="p-3 rounded-lg bg-[hsl(var(--destructive)/0.05)] border border-[hsl(var(--destructive)/0.2)]">
                <p className="text-xs text-[hsl(var(--foreground))] font-medium mb-1">Remove {m.userName}?</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2.5">They will lose access to this workspace.</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleRemove(m.id)} disabled={removing === m.id} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[hsl(var(--destructive))] text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                    <Trash2 className="w-3 h-3" /> {removing === m.id ? "Removing..." : "Remove"}
                  </button>
                  <button onClick={() => setRemoveConfirm(null)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between py-1.5 group">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                    {m.userName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[hsl(var(--foreground))] font-medium">{m.userName}</span>
                      {m.userId === ownerId && <Crown className="w-3 h-3 text-[hsl(var(--warning))]" title="Owner" />}
                    </div>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{m.userEmail}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {canManage && m.userId !== ownerId ? (
                    <div className="relative">
                      <button
                        onClick={() => setRoleMenuOpen(roleMenuOpen === m.id ? null : m.id)}
                        disabled={changingRole === m.id}
                        className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] capitalize bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        {changingRole === m.id ? "..." : m.role}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {roleMenuOpen === m.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setRoleMenuOpen(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 w-28 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] py-1 shadow-lg">
                            {roles.map(r => (
                              <button
                                key={r}
                                onClick={() => handleChangeRole(m.id, r)}
                                className={`w-full text-left px-3 py-1.5 text-xs capitalize hover:bg-[hsl(var(--accent))] transition-colors ${m.role === r ? "text-[hsl(var(--foreground))] font-semibold" : "text-[hsl(var(--muted-foreground))]"}`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-[hsl(var(--muted-foreground))] capitalize bg-[hsl(var(--muted))] px-2 py-1 rounded-md">
                      {m.userId === ownerId ? "owner" : m.role}
                    </span>
                  )}
                  {canManage && m.userId !== ownerId && (
                    <button
                      onClick={() => setRemoveConfirm(m.id)}
                      className="flex items-center justify-center w-6 h-6 rounded-md text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))] transition-all"
                      title="Remove member"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

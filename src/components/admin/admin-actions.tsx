"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Shield, User, ToggleLeft, ToggleRight } from "lucide-react";

interface UserRow { id: string; name: string; email: string; isAdmin: boolean; createdAt: string; }

interface AdminActionsProps { signupDisabled: boolean; users: UserRow[]; }

export function AdminActions({ signupDisabled: initialSignupDisabled, users: initialUsers }: AdminActionsProps) {
  const router = useRouter();
  const [signupDisabled, setSignupDisabled] = useState(initialSignupDisabled);
  const [users, setUsers] = useState(initialUsers);
  const [togglingSignup, setTogglingSignup] = useState(false);
  const [togglingUser, setTogglingUser] = useState<string | null>(null);

  async function handleToggleSignup() {
    setTogglingSignup(true);
    const res = await fetch("/api/admin/settings/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ disabled: !signupDisabled }) });
    if (res.ok) { setSignupDisabled(!signupDisabled); router.refresh(); }
    setTogglingSignup(false);
  }

  async function handleToggleAdmin(userId: string, isAdmin: boolean) {
    setTogglingUser(userId);
    const res = await fetch(`/api/admin/users/${userId}/role`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAdmin: !isAdmin }) });
    if (res.ok) { setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !isAdmin } : u)); }
    setTogglingUser(null);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
              {signupDisabled ? <ToggleLeft className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ToggleRight className="w-4 h-4 text-[hsl(var(--success))]" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">User Registration</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                Registration is currently <strong className="text-[hsl(var(--foreground))]">{signupDisabled ? "closed" : "open"}</strong>
              </p>
            </div>
          </div>
          <button onClick={handleToggleSignup} disabled={togglingSignup} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${signupDisabled ? "bg-[hsl(var(--muted-foreground)/0.3)]" : "bg-[hsl(var(--success))]"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${signupDisabled ? "translate-x-1" : "translate-x-6"}`} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Users</h3>
          <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-md font-medium">{users.length}</span>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">{user.name}</p>
                    {user.isAdmin && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] px-1.5 py-0.5 rounded-md">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Joined {formatDate(user.createdAt)}</p>
                <button onClick={() => handleToggleAdmin(user.id, user.isAdmin)} disabled={togglingUser === user.id} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] disabled:opacity-50 transition-colors font-medium">
                  {user.isAdmin ? <><User className="w-3.5 h-3.5" /> Remove admin</> : <><Shield className="w-3.5 h-3.5" /> Make admin</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

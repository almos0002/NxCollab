"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Shield, User, ToggleLeft, ToggleRight, Pencil, Trash2, X, Check, AlertTriangle } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface UserRow { id: string; name: string; email: string; isAdmin: boolean; createdAt: string; }

interface AdminActionsProps { signupDisabled: boolean; users: UserRow[]; currentUserId: string; }

export function AdminActions({ signupDisabled: initialSignupDisabled, users: initialUsers, currentUserId }: AdminActionsProps) {
  const router = useRouter();
  const [signupDisabled, setSignupDisabled] = useState(initialSignupDisabled);
  const [users, setUsers] = useState(initialUsers);
  const [togglingSignup, setTogglingSignup] = useState(false);
  const [togglingUser, setTogglingUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  function startEdit(user: UserRow) {
    setEditingUser(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setError(null);
  }

  function cancelEdit() {
    setEditingUser(null);
    setError(null);
  }

  async function saveEdit(userId: string) {
    setSavingEdit(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, email: editEmail })
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, name: editName.trim(), email: editEmail.trim().toLowerCase() } : u));
      setEditingUser(null);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to update user");
    }
    setSavingEdit(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/users/${deleteTarget.id}/delete`, { method: "POST" });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete user");
    }
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
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${signupDisabled ? "translate-x-1" : "translate-x-6"}`}></span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Users</h3>
          <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-md font-medium">{users.length}</span>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.2)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--destructive))]" />
            <span className="text-xs text-[hsl(var(--destructive))] font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5 text-[hsl(var(--destructive))]" /></button>
          </div>
        )}

        <div className="divide-y divide-[hsl(var(--border))]">
          {users.map(user => (
            <div key={user.id} className="px-6 py-4 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
              {editingUser === user.id ? (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Name"
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Email"
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => saveEdit(user.id)} disabled={savingEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity">
                      <Check className="w-3 h-3" /> {savingEdit ? "Saving..." : "Save"}
                    </button>
                    <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
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
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mr-2">Joined {formatDate(user.createdAt)}</p>
                    <button onClick={() => startEdit(user)} className="flex items-center justify-center w-8 h-8 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors" title="Edit user">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {user.id !== currentUserId && (
                      <button onClick={() => setDeleteTarget(user)} className="flex items-center justify-center w-8 h-8 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive)/0.3)] transition-colors" title="Delete user">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleToggleAdmin(user.id, user.isAdmin)} disabled={togglingUser === user.id} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] disabled:opacity-50 transition-colors font-medium">
                      {user.isAdmin ? <><User className="w-3.5 h-3.5" /> Remove admin</> : <><Shield className="w-3.5 h-3.5" /> Make admin</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently remove the user and all their data. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

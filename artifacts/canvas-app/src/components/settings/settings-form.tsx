"use client";
import { useState } from "react";
import { useTheme } from "../theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";

interface SettingsFormProps { user: { id: string; name: string; email: string }; }

export function SettingsForm({ user }: SettingsFormProps) {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setSuccess(false);
    const res = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
    else { const d = await res.json(); setError(d.error || "Failed to save"); }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
          {success && <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 px-4 py-3 text-sm text-green-600 dark:text-green-400">Saved successfully!</div>}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">Email</label>
            <input value={user.email} disabled className="w-full px-3 py-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed" />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
        </form>
      </div>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {([["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Monitor]] as const).map(([value, label, Icon]) => (
            <button key={value} onClick={() => setTheme(value)} className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${theme === value ? "border-[hsl(var(--foreground))] bg-[hsl(var(--accent))]" : "border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"}`}>
              <Icon className="w-5 h-5 text-[hsl(var(--foreground))]" />
              <span className="text-xs font-medium text-[hsl(var(--foreground))]">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

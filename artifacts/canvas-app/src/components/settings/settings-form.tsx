"use client";
import { useState } from "react";
import { useTheme } from "../theme-provider";
import { Sun, Moon, Monitor, Check } from "lucide-react";

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

  const themes = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-5">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.15)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">{error}</div>
          )}
          {success && (
            <div className="rounded-lg bg-[hsl(var(--success)/0.06)] border border-[hsl(var(--success)/0.15)] px-4 py-3 text-sm text-[hsl(var(--success))] flex items-center gap-2">
              <Check className="w-4 h-4" /> Saved successfully
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--ring)/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.15)] focus:border-[hsl(var(--ring)/0.4)] transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">Email</label>
            <input value={user.email} disabled className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] cursor-not-allowed" />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-5">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setTheme(value)} className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${theme === value ? "border-[hsl(var(--foreground))] bg-[hsl(var(--accent)/0.5)]" : "border-[hsl(var(--border))] hover:border-[hsl(var(--ring)/0.3)] hover:bg-[hsl(var(--accent)/0.3)]"}`}>
              {theme === value && (
                <div className="absolute top-2 right-2">
                  <Check className="w-3.5 h-3.5 text-[hsl(var(--foreground))]" />
                </div>
              )}
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[hsl(var(--foreground))]" />
              </div>
              <span className="text-xs font-medium text-[hsl(var(--foreground))]">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

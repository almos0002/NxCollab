"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gauge, Check, AlertTriangle } from "lucide-react";

interface LimitsSettingsProps {
  defaultWorkspaceLimit: number;
  defaultCanvasPerWorkspaceLimit: number;
}

export function LimitsSettings({ defaultWorkspaceLimit, defaultCanvasPerWorkspaceLimit }: LimitsSettingsProps) {
  const router = useRouter();
  const [wsLimit, setWsLimit] = useState(String(defaultWorkspaceLimit));
  const [cvLimit, setCvLimit] = useState(String(defaultCanvasPerWorkspaceLimit));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const wsVal = parseInt(wsLimit, 10);
    const cvVal = parseInt(cvLimit, 10);
    if (isNaN(wsVal) || wsVal < 1 || isNaN(cvVal) || cvVal < 1) {
      setError("Limits must be positive numbers");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/admin/settings/limits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultWorkspaceLimit: wsVal, defaultCanvasPerWorkspaceLimit: cvVal }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } else {
      setError("Failed to save limits");
    }
    setSaving(false);
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
          <Gauge className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Default Resource Limits</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Set default limits for all users. Override per-user from the user table below.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.2)] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[hsl(var(--destructive))]" />
          <span className="text-xs text-[hsl(var(--destructive))] font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
            Max workspaces per user
          </label>
          <input
            type="number"
            min="1"
            value={wsLimit}
            onChange={(e) => setWsLimit(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
            Max canvases per workspace
          </label>
          <input
            type="number"
            min="1"
            value={cvLimit}
            onChange={(e) => setCvLimit(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : saving ? "Saving..." : "Save limits"}
      </button>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { X, RotateCcw, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Version { id: string; version: number; createdAt: string; createdBy: string | null; }

interface Props { canvasId: string; onClose: () => void; onRestore: (content: string) => void; isEditable: boolean; }

export function VersionHistoryPanel({ canvasId, onClose, onRestore, isEditable }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/canvases/${canvasId}/versions`).then(r => r.json()).then(d => { setVersions(d.versions ?? []); setLoading(false); });
  }, [canvasId]);

  async function handleRestore(versionId: string) {
    setRestoring(versionId);
    setConfirmId(null);
    const res = await fetch(`/api/canvases/${canvasId}/versions/${versionId}/restore`, { method: "POST" });
    const data = await res.json();
    if (data.content) { onRestore(data.content); }
    setRestoring(null);
  }

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] z-20 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Version History</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-sm text-[hsl(var(--muted-foreground))]">Loading...</div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No versions saved yet</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Click Save to create a version</p>
          </div>
        ) : versions.map(v => (
          <div key={v.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3.5 hover:border-[hsl(var(--ring)/0.2)] transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Version {v.version}</span>
              {isEditable && confirmId !== v.id && (
                <button onClick={() => setConfirmId(v.id)} disabled={restoring === v.id} className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] disabled:opacity-50 transition-colors">
                  <RotateCcw className="w-3 h-3" /> {restoring === v.id ? "Restoring..." : "Restore"}
                </button>
              )}
            </div>
            {confirmId === v.id && (
              <div className="mt-2 p-2.5 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--warning))]" />
                  <span className="text-xs font-medium text-[hsl(var(--foreground))]">Restore this version?</span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2.5">This will replace the current canvas content. You can undo by restoring another version.</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleRestore(v.id)} className="flex-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
                    Restore
                  </button>
                  <button onClick={() => setConfirmId(null)} className="flex-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(v.createdAt)}</p>
            {v.createdBy && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">by {v.createdBy}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

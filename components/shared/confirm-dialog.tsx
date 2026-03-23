"use client";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl animate-scale-in">
        <div className="flex items-start gap-4">
          {variant === "danger" && (
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--destructive)/0.1)] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--destructive))]" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">{title}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-opacity disabled:opacity-50 ${
              variant === "danger"
                ? "bg-[hsl(var(--destructive))] text-white hover:opacity-90"
                : "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90"
            }`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

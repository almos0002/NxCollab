"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, History, Save, Eye } from "lucide-react";
import { CollaborativeCanvas, type CanvasHandle } from "@/components/canvas/collaborative-canvas";

interface CanvasPageClientProps {
  canvas: {
    id: string;
    name: string;
    workspaceId: string;
    workspaceName: string;
    content: string;
    libraryData: string | null;
  };
  role: string;
  isEditable: boolean;
  userId: string;
  userName: string;
}

export function CanvasPageClient({ canvas, role, isEditable, userId, userName }: CanvasPageClientProps) {
  const canvasRef = useRef<CanvasHandle>(null);
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-3 sm:px-5 h-[49px] border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Link href={`/workspaces/${canvas.workspaceId}`} className="flex items-center gap-1 sm:gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{canvas.workspaceName}</span>
          </Link>
          <span className="text-[hsl(var(--border))] hidden sm:inline">|</span>
          <h1 className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{canvas.name}</h1>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium capitalize shrink-0 hidden sm:inline">{role}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
          {isEditable ? (
            <>
              <button
                onClick={() => canvasRef.current?.toggleHistory()}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
              </button>
              <button
                onClick={() => canvasRef.current?.save()}
                disabled={saving}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{saving ? "Saving..." : "Save"}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] text-xs font-medium text-[hsl(var(--muted-foreground))]">
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View only</span>
            </div>
          )}
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <CollaborativeCanvas
          ref={canvasRef}
          canvasId={canvas.id}
          initialContent={canvas.content}
          initialLibraryData={canvas.libraryData}
          isEditable={isEditable}
          userId={userId}
          userName={userName}
          onSavingChange={setSaving}
        />
      </div>
    </div>
  );
}

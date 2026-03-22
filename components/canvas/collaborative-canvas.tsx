"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { History, Save, Users, Eye } from "lucide-react";
import { VersionHistoryPanel } from "./version-history-panel";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">Loading canvas...</div> }
);

interface CollaborativeCanvasProps {
  canvasId: string;
  initialContent: string;
  isEditable: boolean;
  userId: string;
  userName: string;
}

interface CollaboratorInfo {
  userId: string;
  userName: string;
  color: string;
}

const COLORS = ["#f97316", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];
const AUTO_SAVE_DELAY = 10000;

export function CollaborativeCanvas({ canvasId, initialContent, isEditable, userId, userName }: CollaborativeCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const lastSavedContentRef = useRef<string>(initialContent);
  const myColor = COLORS[userId.charCodeAt(0) % COLORS.length];

  const getInitialElements = useCallback(() => {
    try {
      const parsed = JSON.parse(initialContent);
      return parsed.elements ?? [];
    } catch { return []; }
  }, [initialContent]);

  const getInitialAppState = useCallback(() => {
    try {
      const parsed = JSON.parse(initialContent);
      return parsed.appState ?? {};
    } catch { return {}; }
  }, [initialContent]);

  const saveCanvas = useCallback(async (elements: readonly ExcalidrawElement[], appState: AppState, createVersion = false) => {
    if (!isEditable) return;
    const content = JSON.stringify({
      elements,
      appState: { viewBackgroundColor: appState.viewBackgroundColor, gridSize: appState.gridSize }
    });
    if (content === lastSavedContentRef.current && !createVersion) return;
    setSaving(true);
    try {
      await fetch(`/api/canvases/${canvasId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, createVersion })
      });
      lastSavedContentRef.current = content;
      setLastSaved(new Date());
    } catch (err) { console.error("Save failed:", err); }
    finally { setSaving(false); }
  }, [canvasId, isEditable]);

  const handleChange = useCallback((elements: readonly ExcalidrawElement[], appState: AppState) => {
    if (!isEditable) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveCanvas(elements, appState, false), AUTO_SAVE_DELAY);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "update", elements, userId, userName }));
    }
  }, [isEditable, saveCanvas, userId, userName]);

  useEffect(() => {
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, []);

  async function handleManualSave() {
    if (!excalidrawAPI) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    await saveCanvas(elements, appState, true);
  }

  async function handleRestoreVersion(content: string) {
    if (!excalidrawAPI) return;
    try {
      const parsed = JSON.parse(content);
      excalidrawAPI.updateScene({ elements: parsed.elements ?? [], appState: parsed.appState ?? {} });
      lastSavedContentRef.current = content;
      setShowVersions(false);
    } catch {}
  }

  return (
    <div className="relative h-full w-full excalidraw-wrapper">
      <div className="absolute top-3 right-3 z-[10] flex items-center gap-2">
        {collaborators.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
            <Users className="w-3.5 h-3.5" />
            <span>{collaborators.length + 1} online</span>
          </div>
        )}
        {isEditable && (
          <>
            <button onClick={() => setShowVersions(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
              <History className="w-3.5 h-3.5" /> History
            </button>
            <button onClick={handleManualSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
            </button>
          </>
        )}
        {!isEditable && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[hsl(var(--muted))] text-xs font-medium text-[hsl(var(--muted-foreground))]">
            <Eye className="w-3.5 h-3.5" /> View only
          </div>
        )}
        {lastSaved && <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] px-2 py-1 rounded-md border border-[hsl(var(--border))]">Saved {lastSaved.toLocaleTimeString()}</span>}
      </div>
      <Excalidraw
        ref={setExcalidrawAPI}
        initialData={{ elements: getInitialElements(), appState: getInitialAppState() }}
        onChange={handleChange}
        viewModeEnabled={!isEditable}
        UIOptions={{ canvasActions: { export: false, loadScene: false, saveAsImage: true } }}
      />
      {showVersions && (
        <VersionHistoryPanel canvasId={canvasId} onClose={() => setShowVersions(false)} onRestore={handleRestoreVersion} isEditable={isEditable} />
      )}
    </div>
  );
}

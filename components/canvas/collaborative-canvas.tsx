"use client";
import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/components/theme-provider";
import { VersionHistoryPanel } from "./version-history-panel";

const ExcalidrawWrapper = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => {
    return { default: mod.Excalidraw };
  }),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">Loading canvas...</div> }
);

export interface CanvasHandle {
  save: () => Promise<void>;
  toggleHistory: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

interface CollaborativeCanvasProps {
  canvasId: string;
  initialContent: string;
  initialLibraryData: string | null;
  isEditable: boolean;
  userId: string;
  userName: string;
  onSavingChange?: (saving: boolean) => void;
  onShowVersionsChange?: (show: boolean) => void;
}

const AUTO_SAVE_DELAY = 10000;

export const CollaborativeCanvas = forwardRef<CanvasHandle, CollaborativeCanvasProps>(function CollaborativeCanvas(
  { canvasId, initialContent, initialLibraryData, isEditable, userId, userName, onSavingChange, onShowVersionsChange },
  ref
) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const lastSavedContentRef = useRef<string>(initialContent);
  const { resolvedTheme } = useTheme();

  const [activeTheme, setActiveTheme] = useState<"light" | "dark">(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    import("@excalidraw/excalidraw/index.css").catch(() => {});
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setActiveTheme(isDark ? "dark" : "light");
  }, [resolvedTheme]);

  const getInitialElements = useCallback(() => {
    try {
      const parsed = JSON.parse(initialContent);
      return parsed.elements ?? [];
    } catch { return []; }
  }, [initialContent]);

  const getInitialAppState = useCallback(() => {
    try {
      const parsed = JSON.parse(initialContent);
      const { viewBackgroundColor, ...rest } = parsed.appState || {};
      return rest;
    } catch {
      return {};
    }
  }, [initialContent]);

  const getInitialLibrary = useCallback(() => {
    if (!initialLibraryData) return undefined;
    try {
      return JSON.parse(initialLibraryData);
    } catch { return undefined; }
  }, [initialLibraryData]);

  const saveCanvas = useCallback(async (elements: readonly any[], appState: any, createVersion = false) => {
    if (!isEditable) return;
    const content = JSON.stringify({
      elements,
      appState: { gridSize: appState.gridSize }
    });
    if (content === lastSavedContentRef.current) return;
    setSaving(true);
    onSavingChange?.(true);
    try {
      await fetch(`/api/canvases/${canvasId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, createVersion })
      });
      lastSavedContentRef.current = content;
    } catch (err) { console.error("Save failed:", err); }
    finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  }, [canvasId, isEditable, onSavingChange]);

  const handleChange = useCallback((elements: readonly any[], appState: any) => {
    if (!isEditable) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveCanvas(elements, appState, false), AUTO_SAVE_DELAY);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "update", elements, userId, userName }));
    }
  }, [isEditable, saveCanvas, userId, userName]);

  const handleLibraryChange = useCallback(async (items: any[]) => {
    if (!isEditable) return;
    try {
      await fetch(`/api/canvases/${canvasId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libraryData: JSON.stringify(items) })
      });
    } catch (err) { console.error("Library save failed:", err); }
  }, [canvasId, isEditable]);

  useEffect(() => {
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, []);

  const handleManualSave = useCallback(async () => {
    if (!excalidrawAPI) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    await saveCanvas(elements, appState, true);
  }, [excalidrawAPI, saveCanvas]);

  const toggleHistory = useCallback(() => {
    setShowVersions(prev => {
      const next = !prev;
      onShowVersionsChange?.(next);
      return next;
    });
  }, [onShowVersionsChange]);

  useImperativeHandle(ref, () => ({
    save: handleManualSave,
    toggleHistory,
    isSaving: saving,
    hasUnsavedChanges: false,
  }), [handleManualSave, toggleHistory, saving]);

  async function handleRestoreVersion(content: string) {
    if (!excalidrawAPI) return;
    try {
      const parsed = JSON.parse(content);
      excalidrawAPI.updateScene({ elements: parsed.elements ?? [], appState: parsed.appState ?? {} });
      lastSavedContentRef.current = content;
      setShowVersions(false);
      onShowVersionsChange?.(false);
    } catch {}
  }

  const libraryItems = getInitialLibrary();

  return (
    <div className="relative h-full w-full excalidraw-wrapper">
      <ExcalidrawWrapper
        excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
        initialData={{
          elements: getInitialElements(),
          appState: getInitialAppState(),
          ...(libraryItems ? { libraryItems } : {}),
        }}
        onChange={handleChange}
        onLibraryChange={handleLibraryChange}
        viewModeEnabled={!isEditable}
        theme={activeTheme}
        UIOptions={{ canvasActions: { export: false, loadScene: false, saveAsImage: true } }}
      />
      {showVersions && (
        <VersionHistoryPanel canvasId={canvasId} onClose={() => { setShowVersions(false); onShowVersionsChange?.(false); }} onRestore={handleRestoreVersion} isEditable={isEditable} />
      )}
    </div>
  );
});

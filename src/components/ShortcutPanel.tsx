import { invoke } from "@tauri-apps/api/core";
import { AppWindow, ExternalLink, Folder, LoaderCircle } from "lucide-react";
import { useState } from "react";
import type { ShortcutButton, ShortcutIcon } from "../hooks/useShortcutButtons";

interface ShortcutPanelProps {
  shortcuts: readonly ShortcutButton[];
  isLoaded: boolean;
}

export function ShortcutPanel({ shortcuts, isLoaded }: ShortcutPanelProps) {
  const [runningId, setRunningId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  const runShortcut = async (shortcut: ShortcutButton) => {
    setRunningId(shortcut.id);
    setErrorById((current) => {
      const next = { ...current };
      delete next[shortcut.id];
      return next;
    });

    try {
      await invoke("run_shortcut_action", {
        action: {
          action_type: shortcut.actionType,
          target: shortcut.target,
        },
      });
    } catch (err) {
      setErrorById((current) => ({
        ...current,
        [shortcut.id]: getErrorMessage(err),
      }));
    } finally {
      setRunningId(null);
    }
  };

  return (
    <section className="shortcuts-view" aria-label="Shortcuts">
      <div className="shortcuts-view-header">
        <span className="shortcuts-view-title">Shortcuts</span>
      </div>

      {!isLoaded ? (
        <p className="shortcuts-empty">読み込み中...</p>
      ) : shortcuts.length === 0 ? (
        <p className="shortcuts-empty">Settings からショートカットを追加</p>
      ) : (
        <div className="shortcuts-grid">
          {shortcuts.map((shortcut) => {
            const isRunning = runningId === shortcut.id;
            const errorMessage = errorById[shortcut.id];

            return (
              <button
                key={shortcut.id}
                type="button"
                className={[
                  "shortcut-button",
                  errorMessage ? "shortcut-button-error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={isRunning}
                onClick={() => void runShortcut(shortcut)}
                title={
                  errorMessage ? `Failed: ${errorMessage}` : shortcut.target
                }
              >
                <span className="shortcut-button-icon">
                  {isRunning ? (
                    <LoaderCircle
                      size={22}
                      className="shortcut-button-spinner"
                      aria-hidden="true"
                    />
                  ) : (
                    <ShortcutIconView icon={shortcut.icon} />
                  )}
                </span>
                <span className="shortcut-button-label">{shortcut.label}</span>
                {errorMessage ? (
                  <span className="shortcut-button-status">失敗</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ShortcutIconView({ icon }: { icon: ShortcutIcon }) {
  switch (icon) {
    case "globe":
      return <ExternalLink size={22} />;
    case "folder":
      return <Folder size={22} />;
    case "app":
      return <AppWindow size={22} />;
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

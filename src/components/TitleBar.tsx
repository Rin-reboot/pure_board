import { LineChart, Pin, Settings, X } from "lucide-react";

interface TitleBarProps {
  isDragEnabled: boolean;
  isPinned: boolean;
  isSettingsOpen: boolean;
  onCloseRequest: () => void;
  onTogglePin: () => void;
  onToggleSettings: () => void;
}

export function TitleBar({
  isDragEnabled,
  isPinned,
  isSettingsOpen,
  onCloseRequest,
  onTogglePin,
  onToggleSettings,
}: TitleBarProps) {
  return (
    <header
      className="title-bar"
      {...(isDragEnabled ? { "data-tauri-drag-region": "" } : {})}
    >
      <div className="title-bar-left">
        <LineChart size={18} className="title-bar-icon" />
        <span>System Monitor</span>
      </div>
      <div className="title-bar-actions">
        <button
          type="button"
          onClick={onTogglePin}
          aria-label="Toggle always on top"
          aria-pressed={isPinned}
          className={isPinned ? "is-active" : ""}
        >
          <Pin size={15} fill={isPinned ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={onToggleSettings}
          aria-label="Toggle settings"
          aria-pressed={isSettingsOpen}
          className={isSettingsOpen ? "is-active" : ""}
        >
          <Settings size={15} />
        </button>
        <button type="button" onClick={onCloseRequest} aria-label="Close">
          <X size={15} />
        </button>
      </div>
    </header>
  );
}

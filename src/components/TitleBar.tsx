import { getCurrentWindow } from "@tauri-apps/api/window";
import { LineChart, Pin, Settings, X } from "lucide-react";

interface TitleBarProps {
  isPinned: boolean;
  isSettingsOpen: boolean;
  onTogglePin: () => void;
  onToggleSettings: () => void;
}

export function TitleBar({
  isPinned,
  isSettingsOpen,
  onTogglePin,
  onToggleSettings,
}: TitleBarProps) {
  const handleClose = () => {
    getCurrentWindow().close();
  };

  return (
    <header className="title-bar" data-tauri-drag-region>
      <div className="title-bar-left">
        <LineChart size={18} className="title-bar-icon" />
        <span>System Monitor</span>
      </div>
      <div className="title-bar-actions">
        <button
          type="button"
          onClick={onTogglePin}
          aria-label="常に最前面に表示"
          aria-pressed={isPinned}
          className={isPinned ? "is-active" : ""}
        >
          <Pin size={15} fill={isPinned ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={onToggleSettings}
          aria-label="設定"
          aria-pressed={isSettingsOpen}
          className={isSettingsOpen ? "is-active" : ""}
        >
          <Settings size={15} />
        </button>
        <button type="button" onClick={handleClose} aria-label="閉じる">
          <X size={15} />
        </button>
      </div>
    </header>
  );
}

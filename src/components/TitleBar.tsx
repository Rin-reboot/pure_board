import { LineChart, Pin, Settings, X } from "lucide-react";

export function TitleBar() {
  return (
    <header className="title-bar" data-tauri-drag-region>
      <div className="title-bar-left">
        <LineChart size={18} className="title-bar-icon" />
        <span>System Monitor</span>
      </div>
      <div className="title-bar-actions">
        <button type="button" aria-label="ピン留め">
          <Pin size={15} />
        </button>
        <button type="button" aria-label="設定">
          <Settings size={15} />
        </button>
        <button type="button" aria-label="閉じる">
          <X size={15} />
        </button>
      </div>
    </header>
  );
}

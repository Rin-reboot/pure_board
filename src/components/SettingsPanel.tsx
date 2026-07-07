import { MIN_UPDATE_INTERVAL_MS } from "../hooks/useUpdateIntervalSetting";

interface SettingsPanelProps {
  updateIntervalMs: number;
  onUpdateIntervalChange: (valueMs: number) => void;
}

export function SettingsPanel({
  updateIntervalMs,
  onUpdateIntervalChange,
}: SettingsPanelProps) {
  const updateIntervalSeconds = updateIntervalMs / 1000;
  const minUpdateIntervalSeconds = MIN_UPDATE_INTERVAL_MS / 1000;

  return (
    <aside className="settings-panel" aria-label="Settings">
      <div className="settings-panel-header">
        <span className="settings-panel-title">Settings</span>
      </div>

      <div className="settings-section">
        <span className="settings-section-title">System</span>
        <div className="settings-row">
          <div className="settings-row-copy">
            <span className="settings-row-label">Update interval</span>
            <span className="settings-row-value">
              System usage polling interval in seconds
            </span>
          </div>
          <input
            className="settings-number-input"
            type="number"
            min={minUpdateIntervalSeconds}
            step={0.1}
            value={updateIntervalSeconds}
            onChange={(event) =>
              onUpdateIntervalChange(Number(event.target.value) * 1000)
            }
            aria-label="Update interval"
          />
        </div>
      </div>
    </aside>
  );
}

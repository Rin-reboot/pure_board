import type { CloseActionPreference } from "../hooks/useCloseActionPreference";
import { MIN_UPDATE_INTERVAL_MS } from "../hooks/useUpdateIntervalSetting";

interface SettingsPanelProps {
  closeActionPreference: CloseActionPreference;
  isAutoStartEnabled: boolean;
  isAutoStartLoaded: boolean;
  pingTargetHost: string;
  updateIntervalMs: number;
  onCloseActionPreferenceChange: (value: CloseActionPreference) => void;
  onPingTargetHostChange: (value: string) => void;
  onToggleAutoStart: () => void;
  onUpdateIntervalChange: (valueMs: number) => void;
}

export function SettingsPanel({
  closeActionPreference,
  isAutoStartEnabled,
  isAutoStartLoaded,
  pingTargetHost,
  updateIntervalMs,
  onCloseActionPreferenceChange,
  onPingTargetHostChange,
  onToggleAutoStart,
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

      <div className="settings-section">
        <span className="settings-section-title">Network</span>
        <div className="settings-row">
          <div className="settings-row-copy">
            <span className="settings-row-label">Ping target</span>
            <span className="settings-row-value">
              Host used by the manual ping command
            </span>
          </div>
          <input
            className="settings-text-input"
            type="text"
            value={pingTargetHost}
            onChange={(event) => onPingTargetHostChange(event.target.value)}
            aria-label="Ping target"
          />
        </div>
      </div>

      <div className="settings-section">
        <span className="settings-section-title">Application</span>
        <div className="settings-row">
          <div className="settings-row-copy">
            <span className="settings-row-label">Launch at startup</span>
            <span className="settings-row-value">
              Start pure_board when you sign in
            </span>
          </div>
          <button
            type="button"
            className={[
              "settings-switch",
              isAutoStartEnabled ? "settings-switch-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label="Launch at startup"
            aria-pressed={isAutoStartEnabled}
            disabled={!isAutoStartLoaded}
            onClick={onToggleAutoStart}
          >
            <span className="settings-switch-thumb" />
          </button>
        </div>
        <div className="settings-row">
          <div className="settings-row-copy">
            <span className="settings-row-label">Close button behavior</span>
            <span className="settings-row-value">
              Choose what happens when closing the window
            </span>
          </div>
          <select
            className="settings-select"
            value={closeActionPreference}
            onChange={(event) =>
              onCloseActionPreferenceChange(
                event.target.value as CloseActionPreference,
              )
            }
            aria-label="Close button behavior"
          >
            <option value="ask">Ask every time</option>
            <option value="minimizeToTray">Minimize to tray</option>
            <option value="exit">Exit app</option>
          </select>
        </div>
      </div>
    </aside>
  );
}

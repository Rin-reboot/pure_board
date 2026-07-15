import type { CloseActionPreference } from "../hooks/useCloseActionPreference";
import {
  createShortcutButton,
  MAX_SHORTCUT_BUTTONS,
  type ShortcutActionType,
  type ShortcutButton,
  type ShortcutIcon,
} from "../hooks/useShortcutButtons";
import {
  MAX_TRAY_STATUS_INTERVAL_SECONDS,
  MIN_TRAY_STATUS_INTERVAL_SECONDS,
  type TrayStatusMetric,
} from "../hooks/useTrayStatusSettings";
import { MIN_UPDATE_INTERVAL_MS } from "../hooks/useUpdateIntervalSetting";

interface SettingsPanelProps {
  closeActionPreference: CloseActionPreference;
  isAutoStartEnabled: boolean;
  isAutoStartLoaded: boolean;
  pingTargetHost: string;
  shortcutButtons: readonly ShortcutButton[];
  trayStatusEnabled: boolean;
  trayStatusIntervalSeconds: number;
  trayStatusMetric: TrayStatusMetric;
  updateIntervalMs: number;
  onCloseActionPreferenceChange: (value: CloseActionPreference) => void;
  onPingTargetHostChange: (value: string) => void;
  onShortcutButtonsChange: (value: readonly ShortcutButton[]) => void;
  onOpenTrayStatusHelp: () => void;
  onTrayStatusEnabledChange: (value: boolean) => void;
  onTrayStatusIntervalChange: (valueSeconds: number) => void;
  onTrayStatusMetricChange: (value: TrayStatusMetric) => void;
  onToggleAutoStart: () => void;
  onUpdateIntervalChange: (valueMs: number) => void;
}

export function SettingsPanel({
  closeActionPreference,
  isAutoStartEnabled,
  isAutoStartLoaded,
  pingTargetHost,
  shortcutButtons,
  trayStatusEnabled,
  trayStatusIntervalSeconds,
  trayStatusMetric,
  updateIntervalMs,
  onCloseActionPreferenceChange,
  onPingTargetHostChange,
  onShortcutButtonsChange,
  onOpenTrayStatusHelp,
  onTrayStatusEnabledChange,
  onTrayStatusIntervalChange,
  onTrayStatusMetricChange,
  onToggleAutoStart,
  onUpdateIntervalChange,
}: SettingsPanelProps) {
  const updateIntervalSeconds = updateIntervalMs / 1000;
  const minUpdateIntervalSeconds = MIN_UPDATE_INTERVAL_MS / 1000;
  const shortcutSlots = Array.from(
    { length: MAX_SHORTCUT_BUTTONS },
    (_, index) => shortcutButtons[index] ?? null,
  );

  const updateShortcut = (
    index: number,
    patch: Partial<Omit<ShortcutButton, "id">>,
  ) => {
    const next = [...shortcutButtons];
    const current = next[index] ?? createShortcutButton(index);
    const actionType = patch.actionType ?? current.actionType;

    next[index] = {
      ...current,
      ...patch,
      actionType,
      icon: patch.icon ?? current.icon,
    };

    onShortcutButtonsChange(next);
  };

  const removeShortcut = (index: number) => {
    onShortcutButtonsChange(
      shortcutButtons.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  return (
    <aside className="settings-panel" aria-label="Settings">
      <div className="settings-panel-header">
        <span className="settings-panel-title">Settings</span>
      </div>

      <div className="settings-panel-content">
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
          <span className="settings-section-title">Taskbar status</span>
          <div className="settings-row">
            <div className="settings-row-copy">
              <span className="settings-row-label">Show mini graph</span>
              <span className="settings-row-value">
                Display system activity in the notification area
              </span>
            </div>
            <button
              type="button"
              className={[
                "settings-switch",
                trayStatusEnabled ? "settings-switch-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label="Show taskbar mini graph"
              aria-pressed={trayStatusEnabled}
              onClick={() => onTrayStatusEnabledChange(!trayStatusEnabled)}
            >
              <span className="settings-switch-thumb" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-copy">
              <span className="settings-row-label">Metric</span>
              <span className="settings-row-value">
                Value drawn by the mini graph
              </span>
            </div>
            <select
              className="settings-select"
              value={trayStatusMetric}
              disabled={!trayStatusEnabled}
              onChange={(event) =>
                onTrayStatusMetricChange(event.target.value as TrayStatusMetric)
              }
              aria-label="Taskbar status metric"
            >
              <option value="cpu">CPU</option>
              <option value="memory">RAM</option>
              <option value="network">Network</option>
            </select>
          </div>
          <div className="settings-row">
            <div className="settings-row-copy">
              <span className="settings-row-label">Update interval</span>
              <span className="settings-row-value">
                1–60 seconds; pauses visually on battery or reduced motion
              </span>
            </div>
            <input
              className="settings-number-input"
              type="number"
              min={MIN_TRAY_STATUS_INTERVAL_SECONDS}
              max={MAX_TRAY_STATUS_INTERVAL_SECONDS}
              step={1}
              value={trayStatusIntervalSeconds}
              disabled={!trayStatusEnabled}
              onChange={(event) =>
                onTrayStatusIntervalChange(Number(event.target.value))
              }
              aria-label="Taskbar status update interval"
            />
          </div>
          <button
            type="button"
            className="settings-help-link"
            onClick={onOpenTrayStatusHelp}
          >
            How to keep the icon visible in Windows 11
          </button>
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
          <span className="settings-section-title">Shortcuts</span>
          <div className="shortcut-settings-list">
            {shortcutSlots.map((shortcut, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: slots are fixed settings positions
                key={index}
                className="shortcut-settings-item"
              >
                <div className="shortcut-settings-header">
                  <span className="settings-row-label">Slot {index + 1}</span>
                  {shortcut ? (
                    <button
                      type="button"
                      className="shortcut-settings-remove"
                      onClick={() => removeShortcut(index)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  className="settings-text-input shortcut-settings-input"
                  type="text"
                  value={shortcut?.label ?? ""}
                  placeholder="Label"
                  onChange={(event) =>
                    updateShortcut(index, { label: event.target.value })
                  }
                  aria-label={`Shortcut ${index + 1} label`}
                />
                <div className="shortcut-settings-row">
                  <select
                    className="settings-select shortcut-settings-select"
                    value={shortcut?.actionType ?? "url"}
                    onChange={(event) =>
                      updateShortcut(index, {
                        actionType: event.target.value as ShortcutActionType,
                      })
                    }
                    aria-label={`Shortcut ${index + 1} type`}
                  >
                    <option value="url">URL</option>
                    <option value="file">File</option>
                    <option value="app">App</option>
                  </select>
                  <select
                    className="settings-select shortcut-settings-select"
                    value={shortcut?.icon ?? "globe"}
                    onChange={(event) =>
                      updateShortcut(index, {
                        icon: event.target.value as ShortcutIcon,
                      })
                    }
                    aria-label={`Shortcut ${index + 1} icon`}
                  >
                    <option value="globe">Globe</option>
                    <option value="folder">Folder</option>
                    <option value="app">App</option>
                  </select>
                </div>
                <input
                  className="settings-text-input shortcut-settings-input"
                  type="text"
                  value={shortcut?.target ?? ""}
                  placeholder="Target"
                  onChange={(event) =>
                    updateShortcut(index, { target: event.target.value })
                  }
                  aria-label={`Shortcut ${index + 1} target`}
                />
              </div>
            ))}
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
      </div>
    </aside>
  );
}

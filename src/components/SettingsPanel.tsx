interface SettingsPanelProps {
  updateIntervalLabel: string;
}

export function SettingsPanel({ updateIntervalLabel }: SettingsPanelProps) {
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
            <span className="settings-row-value">{updateIntervalLabel}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

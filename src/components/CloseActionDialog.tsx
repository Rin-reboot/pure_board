import { useState } from "react";
import type { CloseAction } from "../hooks/useCloseActionPreference";

interface CloseActionDialogProps {
  onCancel: () => void;
  onSelect: (action: CloseAction, shouldRemember: boolean) => void;
}

export function CloseActionDialog({
  onCancel,
  onSelect,
}: CloseActionDialogProps) {
  const [shouldRemember, setShouldRemember] = useState(false);

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="close-action-dialog"
        aria-labelledby="close-action-dialog-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="close-action-dialog-copy">
          <h2 id="close-action-dialog-title">Close pure_board?</h2>
          <p>Choose whether to exit the app or keep it running in the tray.</p>
        </div>

        <label className="close-action-remember">
          <input
            type="checkbox"
            checked={shouldRemember}
            onChange={(event) => setShouldRemember(event.target.checked)}
          />
          <span>選択を記憶</span>
        </label>

        <div className="close-action-dialog-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelect("minimizeToTray", shouldRemember)}
          >
            Minimize to tray
          </button>
          <button
            type="button"
            onClick={() => onSelect("exit", shouldRemember)}
          >
            Exit
          </button>
        </div>
      </section>
    </div>
  );
}

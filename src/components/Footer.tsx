import {
  BarChart3,
  CircleHelp,
  ClipboardList,
  Moon,
  Pencil,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Theme } from "../hooks/useTheme";

interface FooterProps {
  isHistoryOpen: boolean;
  isHelpOpen: boolean;
  isEditMode: boolean;
  isShortcutsOpen: boolean;
  theme: Theme;
  onToggleHistory: () => void;
  onToggleHelp: () => void;
  onToggleEditMode: () => void;
  onToggleShortcuts: () => void;
  onToggleTheme: () => void;
}

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function Footer({
  isHistoryOpen,
  isHelpOpen,
  isEditMode,
  isShortcutsOpen,
  theme,
  onToggleHistory,
  onToggleHelp,
  onToggleEditMode,
  onToggleShortcuts,
  onToggleTheme,
}: FooterProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="footer-bar">
      <div className="footer-icons">
        <button
          type="button"
          aria-label="Edit mode"
          aria-pressed={isEditMode}
          className={isEditMode ? "is-active" : ""}
          onClick={onToggleEditMode}
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          aria-label="Shortcuts"
          aria-pressed={isShortcutsOpen}
          className={isShortcutsOpen ? "is-active" : ""}
          onClick={onToggleShortcuts}
        >
          <ClipboardList size={14} />
        </button>
        <button
          type="button"
          aria-label="Graph"
          aria-pressed={isHistoryOpen}
          className={isHistoryOpen ? "is-active" : ""}
          onClick={onToggleHistory}
        >
          <BarChart3 size={14} />
        </button>
        <button
          type="button"
          aria-label="Help"
          aria-pressed={isHelpOpen}
          className={isHelpOpen ? "is-active" : ""}
          onClick={onToggleHelp}
        >
          <CircleHelp size={14} />
        </button>
      </div>
      <span className="footer-datetime">{formatDateTime(now)}</span>
      <button type="button" onClick={onToggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </footer>
  );
}

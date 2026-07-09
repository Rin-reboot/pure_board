import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const STORE_FILE = "settings.json";
const STORE_KEY = "shortcutButtons";
export const MAX_SHORTCUT_BUTTONS = 6;

export type ShortcutActionType = "url" | "file" | "app";
export type ShortcutIcon = "globe" | "folder" | "app";

export interface ShortcutButton {
  id: string;
  label: string;
  actionType: ShortcutActionType;
  target: string;
  icon: ShortcutIcon;
}

export const DEFAULT_SHORTCUT_BUTTONS: readonly ShortcutButton[] = [];

const ACTION_TYPES: readonly ShortcutActionType[] = ["url", "file", "app"];
const ICONS: readonly ShortcutIcon[] = ["globe", "folder", "app"];

function isShortcutActionType(value: unknown): value is ShortcutActionType {
  return (
    typeof value === "string" &&
    ACTION_TYPES.includes(value as ShortcutActionType)
  );
}

function isShortcutIcon(value: unknown): value is ShortcutIcon {
  return typeof value === "string" && ICONS.includes(value as ShortcutIcon);
}

function normalizeShortcutButton(value: unknown): ShortcutButton | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id.trim() : "";
  const label =
    typeof item.label === "string" && item.label.trim()
      ? item.label.trim()
      : "Shortcut";
  const target = typeof item.target === "string" ? item.target.trim() : "";

  if (!id || !isShortcutActionType(item.actionType)) {
    return null;
  }

  return {
    id,
    label,
    actionType: item.actionType,
    target,
    icon: isShortcutIcon(item.icon)
      ? item.icon
      : actionTypeToIcon(item.actionType),
  };
}

function normalizeShortcutButtons(value: unknown): ShortcutButton[] {
  if (!Array.isArray(value)) return [...DEFAULT_SHORTCUT_BUTTONS];

  const seen = new Set<string>();
  const normalized: ShortcutButton[] = [];

  for (const item of value) {
    const shortcut = normalizeShortcutButton(item);
    if (!shortcut || seen.has(shortcut.id)) continue;

    normalized.push(shortcut);
    seen.add(shortcut.id);

    if (normalized.length >= MAX_SHORTCUT_BUTTONS) break;
  }

  return normalized;
}

async function saveShortcutButtons(shortcuts: readonly ShortcutButton[]) {
  const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
  await store.set(STORE_KEY, shortcuts);
  await store.save();
}

function actionTypeToIcon(actionType: ShortcutActionType): ShortcutIcon {
  switch (actionType) {
    case "url":
      return "globe";
    case "file":
      return "folder";
    case "app":
      return "app";
  }
}

export function createShortcutButton(
  index: number,
  existing?: Partial<ShortcutButton>,
): ShortcutButton {
  const actionType = existing?.actionType ?? "url";

  return {
    id: existing?.id ?? `shortcut-${Date.now()}-${index}`,
    label: existing?.label?.trim() || `Shortcut ${index + 1}`,
    actionType,
    target: existing?.target?.trim() ?? "",
    icon: existing?.icon ?? actionTypeToIcon(actionType),
  };
}

export function useShortcutButtons() {
  const [shortcutButtons, setShortcutButtonsState] = useState<ShortcutButton[]>(
    [...DEFAULT_SHORTCUT_BUTTONS],
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const saved = await store.get<unknown>(STORE_KEY);
      const initial = normalizeShortcutButtons(saved);

      if (cancelled) return;

      setShortcutButtonsState(initial);
      setIsLoaded(true);

      if (JSON.stringify(initial) !== JSON.stringify(saved)) {
        await store.set(STORE_KEY, initial);
        await store.save();
      }
    };

    init().catch((err) => {
      console.error("Failed to load shortcut buttons:", err);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setShortcutButtons = useCallback((next: readonly ShortcutButton[]) => {
    const normalized = normalizeShortcutButtons(next);
    setShortcutButtonsState(normalized);
    saveShortcutButtons(normalized).catch((err) => {
      console.error("Failed to save shortcut buttons:", err);
    });
  }, []);

  return { shortcutButtons, isLoaded, setShortcutButtons };
}

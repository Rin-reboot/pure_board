import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const STORE_FILE = "settings.json";
const STORE_KEY = "closeActionPreference";

export type CloseActionPreference = "ask" | "exit" | "minimizeToTray";
export type CloseAction = Exclude<CloseActionPreference, "ask">;

const DEFAULT_CLOSE_ACTION_PREFERENCE: CloseActionPreference = "ask";

function isCloseActionPreference(
  value: unknown,
): value is CloseActionPreference {
  return value === "ask" || value === "exit" || value === "minimizeToTray";
}

export function useCloseActionPreference() {
  const [closeActionPreference, setCloseActionPreferenceState] =
    useState<CloseActionPreference>(DEFAULT_CLOSE_ACTION_PREFERENCE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const saved = await store.get<unknown>(STORE_KEY);
      const initial = isCloseActionPreference(saved)
        ? saved
        : DEFAULT_CLOSE_ACTION_PREFERENCE;

      if (cancelled) return;

      setCloseActionPreferenceState(initial);
      setIsLoaded(true);

      if (!isCloseActionPreference(saved)) {
        await store.set(STORE_KEY, initial);
        await store.save();
      }
    };

    init().catch((err) => {
      console.error("Failed to load close action preference:", err);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setCloseActionPreference = useCallback(
    async (next: CloseActionPreference) => {
      setCloseActionPreferenceState(next);

      try {
        const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
        await store.set(STORE_KEY, next);
        await store.save();
      } catch (err) {
        console.error("Failed to save close action preference:", err);
      }
    },
    [],
  );

  return { closeActionPreference, isLoaded, setCloseActionPreference };
}

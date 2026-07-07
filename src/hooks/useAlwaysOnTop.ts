import { getCurrentWindow } from "@tauri-apps/api/window";
import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const STORE_FILE = "settings.json";
const STORE_KEY = "alwaysOnTop";
const DEFAULT_ALWAYS_ON_TOP = false;

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function useAlwaysOnTop() {
  const [isPinned, setIsPinned] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const saved = await store.get<unknown>(STORE_KEY);
      const initial = isBoolean(saved) ? saved : DEFAULT_ALWAYS_ON_TOP;

      if (cancelled) return;

      setIsPinned(initial);
      await getCurrentWindow().setAlwaysOnTop(initial);
      setIsLoaded(true);

      if (!isBoolean(saved)) {
        await store.set(STORE_KEY, initial);
        await store.save();
      }
    };

    init().catch((err) => {
      console.error("Failed to load always-on-top setting:", err);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const togglePin = useCallback(async () => {
    const next = !isPinned;
    setIsPinned(next);
    try {
      await getCurrentWindow().setAlwaysOnTop(next);
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(STORE_KEY, next);
      await store.save();
    } catch (err) {
      console.error("Failed to toggle always-on-top:", err);
      setIsPinned(!next);
    }
  }, [isPinned]);

  return { isPinned, togglePin, isLoaded };
}

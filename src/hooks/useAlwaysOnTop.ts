import { getCurrentWindow } from "@tauri-apps/api/window";
import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const STORE_FILE = "settings.json";
const STORE_KEY = "alwaysOnTop";

export function useAlwaysOnTop() {
  const [isPinned, setIsPinned] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 起動時に前回の設定を復元
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const saved = await store.get<boolean>(STORE_KEY);
      const initial = saved ?? false;

      if (cancelled) return;

      setIsPinned(initial);
      await getCurrentWindow().setAlwaysOnTop(initial);
      setIsLoaded(true);
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
      setIsPinned(!next); // 失敗したらUIの状態を元に戻す
    }
  }, [isPinned]);

  return { isPinned, togglePin, isLoaded };
}

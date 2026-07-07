import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const STORE_FILE = "settings.json";
const STORE_KEY = "systemUsageIntervalMs";
export const MIN_UPDATE_INTERVAL_MS = 100;
const DEFAULT_UPDATE_INTERVAL_MS = 1500;

function isValidInterval(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeIntervalMs(value: number): number {
  return Math.max(MIN_UPDATE_INTERVAL_MS, Math.round(value));
}

export function useUpdateIntervalSetting() {
  const [updateIntervalMs, setUpdateIntervalMsState] = useState(
    DEFAULT_UPDATE_INTERVAL_MS,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const saved = await store.get<unknown>(STORE_KEY);
      const initialInterval = isValidInterval(saved)
        ? normalizeIntervalMs(saved)
        : DEFAULT_UPDATE_INTERVAL_MS;

      if (cancelled) return;

      setUpdateIntervalMsState(initialInterval);
      setIsLoaded(true);

      if (!isValidInterval(saved)) {
        await store.set(STORE_KEY, initialInterval);
        await store.save();
      }
    };

    init().catch((err) => {
      console.error("Failed to load update interval:", err);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setUpdateIntervalMs = useCallback(async (next: number) => {
    if (!isValidInterval(next)) return;

    const normalized = normalizeIntervalMs(next);
    setUpdateIntervalMsState(normalized);
    try {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(STORE_KEY, normalized);
      await store.save();
    } catch (err) {
      console.error("Failed to save update interval:", err);
    }
  }, []);

  return { updateIntervalMs, setUpdateIntervalMs, isLoaded };
}

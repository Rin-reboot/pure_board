import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const STORE_FILE = "settings.json";
const ENABLED_KEY = "trayStatusEnabled";
const METRIC_KEY = "trayStatusMetric";
const INTERVAL_KEY = "trayStatusIntervalSeconds";

export const MIN_TRAY_STATUS_INTERVAL_SECONDS = 1;
export const MAX_TRAY_STATUS_INTERVAL_SECONDS = 60;

export type TrayStatusMetric = "cpu" | "memory" | "network";

const DEFAULT_ENABLED = true;
const DEFAULT_METRIC: TrayStatusMetric = "cpu";
const DEFAULT_INTERVAL_SECONDS = 1;

function isTrayStatusMetric(value: unknown): value is TrayStatusMetric {
  return value === "cpu" || value === "memory" || value === "network";
}

function normalizeIntervalSeconds(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_INTERVAL_SECONDS;
  return Math.min(
    MAX_TRAY_STATUS_INTERVAL_SECONDS,
    Math.max(MIN_TRAY_STATUS_INTERVAL_SECONDS, Math.round(value)),
  );
}

export function useTrayStatusSettings() {
  const [isEnabled, setIsEnabledState] = useState(DEFAULT_ENABLED);
  const [metric, setMetricState] = useState<TrayStatusMetric>(DEFAULT_METRIC);
  const [intervalSeconds, setIntervalSecondsState] = useState(
    DEFAULT_INTERVAL_SECONDS,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const [savedEnabled, savedMetric, savedInterval] = await Promise.all([
        store.get<unknown>(ENABLED_KEY),
        store.get<unknown>(METRIC_KEY),
        store.get<unknown>(INTERVAL_KEY),
      ]);

      const initialEnabled =
        typeof savedEnabled === "boolean" ? savedEnabled : DEFAULT_ENABLED;
      const initialMetric = isTrayStatusMetric(savedMetric)
        ? savedMetric
        : DEFAULT_METRIC;
      const initialInterval =
        typeof savedInterval === "number"
          ? normalizeIntervalSeconds(savedInterval)
          : DEFAULT_INTERVAL_SECONDS;

      if (cancelled) return;

      setIsEnabledState(initialEnabled);
      setMetricState(initialMetric);
      setIntervalSecondsState(initialInterval);
      setIsLoaded(true);

      let shouldSave = false;
      if (typeof savedEnabled !== "boolean") {
        await store.set(ENABLED_KEY, initialEnabled);
        shouldSave = true;
      }
      if (!isTrayStatusMetric(savedMetric)) {
        await store.set(METRIC_KEY, initialMetric);
        shouldSave = true;
      }
      if (
        typeof savedInterval !== "number" ||
        savedInterval !== initialInterval
      ) {
        await store.set(INTERVAL_KEY, initialInterval);
        shouldSave = true;
      }
      if (shouldSave) await store.save();
    };

    init().catch((err) => {
      console.error("Failed to load tray status settings:", err);
      if (!cancelled) {
        setIsLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncWithBackend = () => {
      void invoke("configure_tray_status", {
        settings: {
          enabled: isEnabled,
          metric,
          intervalSeconds,
          reducedMotion: mediaQuery.matches,
        },
      }).catch((err) => {
        console.error("Failed to configure tray status:", err);
      });
    };

    syncWithBackend();
    mediaQuery.addEventListener?.("change", syncWithBackend);
    return () => mediaQuery.removeEventListener?.("change", syncWithBackend);
  }, [intervalSeconds, isEnabled, isLoaded, metric]);

  const setIsEnabled = useCallback(async (next: boolean) => {
    setIsEnabledState(next);
    try {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(ENABLED_KEY, next);
      await store.save();
    } catch (err) {
      console.error("Failed to save tray status visibility:", err);
    }
  }, []);

  const setMetric = useCallback(async (next: TrayStatusMetric) => {
    setMetricState(next);
    try {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(METRIC_KEY, next);
      await store.save();
    } catch (err) {
      console.error("Failed to save tray status metric:", err);
    }
  }, []);

  const setIntervalSeconds = useCallback(async (next: number) => {
    const normalized = normalizeIntervalSeconds(next);
    setIntervalSecondsState(normalized);
    try {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(INTERVAL_KEY, normalized);
      await store.save();
    } catch (err) {
      console.error("Failed to save tray status interval:", err);
    }
  }, []);

  return {
    intervalSeconds,
    isEnabled,
    isLoaded,
    metric,
    setIntervalSeconds,
    setIsEnabled,
    setMetric,
  };
}

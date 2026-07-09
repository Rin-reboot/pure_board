import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const STORE_FILE = "settings.json";
const STORE_KEY = "pingTargetHost";
export const DEFAULT_PING_TARGET_HOST = "8.8.8.8";

function normalizePingTargetHost(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_PING_TARGET_HOST;

  const host = value.trim();
  return host.length > 0 ? host : DEFAULT_PING_TARGET_HOST;
}

export function usePingTargetSetting() {
  const [pingTargetHost, setPingTargetHostState] = useState(
    DEFAULT_PING_TARGET_HOST,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const saved = await store.get<unknown>(STORE_KEY);
      const initialHost = normalizePingTargetHost(saved);

      if (cancelled) return;

      setPingTargetHostState(initialHost);
      setIsLoaded(true);

      if (initialHost !== saved) {
        await store.set(STORE_KEY, initialHost);
        await store.save();
      }
    };

    init().catch((err) => {
      console.error("Failed to load ping target host:", err);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setPingTargetHost = useCallback(async (next: string) => {
    const normalized = normalizePingTargetHost(next);
    setPingTargetHostState(normalized);

    try {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(STORE_KEY, normalized);
      await store.save();
    } catch (err) {
      console.error("Failed to save ping target host:", err);
    }
  }, []);

  return { pingTargetHost, isLoaded, setPingTargetHost };
}

import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { useCallback, useEffect, useState } from "react";

export function useAutoStart() {
  const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const enabled = await isEnabled();

      if (cancelled) return;

      setIsAutoStartEnabled(enabled);
      setIsLoaded(true);
    };

    init().catch((err) => {
      console.error("Failed to load auto-start setting:", err);
      if (!cancelled) {
        setIsLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleAutoStart = useCallback(async () => {
    const next = !isAutoStartEnabled;
    setIsAutoStartEnabled(next);

    try {
      if (next) {
        await enable();
      } else {
        await disable();
      }
    } catch (err) {
      console.error("Failed to toggle auto-start:", err);
      setIsAutoStartEnabled(!next);
    }
  }, [isAutoStartEnabled]);

  return { isAutoStartEnabled, isLoaded, toggleAutoStart };
}

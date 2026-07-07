import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORE_FILE = "settings.json";
const STORE_KEY = "theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const saved = await store.get<unknown>(STORE_KEY);

      if (cancelled) return;

      const initialTheme = isTheme(saved) ? saved : getSystemTheme();
      setThemeState(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
      setIsLoaded(true);

      if (!isTheme(saved)) {
        await store.set(STORE_KEY, initialTheme);
        await store.save();
      }
    };

    init().catch((err) => {
      console.error("Failed to load theme:", err);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback(async (next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(STORE_KEY, next);
      await store.save();
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, toggleTheme, isLoaded };
}

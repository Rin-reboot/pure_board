import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const STORE_FILE = "settings.json";
const COMPLETED_KEY = "firstRunTutorialCompleted";
const LEGACY_HELP_SHOWN_KEY = "trayStatusHelpShown";

export function useFirstRunTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const [completed, legacyHelpShown] = await Promise.all([
        store.get<unknown>(COMPLETED_KEY),
        store.get<unknown>(LEGACY_HELP_SHOWN_KEY),
      ]);
      const wasPreviouslyIntroduced =
        completed === true || legacyHelpShown === true;

      if (cancelled) return;

      setIsOpen(!wasPreviouslyIntroduced);
      setIsLoaded(true);

      if (completed !== true && legacyHelpShown === true) {
        await store.set(COMPLETED_KEY, true);
        await store.save();
      }
    };

    init().catch((err) => {
      console.error("Failed to load first-run tutorial state:", err);
      if (!cancelled) {
        setIsOpen(true);
        setIsLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(async () => {
    setIsOpen(false);

    try {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      await store.set(COMPLETED_KEY, true);
      await store.save();
    } catch (err) {
      console.error("Failed to save first-run tutorial state:", err);
    }
  }, []);

  return {
    dismiss,
    isLoaded,
    isOpen,
  };
}

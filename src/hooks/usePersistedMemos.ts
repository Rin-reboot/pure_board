import { load, type Store } from "@tauri-apps/plugin-store";
import { useEffect, useRef, useState } from "react";

export interface MemoItem {
  id: string;
  text: string;
  done: boolean;
  tag: string;
}

const STORE_FILE = "memos.json";
const STORE_KEY = "memos";
const MAX_MEMOS = 200;
const MAX_MEMO_TEXT_LENGTH = 500;
const MAX_MEMO_TAG_LENGTH = 40;

const defaultMemos: MemoItem[] = [];

function isMemoItem(value: unknown): value is MemoItem {
  return (
    value !== null &&
    typeof value === "object" &&
    "id" in value &&
    "text" in value &&
    "done" in value &&
    "tag" in value &&
    typeof value.id === "string" &&
    typeof value.text === "string" &&
    typeof value.done === "boolean" &&
    typeof value.tag === "string" &&
    value.id.length > 0 &&
    value.text.length <= MAX_MEMO_TEXT_LENGTH &&
    value.tag.length <= MAX_MEMO_TAG_LENGTH
  );
}

function normalizeMemos(value: unknown): MemoItem[] {
  if (!Array.isArray(value)) return defaultMemos;
  return value.filter(isMemoItem).slice(0, MAX_MEMOS);
}

export function usePersistedMemos() {
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const storeRef = useRef<Store | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      storeRef.current = store;

      const saved = await store.get<unknown>(STORE_KEY);
      const initialMemos = normalizeMemos(saved);

      if (cancelled) return;

      setMemos(initialMemos);

      if (JSON.stringify(initialMemos) !== JSON.stringify(saved)) {
        await store.set(STORE_KEY, initialMemos);
        await store.save();
      }

      setIsLoaded(true);
    };

    init().catch((err) => {
      console.error("Failed to load memos:", err);
      setMemos(defaultMemos);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !storeRef.current) return;

    const persist = async () => {
      try {
        await storeRef.current?.set(STORE_KEY, memos);
        await storeRef.current?.save();
      } catch (err) {
        console.error("Failed to save memos:", err);
      }
    };

    persist();
  }, [memos, isLoaded]);

  const deleteMemo = (id: string) => {
    setMemos((prev) => prev.filter((memo) => memo.id !== id));
  };

  return { memos, setMemos, deleteMemo, isLoaded };
}

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

const defaultMemos: MemoItem[] = [];

export function usePersistedMemos() {
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const storeRef = useRef<Store | null>(null);

  // 起動時に1回だけファイルから読み込む
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false });
      storeRef.current = store;

      const saved = await store.get<MemoItem[]>(STORE_KEY);

      if (cancelled) return;

      if (saved && saved.length > 0) {
        setMemos(saved);
      } else {
        // 初回起動時はサンプルデータを入れておく
        setMemos(defaultMemos);
        await store.set(STORE_KEY, defaultMemos);
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

  // memosが変わるたびファイルに書き込む(初回ロード完了後のみ)
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

  return { memos, setMemos, isLoaded };
}

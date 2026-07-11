import { load, type Store } from "@tauri-apps/plugin-store";
import { useEffect, useRef, useState } from "react";

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  tag: string;
}

const STORE_FILE = "todos.json";
const STORE_KEY = "todos";
const LEGACY_STORE_FILE = "memos.json";
const LEGACY_STORE_KEY = "memos";
const MAX_TODOS = 200;
const MAX_TODO_TEXT_LENGTH = 500;
const MAX_TODO_TAG_LENGTH = 40;

const defaultTodos: TodoItem[] = [];

function isTodoItem(value: unknown): value is TodoItem {
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
    value.text.length <= MAX_TODO_TEXT_LENGTH &&
    value.tag.length <= MAX_TODO_TAG_LENGTH
  );
}

function normalizeTodos(value: unknown): TodoItem[] {
  if (!Array.isArray(value)) return defaultTodos;
  return value.filter(isTodoItem).slice(0, MAX_TODOS);
}

export function usePersistedTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const storeRef = useRef<Store | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      storeRef.current = store;

      const saved = await store.get<unknown>(STORE_KEY);
      let source = saved;

      if (source === undefined) {
        const legacyStore = await load(LEGACY_STORE_FILE, {
          autoSave: false,
          defaults: {},
        });
        source = await legacyStore.get<unknown>(LEGACY_STORE_KEY);
      }

      const initialTodos = normalizeTodos(source);

      if (cancelled) return;

      setTodos(initialTodos);

      if (
        saved === undefined ||
        JSON.stringify(initialTodos) !== JSON.stringify(saved)
      ) {
        await store.set(STORE_KEY, initialTodos);
        await store.save();
      }

      setIsLoaded(true);
    };

    init().catch((err) => {
      console.error("Failed to load todos:", err);
      setTodos(defaultTodos);
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
        await storeRef.current?.set(STORE_KEY, todos);
        await storeRef.current?.save();
      } catch (err) {
        console.error("Failed to save todos:", err);
      }
    };

    persist();
  }, [todos, isLoaded]);

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return { todos, setTodos, deleteTodo, isLoaded };
}

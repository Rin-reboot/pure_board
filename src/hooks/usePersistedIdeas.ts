import { load, type Store } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useRef, useState } from "react";

export interface IdeaItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaContent {
  title: string;
  body: string;
}

const STORE_FILE = "ideas.json";
const STORE_KEY = "ideas";
const MAX_IDEAS = 500;
export const MAX_IDEA_TITLE_LENGTH = 200;
export const MAX_IDEA_BODY_LENGTH = 200_000;

const defaultIdeas: IdeaItem[] = [];

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function normalizeIdeaContent(content?: Partial<IdeaContent>): IdeaContent {
  return {
    title: (content?.title ?? "").slice(0, MAX_IDEA_TITLE_LENGTH),
    body: (content?.body ?? "").slice(0, MAX_IDEA_BODY_LENGTH),
  };
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isIdeaItem(value: unknown): value is IdeaItem {
  return (
    value !== null &&
    typeof value === "object" &&
    "id" in value &&
    "title" in value &&
    "body" in value &&
    "createdAt" in value &&
    "updatedAt" in value &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    value.id.length > 0 &&
    value.title.length <= MAX_IDEA_TITLE_LENGTH &&
    value.body.length <= MAX_IDEA_BODY_LENGTH &&
    isValidTimestamp(value.createdAt) &&
    isValidTimestamp(value.updatedAt)
  );
}

function normalizeIdeas(value: unknown): IdeaItem[] {
  if (!Array.isArray(value)) return defaultIdeas;

  const ideas: IdeaItem[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (!isIdeaItem(item) || seen.has(item.id)) continue;
    ideas.push(item);
    seen.add(item.id);

    if (ideas.length === MAX_IDEAS) break;
  }

  return ideas;
}

export function usePersistedIdeas() {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const storeRef = useRef<Store | null>(null);
  const ideasRef = useRef<IdeaItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      storeRef.current = store;

      const saved = await store.get<unknown>(STORE_KEY);
      const initialIdeas = normalizeIdeas(saved);

      if (cancelled) return;

      setIdeas(initialIdeas);
      ideasRef.current = initialIdeas;
      setErrorMessage(null);

      if (JSON.stringify(initialIdeas) !== JSON.stringify(saved)) {
        await store.set(STORE_KEY, initialIdeas);
        await store.save();
      }

      setIsLoaded(true);
    };

    init().catch((err) => {
      console.error("Failed to load ideas:", err);
      setIdeas(defaultIdeas);
      ideasRef.current = defaultIdeas;
      setErrorMessage(getErrorMessage(err));
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
        await storeRef.current?.set(STORE_KEY, ideas);
        await storeRef.current?.save();
        setErrorMessage(null);
      } catch (err) {
        console.error("Failed to save ideas:", err);
        setErrorMessage(getErrorMessage(err));
      }
    };

    void persist();
  }, [ideas, isLoaded]);

  const createIdea = useCallback((content?: Partial<IdeaContent>) => {
    const timestamp = new Date().toISOString();
    const normalizedContent = normalizeIdeaContent(content);
    const idea: IdeaItem = {
      id: crypto.randomUUID(),
      ...normalizedContent,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setIdeas((current) => {
      const next = [idea, ...current].slice(0, MAX_IDEAS);
      ideasRef.current = next;
      return next;
    });
    return idea;
  }, []);

  const updateIdea = useCallback((id: string, content: IdeaContent) => {
    const updatedAt = new Date().toISOString();
    const normalizedContent = normalizeIdeaContent(content);
    setIdeas((current) => {
      const next = current.map((idea) =>
        idea.id === id ? { ...idea, ...normalizedContent, updatedAt } : idea,
      );
      ideasRef.current = next;
      return next;
    });
  }, []);

  const deleteIdea = useCallback((id: string) => {
    setIdeas((current) => {
      const next = current.filter((idea) => idea.id !== id);
      ideasRef.current = next;
      return next;
    });
  }, []);

  const saveIdea = useCallback(
    async (content: IdeaContent, id?: string): Promise<IdeaItem> => {
      const store = storeRef.current;
      if (!store) throw new Error("Ideas are not loaded yet");

      const timestamp = new Date().toISOString();
      const normalizedContent = normalizeIdeaContent(content);
      const existing = id
        ? ideasRef.current.find((idea) => idea.id === id)
        : undefined;
      const savedIdea: IdeaItem = existing
        ? { ...existing, ...normalizedContent, updatedAt: timestamp }
        : {
            id: crypto.randomUUID(),
            ...normalizedContent,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
      const nextIdeas = existing
        ? ideasRef.current.map((idea) =>
            idea.id === existing.id ? savedIdea : idea,
          )
        : [savedIdea, ...ideasRef.current].slice(0, MAX_IDEAS);

      try {
        await store.set(STORE_KEY, nextIdeas);
        await store.save();
        ideasRef.current = nextIdeas;
        setIdeas(nextIdeas);
        setErrorMessage(null);
        return savedIdea;
      } catch (err) {
        console.error("Failed to save idea:", err);
        setErrorMessage(getErrorMessage(err));
        throw err;
      }
    },
    [],
  );

  const removeIdea = useCallback(async (id: string): Promise<void> => {
    const store = storeRef.current;
    if (!store) throw new Error("Ideas are not loaded yet");

    const nextIdeas = ideasRef.current.filter((idea) => idea.id !== id);
    try {
      await store.set(STORE_KEY, nextIdeas);
      await store.save();
      ideasRef.current = nextIdeas;
      setIdeas(nextIdeas);
      setErrorMessage(null);
    } catch (err) {
      console.error("Failed to remove idea:", err);
      setErrorMessage(getErrorMessage(err));
      throw err;
    }
  }, []);

  const reloadIdeas = useCallback(async () => {
    const store = storeRef.current;
    if (!store) return;

    try {
      const saved = await store.get<unknown>(STORE_KEY);
      const reloadedIdeas = normalizeIdeas(saved);
      ideasRef.current = reloadedIdeas;
      setIdeas(reloadedIdeas);
      setErrorMessage(null);
    } catch (err) {
      console.error("Failed to reload ideas:", err);
      setErrorMessage(getErrorMessage(err));
    }
  }, []);

  return {
    ideas,
    isLoaded,
    errorMessage,
    createIdea,
    updateIdea,
    deleteIdea,
    saveIdea,
    removeIdea,
    reloadIdeas,
  };
}

import { load } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const STORE_FILE = "settings.json";
const STORE_KEY = "widgetLayout";

export type WidgetId = "cpu" | "ram" | "network" | "todo" | "ideas";

export interface WidgetLayoutItem {
  id: WidgetId;
  visible: boolean;
}

export const DEFAULT_WIDGET_LAYOUT: readonly WidgetLayoutItem[] = [
  { id: "cpu", visible: true },
  { id: "ram", visible: true },
  { id: "network", visible: true },
  { id: "todo", visible: true },
  { id: "ideas", visible: true },
];

const DEFAULT_WIDGET_IDS = DEFAULT_WIDGET_LAYOUT.map((item) => item.id);

function isWidgetId(value: unknown): value is WidgetId {
  return (
    typeof value === "string" && DEFAULT_WIDGET_IDS.includes(value as WidgetId)
  );
}

function normalizeWidgetId(value: unknown): WidgetId | null {
  if (value === "memo") return "todo";
  return isWidgetId(value) ? value : null;
}

function normalizeWidgetLayout(value: unknown): WidgetLayoutItem[] {
  const normalized: WidgetLayoutItem[] = [];
  const seen = new Set<WidgetId>();

  if (Array.isArray(value)) {
    for (const item of value) {
      const id =
        item && typeof item === "object" && "id" in item
          ? normalizeWidgetId(item.id)
          : null;

      if (item && typeof item === "object" && id && !seen.has(id)) {
        normalized.push({
          id,
          visible: "visible" in item ? item.visible !== false : true,
        });
        seen.add(id);
      }
    }
  }

  for (const item of DEFAULT_WIDGET_LAYOUT) {
    if (!seen.has(item.id)) {
      normalized.push(item);
    }
  }

  return normalized;
}

async function saveWidgetLayout(layout: readonly WidgetLayoutItem[]) {
  const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
  await store.set(STORE_KEY, layout);
  await store.save();
}

function moveItem(
  layout: readonly WidgetLayoutItem[],
  sourceId: WidgetId,
  targetId: WidgetId,
  placement: "before" | "after",
): WidgetLayoutItem[] {
  if (sourceId === targetId) return [...layout];

  const sourceIndex = layout.findIndex((item) => item.id === sourceId);
  const targetIndex = layout.findIndex((item) => item.id === targetId);

  if (sourceIndex < 0 || targetIndex < 0) return [...layout];

  const next = [...layout];
  const [source] = next.splice(sourceIndex, 1);
  const adjustedTargetIndex = next.findIndex((item) => item.id === targetId);
  const insertIndex =
    placement === "before" ? adjustedTargetIndex : adjustedTargetIndex + 1;

  next.splice(insertIndex, 0, source);
  return next;
}

export function useWidgetLayout() {
  const [layout, setLayout] = useState<WidgetLayoutItem[]>([
    ...DEFAULT_WIDGET_LAYOUT,
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
      const saved = await store.get<unknown>(STORE_KEY);
      const initialLayout = normalizeWidgetLayout(saved);

      if (cancelled) return;

      setLayout(initialLayout);
      setIsLoaded(true);

      if (JSON.stringify(initialLayout) !== JSON.stringify(saved)) {
        await store.set(STORE_KEY, initialLayout);
        await store.save();
      }
    };

    init().catch((err) => {
      console.error("Failed to load widget layout:", err);
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persistLayout = useCallback((next: WidgetLayoutItem[]) => {
    setLayout(next);
    saveWidgetLayout(next).catch((err) => {
      console.error("Failed to save widget layout:", err);
    });
  }, []);

  const moveWidget = useCallback(
    (sourceId: WidgetId, targetId: WidgetId, placement: "before" | "after") => {
      setLayout((current) => {
        const next = moveItem(current, sourceId, targetId, placement);

        if (JSON.stringify(next) === JSON.stringify(current)) {
          return current;
        }

        saveWidgetLayout(next).catch((err) => {
          console.error("Failed to save widget layout:", err);
        });
        return next;
      });
    },
    [],
  );

  const toggleWidgetVisibility = useCallback(
    (id: WidgetId) => {
      const next = layout.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item,
      );
      persistLayout(next);
    },
    [layout, persistLayout],
  );

  return { layout, isLoaded, moveWidget, toggleWidgetVisibility };
}

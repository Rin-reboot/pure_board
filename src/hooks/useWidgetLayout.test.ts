import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWidgetLayout } from "./useWidgetLayout";

interface MockStore {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
}

const storeMocks = vi.hoisted(() => ({
  load: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: storeMocks.load,
}));

function createStore(savedLayout: unknown): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedLayout),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  storeMocks.load.mockReset();
});

describe("useWidgetLayout", () => {
  it("loads a saved widget layout", async () => {
    const savedLayout = [
      { id: "todo", visible: true },
      { id: "cpu", visible: true },
      { id: "ram", visible: false },
      { id: "network", visible: true },
      { id: "ideas", visible: true },
    ];
    const store = createStore(savedLayout);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useWidgetLayout());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.layout).toEqual(savedLayout);
    expect(store.set).not.toHaveBeenCalled();
  });

  it("migrates the legacy memo widget id", async () => {
    const store = createStore([
      { id: "memo", visible: false },
      { id: "cpu", visible: true },
      { id: "ram", visible: true },
      { id: "network", visible: true },
      { id: "ideas", visible: true },
    ]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useWidgetLayout());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.layout[0]).toEqual({ id: "todo", visible: false });
    expect(store.set).toHaveBeenCalledWith(
      "widgetLayout",
      result.current.layout,
    );
  });

  it("fills missing widgets when saved layout is incomplete", async () => {
    const store = createStore([{ id: "todo", visible: false }]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useWidgetLayout());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.layout).toEqual([
      { id: "todo", visible: false },
      { id: "cpu", visible: true },
      { id: "ram", visible: true },
      { id: "network", visible: true },
      { id: "ideas", visible: true },
    ]);
    expect(store.set).toHaveBeenCalledWith(
      "widgetLayout",
      result.current.layout,
    );
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("toggles widget visibility and persists the layout", async () => {
    const store = createStore(undefined);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useWidgetLayout());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      result.current.toggleWidgetVisibility("network");
    });

    expect(result.current.layout.find((item) => item.id === "network")).toEqual(
      {
        id: "network",
        visible: false,
      },
    );
    expect(store.set).toHaveBeenLastCalledWith(
      "widgetLayout",
      result.current.layout,
    );
  });

  it("moves widgets before or after a target and persists the order", async () => {
    const store = createStore(undefined);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useWidgetLayout());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => {
      result.current.moveWidget("todo", "cpu", "before");
    });

    expect(result.current.layout.map((item) => item.id)).toEqual([
      "todo",
      "cpu",
      "ram",
      "network",
      "ideas",
    ]);

    act(() => {
      result.current.moveWidget("todo", "network", "after");
    });

    expect(result.current.layout.map((item) => item.id)).toEqual([
      "cpu",
      "ram",
      "network",
      "todo",
      "ideas",
    ]);
    expect(store.set).toHaveBeenLastCalledWith(
      "widgetLayout",
      result.current.layout,
    );
  });
});

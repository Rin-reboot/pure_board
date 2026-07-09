import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ShortcutButton, useShortcutButtons } from "./useShortcutButtons";

interface MockStore {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: mocks.load,
}));

function createStore(savedShortcuts: unknown): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedShortcuts),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  mocks.load.mockReset();
});

describe("useShortcutButtons", () => {
  it("loads saved shortcut buttons", async () => {
    const shortcut: ShortcutButton = {
      id: "shortcut-1",
      label: "Docs",
      actionType: "url",
      target: "https://example.com",
      icon: "globe",
    };
    const store = createStore([shortcut]);
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useShortcutButtons());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.shortcutButtons).toEqual([shortcut]);
    expect(store.set).not.toHaveBeenCalled();
  });

  it("drops invalid saved shortcut buttons and persists the normalized list", async () => {
    const validShortcut: ShortcutButton = {
      id: "shortcut-1",
      label: "Docs",
      actionType: "url",
      target: "https://example.com",
      icon: "globe",
    };
    const store = createStore([
      validShortcut,
      { id: "", label: "Missing id", actionType: "url", target: "" },
      "invalid",
    ]);
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useShortcutButtons());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.shortcutButtons).toEqual([validShortcut]);
    expect(store.set).toHaveBeenCalledWith("shortcutButtons", [validShortcut]);
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("persists shortcut button changes", async () => {
    const store = createStore([]);
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useShortcutButtons());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    const shortcut: ShortcutButton = {
      id: "shortcut-1",
      label: "Docs",
      actionType: "url",
      target: "https://example.com",
      icon: "globe",
    };

    act(() => {
      result.current.setShortcutButtons([shortcut]);
    });

    expect(result.current.shortcutButtons).toEqual([shortcut]);
    await waitFor(() =>
      expect(store.set).toHaveBeenLastCalledWith("shortcutButtons", [shortcut]),
    );
  });
});

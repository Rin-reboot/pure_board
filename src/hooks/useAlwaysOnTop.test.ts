import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAlwaysOnTop } from "./useAlwaysOnTop";

interface MockStore {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  setAlwaysOnTop: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: mocks.load,
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    setAlwaysOnTop: mocks.setAlwaysOnTop,
  }),
}));

function createStore(savedPinned: unknown): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedPinned),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  mocks.load.mockReset();
  mocks.setAlwaysOnTop.mockReset();
});

describe("useAlwaysOnTop", () => {
  it("loads and applies the saved pinned state", async () => {
    const store = createStore(true);
    mocks.load.mockResolvedValue(store);
    mocks.setAlwaysOnTop.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAlwaysOnTop());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.isPinned).toBe(true);
    expect(mocks.setAlwaysOnTop).toHaveBeenCalledWith(true);
  });

  it("uses and persists the default pinned state when saved value is invalid", async () => {
    const store = createStore("yes");
    mocks.load.mockResolvedValue(store);
    mocks.setAlwaysOnTop.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAlwaysOnTop());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.isPinned).toBe(false);
    expect(mocks.setAlwaysOnTop).toHaveBeenCalledWith(false);
    expect(store.set).toHaveBeenCalledWith("alwaysOnTop", false);
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("toggles, applies, and persists the pinned state", async () => {
    const store = createStore(false);
    mocks.load.mockResolvedValue(store);
    mocks.setAlwaysOnTop.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAlwaysOnTop());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.togglePin();
    });

    expect(result.current.isPinned).toBe(true);
    expect(mocks.setAlwaysOnTop).toHaveBeenLastCalledWith(true);
    expect(store.set).toHaveBeenCalledWith("alwaysOnTop", true);
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("rolls back the pinned state when toggling fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const store = createStore(false);
    mocks.load.mockResolvedValue(store);
    mocks.setAlwaysOnTop
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("failed"));

    const { result } = renderHook(() => useAlwaysOnTop());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.togglePin();
    });

    expect(result.current.isPinned).toBe(false);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});

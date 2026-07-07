import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUpdateIntervalSetting } from "./useUpdateIntervalSetting";

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

function createStore(savedInterval: unknown): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedInterval),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  storeMocks.load.mockReset();
});

describe("useUpdateIntervalSetting", () => {
  it("loads a saved update interval", async () => {
    const store = createStore(2400);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useUpdateIntervalSetting());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.updateIntervalMs).toBe(2400);
    expect(store.set).not.toHaveBeenCalled();
  });

  it("uses and persists the default interval when saved value is not a number", async () => {
    const store = createStore("fast");
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useUpdateIntervalSetting());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.updateIntervalMs).toBe(1500);
    expect(store.set).toHaveBeenCalledWith("systemUsageIntervalMs", 1500);
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("updates and persists a custom interval", async () => {
    const store = createStore(1500);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useUpdateIntervalSetting());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.setUpdateIntervalMs(2400);
    });

    expect(result.current.updateIntervalMs).toBe(2400);
    expect(store.set).toHaveBeenLastCalledWith("systemUsageIntervalMs", 2400);
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("clamps intervals below the minimum to 100ms", async () => {
    const store = createStore(1500);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useUpdateIntervalSetting());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.setUpdateIntervalMs(50);
    });

    expect(result.current.updateIntervalMs).toBe(100);
    expect(store.set).toHaveBeenLastCalledWith("systemUsageIntervalMs", 100);
    expect(store.save).toHaveBeenCalledTimes(1);
  });
});

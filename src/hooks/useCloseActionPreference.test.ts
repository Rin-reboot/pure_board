import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCloseActionPreference } from "./useCloseActionPreference";

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

function createStore(savedPreference: unknown): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedPreference),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  mocks.load.mockReset();
});

describe("useCloseActionPreference", () => {
  it("loads a saved close action preference", async () => {
    const store = createStore("minimizeToTray");
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useCloseActionPreference());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.closeActionPreference).toBe("minimizeToTray");
  });

  it("uses and persists the default preference when the saved value is invalid", async () => {
    const store = createStore("hide");
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useCloseActionPreference());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.closeActionPreference).toBe("ask");
    expect(store.set).toHaveBeenCalledWith("closeActionPreference", "ask");
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("persists preference changes", async () => {
    const store = createStore("ask");
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useCloseActionPreference());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.setCloseActionPreference("exit");
    });

    expect(result.current.closeActionPreference).toBe("exit");
    expect(store.set).toHaveBeenCalledWith("closeActionPreference", "exit");
    expect(store.save).toHaveBeenCalledTimes(1);
  });
});

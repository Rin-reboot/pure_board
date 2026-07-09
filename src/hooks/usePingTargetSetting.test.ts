import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PING_TARGET_HOST,
  usePingTargetSetting,
} from "./usePingTargetSetting";

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

function createStore(savedHost: unknown): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedHost),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  mocks.load.mockReset();
});

describe("usePingTargetSetting", () => {
  it("loads a saved ping target host", async () => {
    const store = createStore("example.com");
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePingTargetSetting());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.pingTargetHost).toBe("example.com");
    expect(store.set).not.toHaveBeenCalled();
  });

  it("uses and persists the default host when the saved value is invalid", async () => {
    const store = createStore("");
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePingTargetSetting());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.pingTargetHost).toBe(DEFAULT_PING_TARGET_HOST);
    expect(store.set).toHaveBeenCalledWith(
      "pingTargetHost",
      DEFAULT_PING_TARGET_HOST,
    );
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("trims and persists ping target host changes", async () => {
    const store = createStore(DEFAULT_PING_TARGET_HOST);
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePingTargetSetting());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.setPingTargetHost("  google.com  ");
    });

    expect(result.current.pingTargetHost).toBe("google.com");
    expect(store.set).toHaveBeenLastCalledWith("pingTargetHost", "google.com");
    expect(store.save).toHaveBeenCalledTimes(1);
  });
});

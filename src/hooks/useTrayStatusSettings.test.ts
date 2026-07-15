import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTrayStatusSettings } from "./useTrayStatusSettings";

interface MockStore {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  load: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mocks.invoke,
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: mocks.load,
}));

let reducedMotion = false;
let motionChangeHandler: (() => void) | undefined;

function createStore(values: Record<string, unknown>): MockStore {
  return {
    get: vi.fn((key: string) => Promise.resolve(values[key])),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => {
  reducedMotion = false;
  motionChangeHandler = undefined;
  mocks.invoke.mockResolvedValue(undefined);
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      get matches() {
        return reducedMotion;
      },
      addEventListener: vi.fn(
        (_event: string, handler: () => void) =>
          (motionChangeHandler = handler),
      ),
      removeEventListener: vi.fn(),
    })),
  });
});

afterEach(() => {
  mocks.invoke.mockReset();
  mocks.load.mockReset();
});

describe("useTrayStatusSettings", () => {
  it("enables CPU status by default and requests the first-run guide", async () => {
    const store = createStore({});
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useTrayStatusSettings());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.metric).toBe("cpu");
    expect(result.current.intervalSeconds).toBe(1);
    expect(result.current.shouldShowIntro).toBe(true);
    expect(store.set).toHaveBeenCalledWith("trayStatusHelpShown", true);
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenCalledWith("configure_tray_status", {
        settings: {
          enabled: true,
          intervalSeconds: 1,
          metric: "cpu",
          reducedMotion: false,
        },
      }),
    );
  });

  it("loads saved settings without reopening the first-run guide", async () => {
    const store = createStore({
      trayStatusEnabled: false,
      trayStatusHelpShown: true,
      trayStatusIntervalSeconds: 5,
      trayStatusMetric: "network",
    });
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useTrayStatusSettings());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.isEnabled).toBe(false);
    expect(result.current.metric).toBe("network");
    expect(result.current.intervalSeconds).toBe(5);
    expect(result.current.shouldShowIntro).toBe(false);
    expect(store.set).not.toHaveBeenCalled();
  });

  it("persists setting changes and clamps the interval", async () => {
    const store = createStore({
      trayStatusEnabled: true,
      trayStatusHelpShown: true,
      trayStatusIntervalSeconds: 1,
      trayStatusMetric: "cpu",
    });
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useTrayStatusSettings());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.setIsEnabled(false);
      await result.current.setMetric("memory");
      await result.current.setIntervalSeconds(100);
    });

    expect(result.current.isEnabled).toBe(false);
    expect(result.current.metric).toBe("memory");
    expect(result.current.intervalSeconds).toBe(60);
    expect(store.set).toHaveBeenCalledWith("trayStatusEnabled", false);
    expect(store.set).toHaveBeenCalledWith("trayStatusMetric", "memory");
    expect(store.set).toHaveBeenCalledWith("trayStatusIntervalSeconds", 60);
  });

  it("syncs reduced-motion changes with the backend", async () => {
    const store = createStore({
      trayStatusEnabled: true,
      trayStatusHelpShown: true,
      trayStatusIntervalSeconds: 2,
      trayStatusMetric: "memory",
    });
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useTrayStatusSettings());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    reducedMotion = true;

    act(() => motionChangeHandler?.());

    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenLastCalledWith("configure_tray_status", {
        settings: {
          enabled: true,
          intervalSeconds: 2,
          metric: "memory",
          reducedMotion: true,
        },
      }),
    );
  });
});

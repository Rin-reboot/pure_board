import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "./useTheme";

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

function createStore(savedTheme: "dark" | "light" | undefined): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedTheme),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({ matches: true }),
  });
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  storeMocks.load.mockReset();
});

describe("useTheme", () => {
  it("loads a saved theme", async () => {
    const store = createStore("dark");
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useTheme());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(store.set).not.toHaveBeenCalled();
  });

  it("uses and persists the system theme when no saved theme exists", async () => {
    const store = createStore(undefined);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useTheme());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.theme).toBe("light");
    expect(store.set).toHaveBeenCalledWith("theme", "light");
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("toggles and persists the theme", async () => {
    const store = createStore("dark");
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(store.set).toHaveBeenLastCalledWith("theme", "light");
    expect(store.save).toHaveBeenCalledTimes(1);
  });

  it("marks loading complete when store loading fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    storeMocks.load.mockRejectedValue(new Error("failed"));

    const { result } = renderHook(() => useTheme());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});

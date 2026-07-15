import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFirstRunTutorial } from "./useFirstRunTutorial";

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

function createStore(values: Record<string, unknown>): MockStore {
  return {
    get: vi.fn((key: string) => Promise.resolve(values[key])),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  mocks.load.mockReset();
});

describe("useFirstRunTutorial", () => {
  it("opens for a new user without marking the tutorial complete", async () => {
    const store = createStore({});
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useFirstRunTutorial());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.isOpen).toBe(true);
    expect(store.set).not.toHaveBeenCalled();
  });

  it("does not reopen after completion", async () => {
    const store = createStore({ firstRunTutorialCompleted: true });
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useFirstRunTutorial());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.isOpen).toBe(false);
  });

  it("persists completion when the tutorial is finished or skipped", async () => {
    const store = createStore({});
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useFirstRunTutorial());
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    await act(async () => {
      await result.current.dismiss();
    });

    expect(result.current.isOpen).toBe(false);
    expect(store.set).toHaveBeenCalledWith("firstRunTutorialCompleted", true);
    expect(store.save).toHaveBeenCalled();
  });

  it("migrates users who already saw the previous first-run help", async () => {
    const store = createStore({ trayStatusHelpShown: true });
    mocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => useFirstRunTutorial());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.isOpen).toBe(false);
    expect(store.set).toHaveBeenCalledWith("firstRunTutorialCompleted", true);
    expect(store.save).toHaveBeenCalled();
  });
});

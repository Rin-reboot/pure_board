import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePersistedMemos } from "./usePersistedMemos";

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

function createStore(savedMemos: unknown): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedMemos),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  storeMocks.load.mockReset();
});

describe("usePersistedMemos", () => {
  it("loads saved memos", async () => {
    const memos = [
      { id: "memo-1", text: "Review tests", done: false, tag: "今日中" },
    ];
    const store = createStore(memos);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedMemos());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.memos).toEqual(memos);
  });

  it("persists the default empty memo list when nothing is saved", async () => {
    const store = createStore(undefined);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedMemos());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.memos).toEqual([]);
    expect(store.set).toHaveBeenCalledWith("memos", []);
    expect(store.save).toHaveBeenCalled();
  });

  it("drops invalid saved memo entries and persists the normalized list", async () => {
    const validMemo = {
      id: "memo-1",
      text: "Review tests",
      done: false,
      tag: "莉頑律荳ｭ",
    };
    const store = createStore([
      validMemo,
      { id: "memo-2", text: "missing done", tag: "譏取律" },
      "invalid",
    ]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedMemos());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.memos).toEqual([validMemo]);
    expect(store.set).toHaveBeenCalledWith("memos", [validMemo]);
    expect(store.save).toHaveBeenCalled();
  });

  it("persists changed memos after loading", async () => {
    const store = createStore([]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedMemos());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    const nextMemo = {
      id: "memo-1",
      text: "Review tests",
      done: false,
      tag: "今日中",
    };
    await act(async () => {
      result.current.setMemos([nextMemo]);
    });

    await waitFor(() =>
      expect(store.set).toHaveBeenLastCalledWith("memos", [nextMemo]),
    );
  });

  it("deletes a memo by id", async () => {
    const memos = [
      { id: "memo-1", text: "Review tests", done: false, tag: "今日中" },
      { id: "memo-2", text: "Ship tests", done: false, tag: "明日" },
    ];
    const store = createStore(memos);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedMemos());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => {
      result.current.deleteMemo("memo-1");
    });

    expect(result.current.memos).toEqual([memos[1]]);
  });

  it("falls back to an empty list when loading fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    storeMocks.load.mockRejectedValue(new Error("failed"));

    const { result } = renderHook(() => usePersistedMemos());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.memos).toEqual([]);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});

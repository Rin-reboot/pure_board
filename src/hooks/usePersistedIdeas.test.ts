import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePersistedIdeas } from "./usePersistedIdeas";

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

function createStore(savedIdeas: unknown): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedIdeas),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

const savedIdea = {
  id: "idea-1",
  title: "新しいサービス",
  body: "# 概要\n\nアイデアの本文",
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T00:00:00.000Z",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-11T01:00:00.000Z"));
});

afterEach(() => {
  storeMocks.load.mockReset();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("usePersistedIdeas", () => {
  it("loads saved ideas", async () => {
    const store = createStore([savedIdea]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedIdeas());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.ideas).toEqual([savedIdea]);
  });

  it("drops invalid and duplicate saved ideas", async () => {
    const store = createStore([
      savedIdea,
      { ...savedIdea, title: "duplicate" },
      { ...savedIdea, id: "idea-2", updatedAt: "invalid" },
      "invalid",
    ]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedIdeas());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.ideas).toEqual([savedIdea]);
    expect(store.set).toHaveBeenCalledWith("ideas", [savedIdea]);
    expect(store.save).toHaveBeenCalled();
  });

  it("creates an idea at the beginning of the list", async () => {
    const store = createStore([savedIdea]);
    storeMocks.load.mockResolvedValue(store);
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000000",
    );

    const { result } = renderHook(() => usePersistedIdeas());
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      result.current.createIdea({
        title: "改善案",
        body: "- もっと速くする",
      });
    });

    expect(result.current.ideas[0]).toEqual({
      id: "00000000-0000-4000-8000-000000000000",
      title: "改善案",
      body: "- もっと速くする",
      createdAt: "2026-07-11T01:00:00.000Z",
      updatedAt: "2026-07-11T01:00:00.000Z",
    });
  });

  it("updates an idea while preserving its creation timestamp", async () => {
    const store = createStore([savedIdea]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedIdeas());
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      result.current.updateIdea("idea-1", {
        title: "更新したアイデア",
        body: "本文を更新",
      });
    });

    expect(result.current.ideas[0]).toEqual({
      ...savedIdea,
      title: "更新したアイデア",
      body: "本文を更新",
      updatedAt: "2026-07-11T01:00:00.000Z",
    });
  });

  it("deletes an idea", async () => {
    const store = createStore([savedIdea]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedIdeas());
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      result.current.deleteIdea("idea-1");
    });

    expect(result.current.ideas).toEqual([]);
  });

  it("reloads ideas from the store", async () => {
    const store = createStore([]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedIdeas());
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    store.get.mockResolvedValueOnce([savedIdea]);
    await act(async () => {
      await result.current.reloadIdeas();
    });

    expect(result.current.ideas).toEqual([savedIdea]);
  });

  it("falls back to an empty list when loading fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    storeMocks.load.mockRejectedValue(new Error("failed"));

    const { result } = renderHook(() => usePersistedIdeas());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.ideas).toEqual([]);
    expect(result.current.errorMessage).toBe("failed");
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to load ideas:",
      expect.any(Error),
    );
  });
});

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePersistedTodos } from "./usePersistedTodos";

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

function createStore(savedTodos: unknown): MockStore {
  return {
    get: vi.fn().mockResolvedValue(savedTodos),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  storeMocks.load.mockReset();
});

describe("usePersistedTodos", () => {
  it("loads saved todos", async () => {
    const todos = [
      { id: "todo-1", text: "Review tests", done: false, tag: "今日中" },
    ];
    const store = createStore(todos);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedTodos());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.todos).toEqual(todos);
  });

  it("persists the default empty todo list when nothing is saved", async () => {
    const store = createStore(undefined);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedTodos());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.todos).toEqual([]);
    expect(store.set).toHaveBeenCalledWith("todos", []);
    expect(store.save).toHaveBeenCalled();
  });

  it("migrates todos from the legacy memo store", async () => {
    const currentStore = createStore(undefined);
    const legacyTodos = [
      { id: "memo-1", text: "Review tests", done: false, tag: "今日中" },
    ];
    const legacyStore = createStore(legacyTodos);
    storeMocks.load
      .mockResolvedValueOnce(currentStore)
      .mockResolvedValueOnce(legacyStore);

    const { result } = renderHook(() => usePersistedTodos());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.todos).toEqual(legacyTodos);
    expect(currentStore.set).toHaveBeenCalledWith("todos", legacyTodos);
    expect(currentStore.save).toHaveBeenCalled();
  });

  it("drops invalid saved todo entries and persists the normalized list", async () => {
    const validTodo = {
      id: "todo-1",
      text: "Review tests",
      done: false,
      tag: "今日中",
    };
    const store = createStore([
      validTodo,
      { id: "todo-2", text: "missing done", tag: "明日" },
      "invalid",
    ]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedTodos());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.todos).toEqual([validTodo]);
    expect(store.set).toHaveBeenCalledWith("todos", [validTodo]);
    expect(store.save).toHaveBeenCalled();
  });

  it("persists changed todos after loading", async () => {
    const store = createStore([]);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedTodos());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    const nextTodo = {
      id: "todo-1",
      text: "Review tests",
      done: false,
      tag: "今日中",
    };
    await act(async () => {
      result.current.setTodos([nextTodo]);
    });

    await waitFor(() =>
      expect(store.set).toHaveBeenLastCalledWith("todos", [nextTodo]),
    );
  });

  it("deletes a todo by id", async () => {
    const todos = [
      { id: "todo-1", text: "Review tests", done: false, tag: "今日中" },
      { id: "todo-2", text: "Ship tests", done: false, tag: "明日" },
    ];
    const store = createStore(todos);
    storeMocks.load.mockResolvedValue(store);

    const { result } = renderHook(() => usePersistedTodos());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    act(() => {
      result.current.deleteTodo("todo-1");
    });

    expect(result.current.todos).toEqual([todos[1]]);
  });

  it("falls back to an empty list when loading fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    storeMocks.load.mockRejectedValue(new Error("failed"));

    const { result } = renderHook(() => usePersistedTodos());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.todos).toEqual([]);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});

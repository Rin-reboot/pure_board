import { cleanup, fireEvent, render, within } from "@testing-library/react";
import type { Dispatch, SetStateAction } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TodoItem } from "../hooks/usePersistedTodos";
import { TodoPanel } from "./TodoPanel";

type SetTodos = Dispatch<SetStateAction<TodoItem[]>>;

const todoHookMock = vi.hoisted(() => ({
  usePersistedTodos: vi.fn(),
}));

vi.mock("../hooks/usePersistedTodos", () => ({
  usePersistedTodos: todoHookMock.usePersistedTodos,
}));

afterEach(() => {
  todoHookMock.usePersistedTodos.mockReset();
  vi.restoreAllMocks();
  cleanup();
});

function mockTodos({
  todos = [],
  setTodos = vi.fn<SetTodos>(),
  deleteTodo = vi.fn<(id: string) => void>(),
  isLoaded = true,
}: {
  todos?: TodoItem[];
  setTodos?: SetTodos;
  deleteTodo?: (id: string) => void;
  isLoaded?: boolean;
}) {
  todoHookMock.usePersistedTodos.mockReturnValue({
    todos,
    setTodos,
    deleteTodo,
    isLoaded,
  });
  return { setTodos, deleteTodo };
}

describe("TodoPanel", () => {
  it("renders the loading state", () => {
    mockTodos({ isLoaded: false });

    const { getByText } = render(<TodoPanel />);

    expect(getByText("読み込み中...")).toBeTruthy();
  });

  it("renders existing todos", () => {
    mockTodos({
      todos: [
        { id: "todo-1", text: "Review tests", done: false, tag: "今日中" },
      ],
    });

    const { getByRole, getByText } = render(<TodoPanel />);

    expect(getByText("Review tests")).toBeTruthy();
    expect(within(getByRole("listitem")).getByText("今日中")).toBeTruthy();
  });

  it("switches to the list view", () => {
    mockTodos({
      todos: [
        { id: "todo-1", text: "Review tests", done: false, tag: "today" },
        { id: "todo-2", text: "Ship release", done: true, tag: "tomorrow" },
      ],
    });

    const { getByLabelText, getByText } = render(<TodoPanel />);

    fireEvent.click(getByLabelText("リストビューを切り替え"));

    expect(getByText("2 / 2")).toBeTruthy();
  });

  it("toggles a todo through the setter updater", () => {
    const setTodos = vi.fn();
    mockTodos({
      todos: [
        { id: "todo-1", text: "Review tests", done: false, tag: "今日中" },
      ],
      setTodos,
    });

    const { getByRole } = render(<TodoPanel />);

    fireEvent.click(getByRole("checkbox"));

    const updater = setTodos.mock.calls[0]?.[0] as
      | ((todos: TodoItem[]) => TodoItem[])
      | undefined;
    expect(
      updater?.([
        { id: "todo-1", text: "Review tests", done: false, tag: "今日中" },
      ]),
    ).toEqual([
      { id: "todo-1", text: "Review tests", done: true, tag: "今日中" },
    ]);
  });

  it("deletes a todo", () => {
    const deleteTodo = vi.fn();
    mockTodos({
      todos: [
        { id: "todo-1", text: "Review tests", done: false, tag: "今日中" },
      ],
      deleteTodo,
    });

    const { getByLabelText } = render(<TodoPanel />);

    fireEvent.click(getByLabelText("削除"));

    expect(deleteTodo).toHaveBeenCalledWith("todo-1");
  });

  it("adds a todo and clears the draft", () => {
    const randomUUID = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValue("00000000-0000-4000-8000-000000000000");
    const setTodos = vi.fn();
    mockTodos({ setTodos });

    const { getByLabelText, getByPlaceholderText } = render(<TodoPanel />);
    const input = getByPlaceholderText("TODOを入力...") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "  New todo  " } });
    fireEvent.click(getByLabelText("送信"));

    const updater = setTodos.mock.calls[0]?.[0] as
      | ((todos: TodoItem[]) => TodoItem[])
      | undefined;
    expect(updater?.([])).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000000",
        text: "New todo",
        done: false,
        tag: "今日中",
      },
    ]);
    expect(input.value).toBe("");

    randomUUID.mockRestore();
  });

  it("does not add blank todos", () => {
    const setTodos = vi.fn();
    mockTodos({ setTodos });

    const { getByLabelText, getByPlaceholderText } = render(<TodoPanel />);

    fireEvent.change(getByPlaceholderText("TODOを入力..."), {
      target: { value: "   " },
    });
    fireEvent.click(getByLabelText("送信"));

    expect(setTodos).not.toHaveBeenCalled();
  });
});

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TodoListView } from "./TodoListView";

const todos = [
  { id: "todo-1", text: "Review tests", done: false, tag: "today" },
  { id: "todo-2", text: "Ship release", done: true, tag: "tomorrow" },
  { id: "todo-3", text: "Plan docs", done: false, tag: "tomorrow" },
];

describe("TodoListView", () => {
  it("filters todos by completion state", () => {
    const { container, getByText, queryByText } = render(
      <TodoListView
        todos={todos}
        isExpanded={true}
        onToggleTodo={vi.fn()}
        onDeleteTodo={vi.fn()}
      />,
    );

    const [, activeButton] = Array.from(container.querySelectorAll("button"));
    fireEvent.click(activeButton);

    expect(getByText("2 / 3")).toBeTruthy();
    expect(getByText("Review tests")).toBeTruthy();
    expect(getByText("Plan docs")).toBeTruthy();
    expect(queryByText("Ship release")).toBeNull();
  });

  it("filters todos by tag", () => {
    const { getByRole, getByText, queryByText } = render(
      <TodoListView
        todos={todos}
        isExpanded={true}
        onToggleTodo={vi.fn()}
        onDeleteTodo={vi.fn()}
      />,
    );

    fireEvent.change(getByRole("combobox"), {
      target: { value: "today" },
    });

    expect(getByText("1 / 3")).toBeTruthy();
    expect(getByText("Review tests")).toBeTruthy();
    expect(queryByText("Ship release")).toBeNull();
    expect(queryByText("Plan docs")).toBeNull();
  });

  it("keeps todo actions available after filtering", () => {
    const onToggleTodo = vi.fn();
    const onDeleteTodo = vi.fn();
    const { getByRole, getByText } = render(
      <TodoListView
        todos={todos}
        isExpanded={true}
        onToggleTodo={onToggleTodo}
        onDeleteTodo={onDeleteTodo}
      />,
    );

    fireEvent.change(getByRole("combobox"), {
      target: { value: "today" },
    });
    fireEvent.click(getByRole("checkbox"));
    fireEvent.click(
      getByText("Review tests").parentElement?.querySelector(
        ".todo-delete",
      ) as HTMLButtonElement,
    );

    expect(onToggleTodo).toHaveBeenCalledWith("todo-1");
    expect(onDeleteTodo).toHaveBeenCalledWith("todo-1");
  });
});

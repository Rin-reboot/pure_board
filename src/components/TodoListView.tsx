import { X } from "lucide-react";
import { useMemo, useState } from "react";
import type { TodoItem } from "../hooks/usePersistedTodos";

type TodoFilterStatus = "all" | "active" | "done";

interface TodoListViewProps {
  todos: TodoItem[];
  isExpanded: boolean;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const STATUS_FILTERS: { label: string; value: TodoFilterStatus }[] = [
  { label: "すべて", value: "all" },
  { label: "未完了", value: "active" },
  { label: "完了", value: "done" },
];

function getStatusFilteredTodos(todos: TodoItem[], status: TodoFilterStatus) {
  switch (status) {
    case "active":
      return todos.filter((todo) => !todo.done);
    case "done":
      return todos.filter((todo) => todo.done);
    case "all":
      return todos;
  }
}

export function TodoListView({
  todos,
  isExpanded,
  onToggleTodo,
  onDeleteTodo,
}: TodoListViewProps) {
  const [statusFilter, setStatusFilter] = useState<TodoFilterStatus>("all");
  const [tagFilter, setTagFilter] = useState("all");

  const tags = useMemo(
    () => Array.from(new Set(todos.map((todo) => todo.tag))).sort(),
    [todos],
  );

  const visibleTodos = useMemo(() => {
    const statusFiltered = getStatusFilteredTodos(todos, statusFilter);
    if (tagFilter === "all") return statusFiltered;
    return statusFiltered.filter((todo) => todo.tag === tagFilter);
  }, [todos, statusFilter, tagFilter]);

  return (
    <div className={isExpanded ? "todo-list-expanded" : ""}>
      {isExpanded ? (
        <div className="todo-list-toolbar">
          <span className="todo-count">
            {visibleTodos.length} / {todos.length}
          </span>
          <fieldset
            className="todo-filter-group"
            aria-label="完了状態で絞り込み"
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  statusFilter === filter.value ? "todo-filter-active" : ""
                }
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </fieldset>
          <select
            className="todo-filter-select"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            aria-label="タグで絞り込み"
          >
            <option value="all">全タグ</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {visibleTodos.length === 0 ? (
        <p className="todo-list-empty">
          {todos.length === 0 ? "TODOはありません" : "該当するTODOはありません"}
        </p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <label className="todo-checkbox">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => onToggleTodo(todo.id)}
                />
                <span className="todo-checkbox-box" />
              </label>
              <span
                className={`todo-text ${todo.done ? "todo-text-done" : ""}`}
              >
                {todo.text}
              </span>
              <span className={`todo-tag ${todo.done ? "todo-tag-done" : ""}`}>
                {todo.tag}
              </span>
              <button
                type="button"
                className="todo-delete"
                onClick={() => onDeleteTodo(todo.id)}
                aria-label="削除"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

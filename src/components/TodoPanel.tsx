import { ListFilter, ListTodo, Plus, Send } from "lucide-react";
import { useState } from "react";
import { usePersistedTodos } from "../hooks/usePersistedTodos";
import { TodoListView } from "./TodoListView";

const TAG_PRESETS = ["今日中", "明日", "今週中", "未定"];

export function TodoPanel() {
  const { todos, setTodos, deleteTodo, isLoaded } = usePersistedTodos();
  const [draft, setDraft] = useState("");
  const [selectedTag, setSelectedTag] = useState(TAG_PRESETS[0]);
  const [isListView, setIsListView] = useState(false);

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  };

  const addTodo = () => {
    const text = draft.trim();
    if (!text) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, done: false, tag: selectedTag },
    ]);
    setDraft("");
  };

  return (
    <section className="card todo-card">
      <div className="todo-header">
        <span className="todo-title">
          <ListTodo size={16} style={{ color: "var(--accent-todo)" }} />
          TODO
        </span>
        <div className="todo-header-actions">
          <button type="button" onClick={addTodo} aria-label="TODOを追加">
            <Plus size={14} />
          </button>
          <button
            type="button"
            className={isListView ? "todo-view-toggle-active" : ""}
            onClick={() => setIsListView((current) => !current)}
            aria-pressed={isListView}
            aria-label="リストビューを切り替え"
          >
            <ListFilter size={14} />
          </button>
        </div>
      </div>

      {!isLoaded ? (
        <p className="todo-loading">読み込み中...</p>
      ) : (
        <TodoListView
          todos={todos}
          isExpanded={isListView}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
        />
      )}

      <div className="todo-input-row">
        <select
          className="todo-tag-select"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          aria-label="タグを選択"
        >
          {TAG_PRESETS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="TODOを入力..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
        />
        <button type="button" onClick={addTodo} aria-label="送信">
          <Send size={14} />
        </button>
      </div>
    </section>
  );
}

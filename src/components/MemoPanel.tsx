import { ListFilter, Plus, Send, StickyNote } from "lucide-react";
import { useState } from "react";
import { usePersistedMemos } from "../hooks/usePersistedMemos";
import { MemoListView } from "./MemoListView";

const TAG_PRESETS = ["今日中", "明日", "今週中", "未定"];

export function MemoPanel() {
  const { memos, setMemos, deleteMemo, isLoaded } = usePersistedMemos();
  const [draft, setDraft] = useState("");
  const [selectedTag, setSelectedTag] = useState(TAG_PRESETS[0]);
  const [isListView, setIsListView] = useState(false);

  const toggleMemo = (id: string) => {
    setMemos((prev) =>
      prev.map((memo) =>
        memo.id === id ? { ...memo, done: !memo.done } : memo,
      ),
    );
  };

  const addMemo = () => {
    const text = draft.trim();
    if (!text) return;
    setMemos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, done: false, tag: selectedTag },
    ]);
    setDraft("");
  };

  return (
    <section className="card memo-card">
      <div className="memo-header">
        <span className="memo-title">
          <StickyNote size={16} style={{ color: "var(--accent-memo)" }} />
          Memo
        </span>
        <div className="memo-header-actions">
          <button type="button" onClick={addMemo} aria-label="メモを追加">
            <Plus size={14} />
          </button>
          <button
            type="button"
            className={isListView ? "memo-view-toggle-active" : ""}
            onClick={() => setIsListView((current) => !current)}
            aria-pressed={isListView}
            aria-label="リストビューを切り替え"
          >
            <ListFilter size={14} />
          </button>
        </div>
      </div>

      {!isLoaded ? (
        <p className="memo-loading">読み込み中...</p>
      ) : (
        <MemoListView
          memos={memos}
          isExpanded={isListView}
          onToggleMemo={toggleMemo}
          onDeleteMemo={deleteMemo}
        />
      )}

      <div className="memo-input-row">
        <select
          className="memo-tag-select"
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
          placeholder="メモを入力..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMemo()}
        />
        <button type="button" onClick={addMemo} aria-label="送信">
          <Send size={14} />
        </button>
      </div>
    </section>
  );
}

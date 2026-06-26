import { MoreHorizontal, Plus, Send, StickyNote, X } from "lucide-react";
import { useState } from "react";
import { usePersistedMemos } from "../hooks/usePersistedMemos";

const TAG_PRESETS = ["今日中", "明日", "今週中", "未定"];

export function MemoPanel() {
  const { memos, setMemos, deleteMemo, isLoaded } = usePersistedMemos();
  const [draft, setDraft] = useState("");
  const [selectedTag, setSelectedTag] = useState(TAG_PRESETS[0]);

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
          <button type="button" aria-label="メニュー">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {!isLoaded ? (
        <p className="memo-loading">読み込み中...</p>
      ) : (
        <ul className="memo-list">
          {memos.map((memo) => (
            <li key={memo.id} className="memo-item">
              <label className="memo-checkbox">
                <input
                  type="checkbox"
                  checked={memo.done}
                  onChange={() => toggleMemo(memo.id)}
                />
                <span className="memo-checkbox-box" />
              </label>
              <span
                className={`memo-text ${memo.done ? "memo-text-done" : ""}`}
              >
                {memo.text}
              </span>
              <span className={`memo-tag ${memo.done ? "memo-tag-done" : ""}`}>
                {memo.tag}
              </span>
              <button
                type="button"
                className="memo-delete"
                onClick={() => deleteMemo(memo.id)}
                aria-label="削除"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
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

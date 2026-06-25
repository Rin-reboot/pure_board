import { MoreHorizontal, Plus, Send, StickyNote } from "lucide-react";
import { useState } from "react";

interface MemoItem {
  id: string;
  text: string;
  done: boolean;
  tag: string;
}

const initialMemos: MemoItem[] = [
  { id: "1", text: "16:00 ミーティング", done: false, tag: "16:00" },
  { id: "2", text: "サーバー監視確認", done: true, tag: "完了" },
  { id: "3", text: "請求書送付", done: false, tag: "今日中" },
];

export function MemoPanel() {
  const [memos, setMemos] = useState<MemoItem[]>(initialMemos);
  const [draft, setDraft] = useState("");

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
      { id: crypto.randomUUID(), text, done: false, tag: "未定" },
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
            <span className={`memo-text ${memo.done ? "memo-text-done" : ""}`}>
              {memo.text}
            </span>
            <span className={`memo-tag ${memo.done ? "memo-tag-done" : ""}`}>
              {memo.tag}
            </span>
          </li>
        ))}
      </ul>

      <div className="memo-input-row">
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

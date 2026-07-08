import { X } from "lucide-react";
import { useMemo, useState } from "react";
import type { MemoItem } from "../hooks/usePersistedMemos";

type MemoFilterStatus = "all" | "active" | "done";

interface MemoListViewProps {
  memos: MemoItem[];
  isExpanded: boolean;
  onToggleMemo: (id: string) => void;
  onDeleteMemo: (id: string) => void;
}

const STATUS_FILTERS: { label: string; value: MemoFilterStatus }[] = [
  { label: "すべて", value: "all" },
  { label: "未完了", value: "active" },
  { label: "完了", value: "done" },
];

function getStatusFilteredMemos(memos: MemoItem[], status: MemoFilterStatus) {
  switch (status) {
    case "active":
      return memos.filter((memo) => !memo.done);
    case "done":
      return memos.filter((memo) => memo.done);
    case "all":
      return memos;
  }
}

export function MemoListView({
  memos,
  isExpanded,
  onToggleMemo,
  onDeleteMemo,
}: MemoListViewProps) {
  const [statusFilter, setStatusFilter] = useState<MemoFilterStatus>("all");
  const [tagFilter, setTagFilter] = useState("all");

  const tags = useMemo(
    () => Array.from(new Set(memos.map((memo) => memo.tag))).sort(),
    [memos],
  );

  const visibleMemos = useMemo(() => {
    const statusFiltered = getStatusFilteredMemos(memos, statusFilter);
    if (tagFilter === "all") return statusFiltered;
    return statusFiltered.filter((memo) => memo.tag === tagFilter);
  }, [memos, statusFilter, tagFilter]);

  return (
    <div className={isExpanded ? "memo-list-expanded" : ""}>
      {isExpanded ? (
        <div className="memo-list-toolbar">
          <span className="memo-count">
            {visibleMemos.length} / {memos.length}
          </span>
          <fieldset
            className="memo-filter-group"
            aria-label="完了状態で絞り込み"
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  statusFilter === filter.value ? "memo-filter-active" : ""
                }
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </fieldset>
          <select
            className="memo-filter-select"
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

      {visibleMemos.length === 0 ? (
        <p className="memo-list-empty">
          {memos.length === 0 ? "メモはありません" : "該当するメモはありません"}
        </p>
      ) : (
        <ul className="memo-list">
          {visibleMemos.map((memo) => (
            <li key={memo.id} className="memo-item">
              <label className="memo-checkbox">
                <input
                  type="checkbox"
                  checked={memo.done}
                  onChange={() => onToggleMemo(memo.id)}
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
                onClick={() => onDeleteMemo(memo.id)}
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

import { listen } from "@tauri-apps/api/event";
import { ArrowUpRight, Lightbulb, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { type IdeaItem, usePersistedIdeas } from "../hooks/usePersistedIdeas";
import { IDEA_CHANGED_EVENT } from "../ideas/events";

interface IdeaPanelProps {
  onCreateIdea: () => void;
  onOpenIdea: (id: string) => void;
}

const updatedAtFormatter = new Intl.DateTimeFormat("ja-JP", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function getIdeaTitle(idea: IdeaItem): string {
  const title = idea.title.trim();
  if (title) return title;

  const firstLine = idea.body
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine?.replace(/^#{1,6}\s+/, "") || "無題のアイデア";
}

function getIdeaExcerpt(body: string): string {
  return body.replace(/\s+/g, " ").trim() || "まだ内容がありません";
}

export function IdeaPanel({ onCreateIdea, onOpenIdea }: IdeaPanelProps) {
  const { ideas, isLoaded, errorMessage, reloadIdeas } = usePersistedIdeas();
  const sortedIdeas = useMemo(
    () =>
      [...ideas].sort(
        (left, right) =>
          Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
      ),
    [ideas],
  );

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void listen(IDEA_CHANGED_EVENT, () => {
      void reloadIdeas();
    }).then((stopListening) => {
      unlisten = stopListening;
    });

    return () => unlisten?.();
  }, [reloadIdeas]);

  return (
    <section className="card idea-card" aria-label="アイデア">
      <div className="idea-header">
        <span className="idea-title">
          <Lightbulb size={16} aria-hidden="true" />
          Ideas
        </span>
        <button
          type="button"
          className="idea-create"
          onClick={onCreateIdea}
          aria-label="新しいアイデアを書き留める"
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>

      {!isLoaded ? (
        <p className="idea-empty">読み込み中...</p>
      ) : errorMessage ? (
        <p className="idea-error">アイデアを読み込めませんでした</p>
      ) : sortedIdeas.length === 0 ? (
        <p className="idea-empty">思いついたことを書き留めてみましょう</p>
      ) : (
        <ul className="idea-list">
          {sortedIdeas.map((idea) => {
            const title = getIdeaTitle(idea);

            return (
              <li key={idea.id}>
                <button
                  type="button"
                  className="idea-item"
                  onClick={() => onOpenIdea(idea.id)}
                  aria-label={`アイデア「${title}」を開く`}
                >
                  <span className="idea-item-copy">
                    <span className="idea-item-title">{title}</span>
                    <span className="idea-item-excerpt">
                      {getIdeaExcerpt(idea.body)}
                    </span>
                  </span>
                  <span className="idea-item-meta">
                    <time dateTime={idea.updatedAt}>
                      {updatedAtFormatter.format(new Date(idea.updatedAt))}
                    </time>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

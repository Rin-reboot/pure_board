import { emitTo, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Lightbulb, Save, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { usePersistedIdeas } from "../hooks/usePersistedIdeas";
import { useTheme } from "../hooks/useTheme";
import {
  IDEA_CHANGED_EVENT,
  IDEA_OPEN_EVENT,
  type IdeaChangedPayload,
  type IdeaOpenPayload,
} from "../ideas/events";

function getInitialIdeaId(): string | null {
  return new URLSearchParams(window.location.search).get("ideaId");
}

export function IdeaEditorApp() {
  useTheme();
  const { ideas, isLoaded, errorMessage, saveIdea, removeIdea } =
    usePersistedIdeas();
  const [ideaId, setIdeaId] = useState<string | null>(getInitialIdeaId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [savedTitle, setSavedTitle] = useState("");
  const [savedBody, setSavedBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const selectedIdea = useMemo(
    () => ideas.find((idea) => idea.id === ideaId),
    [ideaId, ideas],
  );
  const isDirty = title !== savedTitle || body !== savedBody;

  useEffect(() => {
    if (!isLoaded) return;

    if (!ideaId) {
      setTitle("");
      setBody("");
      setSavedTitle("");
      setSavedBody("");
      setSaveError(null);
      return;
    }

    if (selectedIdea) {
      setTitle(selectedIdea.title);
      setBody(selectedIdea.body);
      setSavedTitle(selectedIdea.title);
      setSavedBody(selectedIdea.body);
      setSaveError(null);
    }
  }, [ideaId, isLoaded, selectedIdea]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void listen<IdeaOpenPayload>(IDEA_OPEN_EVENT, (event) => {
      if (
        isDirty &&
        !window.confirm("未保存の変更があります。別のアイデアを開きますか？")
      ) {
        return;
      }

      setIdeaId(event.payload.ideaId);
    }).then((stopListening) => {
      unlisten = stopListening;
    });

    return () => unlisten?.();
  }, [isDirty]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const savedIdea = await saveIdea({ title, body }, ideaId ?? undefined);
      setIdeaId(savedIdea.id);
      setSavedTitle(savedIdea.title);
      setSavedBody(savedIdea.body);
      await emitTo<IdeaChangedPayload>("main", IDEA_CHANGED_EVENT, {
        ideaId: savedIdea.id,
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!ideaId || isSaving || isDeleting) return;
    if (
      !window.confirm("このアイデアを削除しますか？この操作は取り消せません。")
    ) {
      return;
    }

    setIsDeleting(true);
    setSaveError(null);

    try {
      await removeIdea(ideaId);
      await emitTo<IdeaChangedPayload>("main", IDEA_CHANGED_EVENT, { ideaId });
      await getCurrentWindow().close();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
      setIsDeleting(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="idea-editor-shell idea-editor-state">読み込み中...</main>
    );
  }

  if (ideaId && !selectedIdea) {
    return (
      <main className="idea-editor-shell idea-editor-state">
        アイデアが見つかりません
      </main>
    );
  }

  return (
    <main className="idea-editor-shell">
      <header className="idea-editor-header">
        <span className="idea-editor-heading">
          <Lightbulb size={18} aria-hidden="true" />
          Idea Editor
        </span>
        <span
          className={[
            "idea-editor-save-status",
            saveError || errorMessage ? "idea-editor-save-error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isDeleting
            ? "削除中..."
            : isSaving
              ? "保存中..."
              : saveError || errorMessage
                ? "保存できませんでした"
                : isDirty
                  ? "未保存"
                  : "保存済み"}
        </span>
      </header>

      <form
        className="idea-editor-form"
        onSubmit={(event) => void handleSave(event)}
      >
        <input
          className="idea-editor-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isDeleting}
          placeholder="アイデアのタイトル"
          aria-label="アイデアのタイトル"
        />
        <textarea
          className="idea-editor-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={isDeleting}
          placeholder="思いついたことを書いてみましょう..."
          aria-label="アイデアの本文"
          spellCheck={false}
        />
        <footer className="idea-editor-footer">
          <span>Markdownで記述できます</span>
          <div className="idea-editor-actions">
            {ideaId ? (
              <button
                type="button"
                className="idea-editor-delete"
                disabled={isSaving || isDeleting}
                onClick={() => void handleDelete()}
              >
                <Trash2 size={14} aria-hidden="true" />
                削除
              </button>
            ) : null}
            <button type="submit" disabled={!isDirty || isSaving || isDeleting}>
              <Save size={14} aria-hidden="true" />
              保存
            </button>
          </div>
        </footer>
      </form>
    </main>
  );
}

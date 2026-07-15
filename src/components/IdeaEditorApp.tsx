import { emitTo, listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Download, Lightbulb, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_IDEA_BODY_LENGTH,
  MAX_IDEA_TITLE_LENGTH,
  usePersistedIdeas,
} from "../hooks/usePersistedIdeas";
import { useTheme } from "../hooks/useTheme";
import {
  IDEA_CHANGED_EVENT,
  IDEA_OPEN_EVENT,
  type IdeaChangedPayload,
  type IdeaOpenPayload,
} from "../ideas/events";
import { exportIdeaAsMarkdown } from "../ideas/exportIdeaAsMarkdown";
import { MarkdownEditor } from "./MarkdownEditor";

function getInitialIdeaId(): string | null {
  return new URLSearchParams(window.location.search).get("ideaId");
}

const AUTO_SAVE_DELAY_MS = 700;
type ExportState = "idle" | "exporting" | "saved" | "error";

export function IdeaEditorApp() {
  const { theme } = useTheme();
  const { ideas, isLoaded, errorMessage, saveIdea, removeIdea } =
    usePersistedIdeas();
  const [ideaId, setIdeaId] = useState<string | null>(getInitialIdeaId);
  const [editorSessionId, setEditorSessionId] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [savedTitle, setSavedTitle] = useState("");
  const [savedBody, setSavedBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const titleRef = useRef(title);
  const bodyRef = useRef(body);
  const dirtyRef = useRef(false);
  const savePromiseRef = useRef<Promise<boolean> | null>(null);
  const saveLatestRef = useRef<(force?: boolean) => Promise<boolean>>(
    async () => false,
  );
  const failedContentRef = useRef<string | null>(null);
  const isClosingRef = useRef(false);
  const selectedIdea = useMemo(
    () => ideas.find((idea) => idea.id === ideaId),
    [ideaId, ideas],
  );
  const isDirty = title !== savedTitle || body !== savedBody;
  const hasExportContent = title.trim().length > 0 || body.trim().length > 0;
  const contentKey = `${title}\u0000${body}`;
  titleRef.current = title;
  bodyRef.current = body;
  dirtyRef.current = isDirty;

  const saveCurrentIdea = useCallback(
    (force = false): Promise<boolean> => {
      if (!isDirty) return Promise.resolve(true);
      if (!force && failedContentRef.current === contentKey) {
        return Promise.resolve(false);
      }
      if (savePromiseRef.current) return savePromiseRef.current;

      const savingTitle = title;
      const savingBody = body;
      const promise = (async () => {
        setIsSaving(true);
        setSaveError(null);

        try {
          const savedIdea = await saveIdea(
            { title: savingTitle, body: savingBody },
            ideaId ?? undefined,
          );
          setIdeaId(savedIdea.id);
          setSavedTitle(savedIdea.title);
          setSavedBody(savedIdea.body);
          dirtyRef.current =
            titleRef.current !== savedIdea.title ||
            bodyRef.current !== savedIdea.body;
          failedContentRef.current = null;
          await emitTo<IdeaChangedPayload>("main", IDEA_CHANGED_EVENT, {
            ideaId: savedIdea.id,
          }).catch((err) => {
            console.error("Failed to notify idea change:", err);
          });
          return true;
        } catch (err) {
          failedContentRef.current = `${savingTitle}\u0000${savingBody}`;
          setSaveError(err instanceof Error ? err.message : String(err));
          return false;
        } finally {
          setIsSaving(false);
        }
      })();

      savePromiseRef.current = promise;
      void promise.finally(() => {
        if (savePromiseRef.current === promise) savePromiseRef.current = null;
      });
      return promise;
    },
    [body, contentKey, ideaId, isDirty, saveIdea, title],
  );
  saveLatestRef.current = saveCurrentIdea;

  const destroyEditorWindow = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    const currentWindow = getCurrentWindow();

    window.setTimeout(() => {
      void currentWindow.destroy().catch((err) => {
        isClosingRef.current = false;
        setSaveError(err instanceof Error ? err.message : String(err));
      });
    }, 0);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!ideaId) {
      failedContentRef.current = null;
      setTitle("");
      setBody("");
      setSavedTitle("");
      setSavedBody("");
      setSaveError(null);
      setExportState("idle");
      return;
    }

    if (selectedIdea) {
      failedContentRef.current = null;
      setTitle(selectedIdea.title);
      setBody(selectedIdea.body);
      setSavedTitle(selectedIdea.title);
      setSavedBody(selectedIdea.body);
      setSaveError(null);
      setExportState("idle");
    }
  }, [ideaId, isLoaded, selectedIdea]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void listen<IdeaOpenPayload>(IDEA_OPEN_EVENT, async (event) => {
      if (dirtyRef.current) {
        const shouldSave = window.confirm(
          "変更を保存して別のアイデアを開きますか？",
        );
        if (!shouldSave || !(await saveLatestRef.current(true))) return;
      }

      setIdeaId(event.payload.ideaId);
      setEditorSessionId((current) => current + 1);
    }).then((stopListening) => {
      unlisten = stopListening;
    });

    return () => unlisten?.();
  }, []);

  useEffect(() => {
    if (
      !isLoaded ||
      !isDirty ||
      isDeleting ||
      failedContentRef.current === contentKey
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveCurrentIdea();
    }, AUTO_SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [contentKey, isDeleting, isDirty, isLoaded, saveCurrentIdea]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveLatestRef.current(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const currentWindow = getCurrentWindow();

    void currentWindow
      .onCloseRequested(async (event) => {
        event.preventDefault();
        if (isClosingRef.current) return;

        if (!dirtyRef.current && !savePromiseRef.current) {
          destroyEditorWindow();
          return;
        }

        const shouldSave = window.confirm("変更を保存して閉じますか？");
        if (!shouldSave) return;

        let saved = await saveLatestRef.current(true);
        if (saved && dirtyRef.current)
          saved = await saveLatestRef.current(true);
        if (!saved || dirtyRef.current) return;

        destroyEditorWindow();
      })
      .then((stopListening) => {
        unlisten = stopListening;
      });

    return () => unlisten?.();
  }, [destroyEditorWindow]);

  const handleDelete = async () => {
    if (!ideaId || isSaving || isDeleting || exportState === "exporting") {
      return;
    }
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
      destroyEditorWindow();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    if (!hasExportContent || isDeleting || exportState === "exporting") return;

    setExportState("exporting");
    try {
      const result = await exportIdeaAsMarkdown(title, body);
      setExportState(result === "saved" ? "saved" : "idle");
    } catch (err) {
      console.error("Failed to export idea as Markdown:", err);
      setExportState("error");
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
            saveError || errorMessage || exportState === "error"
              ? "idea-editor-save-error"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {exportState === "exporting"
            ? "ファイルに保存中..."
            : exportState === "saved"
              ? "ファイルに保存しました"
              : exportState === "error"
                ? "ファイルに保存できませんでした"
                : isDeleting
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
        onSubmit={(event) => {
          event.preventDefault();
          void saveCurrentIdea(true);
        }}
      >
        <input
          key={`title-${editorSessionId}`}
          className="idea-editor-title"
          value={title}
          onChange={(event) => {
            setExportState("idle");
            setTitle(event.target.value.slice(0, MAX_IDEA_TITLE_LENGTH));
          }}
          disabled={isDeleting}
          maxLength={MAX_IDEA_TITLE_LENGTH}
          placeholder="アイデアのタイトル"
          aria-label="アイデアのタイトル"
        />
        <MarkdownEditor
          key={`body-${editorSessionId}`}
          value={body}
          onChange={(value) => {
            setExportState("idle");
            setBody(value);
          }}
          theme={theme}
          disabled={isDeleting}
          maxLength={MAX_IDEA_BODY_LENGTH}
        />
        <footer className="idea-editor-footer">
          <span>Markdownで記述できます</span>
          <div className="idea-editor-actions">
            <button
              type="button"
              disabled={
                !hasExportContent || isDeleting || exportState === "exporting"
              }
              onClick={() => void handleExport()}
            >
              <Download size={14} aria-hidden="true" />
              ファイルに保存
            </button>
            {ideaId ? (
              <button
                type="button"
                className="idea-editor-delete"
                disabled={isSaving || isDeleting || exportState === "exporting"}
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

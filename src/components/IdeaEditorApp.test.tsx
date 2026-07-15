import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IdeaItem } from "../hooks/usePersistedIdeas";
import { IdeaEditorApp } from "./IdeaEditorApp";

const ideaHookMock = vi.hoisted(() => ({
  usePersistedIdeas: vi.fn(),
}));

const exportMock = vi.hoisted(() => ({
  exportIdeaAsMarkdown: vi.fn(),
}));

const eventMock = vi.hoisted(() => ({
  emitTo: vi.fn(),
  listen: vi.fn().mockResolvedValue(vi.fn()),
  openHandler: undefined as
    | ((event: { payload: { ideaId: string | null } }) => Promise<void>)
    | undefined,
}));

const windowMock = vi.hoisted(() => ({
  destroy: vi.fn(),
  onCloseRequested: vi.fn(),
  closeHandler: undefined as
    | ((event: { preventDefault: () => void }) => Promise<void>)
    | undefined,
}));

vi.mock("../hooks/usePersistedIdeas", () => ({
  MAX_IDEA_BODY_LENGTH: 200_000,
  MAX_IDEA_TITLE_LENGTH: 200,
  usePersistedIdeas: ideaHookMock.usePersistedIdeas,
}));

vi.mock("../hooks/useTheme", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

vi.mock("../ideas/exportIdeaAsMarkdown", () => ({
  exportIdeaAsMarkdown: exportMock.exportIdeaAsMarkdown,
}));

vi.mock("./MarkdownEditor", () => ({
  MarkdownEditor: ({
    value,
    onChange,
    disabled,
    maxLength,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    maxLength?: number;
  }) => (
    <textarea
      aria-label="アイデアの本文"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      maxLength={maxLength}
    />
  ),
}));

vi.mock("@tauri-apps/api/event", () => ({
  emitTo: eventMock.emitTo,
  listen: eventMock.listen,
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    destroy: windowMock.destroy,
    onCloseRequested: windowMock.onCloseRequested,
  }),
}));

const idea: IdeaItem = {
  id: "idea-1",
  title: "サービス案",
  body: "# 概要\n\n新しいサービスを考える",
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T01:00:00.000Z",
};

beforeEach(() => {
  eventMock.openHandler = undefined;
  eventMock.listen.mockImplementation((_eventName, handler) => {
    eventMock.openHandler = handler;
    return Promise.resolve(vi.fn());
  });
  windowMock.destroy.mockResolvedValue(undefined);
  windowMock.closeHandler = undefined;
  windowMock.onCloseRequested.mockImplementation((handler) => {
    windowMock.closeHandler = handler;
    return Promise.resolve(vi.fn());
  });
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
  ideaHookMock.usePersistedIdeas.mockReset();
  exportMock.exportIdeaAsMarkdown.mockReset();
  eventMock.emitTo.mockReset();
  eventMock.listen.mockClear();
  windowMock.destroy.mockReset();
  windowMock.onCloseRequested.mockReset();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("IdeaEditorApp", () => {
  it("shows the selected idea", () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });

    const { getByLabelText, getByText } = render(<IdeaEditorApp />);

    expect(getByLabelText("アイデアのタイトル")).toHaveProperty(
      "value",
      "サービス案",
    );
    expect(getByLabelText("アイデアの本文")).toHaveProperty("value", idea.body);
    expect(getByText("保存済み")).toBeTruthy();
  });

  it("disables file saving while both title and body are empty", () => {
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });

    const { getByLabelText, getByRole } = render(<IdeaEditorApp />);
    const saveFileButton = getByRole("button", { name: "ファイルに保存" });

    expect(saveFileButton).toHaveProperty("disabled", true);

    fireEvent.change(getByLabelText("アイデアの本文"), {
      target: { value: "本文" },
    });

    expect(saveFileButton).toHaveProperty("disabled", false);
  });

  it("keeps file saving disabled for whitespace-only content", () => {
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });

    const { getByLabelText, getByRole } = render(<IdeaEditorApp />);
    fireEvent.change(getByLabelText("アイデアのタイトル"), {
      target: { value: "   " },
    });
    fireEvent.change(getByLabelText("アイデアの本文"), {
      target: { value: "\n\t" },
    });

    expect(getByRole("button", { name: "ファイルに保存" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("exports the current editor content without saving the idea", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    const saveIdea = vi.fn();
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea,
      removeIdea: vi.fn(),
    });
    exportMock.exportIdeaAsMarkdown.mockResolvedValue("saved");

    const { getByLabelText, getByRole, getByText } = render(<IdeaEditorApp />);
    fireEvent.change(getByLabelText("アイデアのタイトル"), {
      target: { value: "未保存のタイトル" },
    });
    fireEvent.change(getByLabelText("アイデアの本文"), {
      target: { value: "未保存の本文" },
    });
    fireEvent.click(getByRole("button", { name: "ファイルに保存" }));

    await waitFor(() =>
      expect(exportMock.exportIdeaAsMarkdown).toHaveBeenCalledWith(
        "未保存のタイトル",
        "未保存の本文",
      ),
    );
    expect(saveIdea).not.toHaveBeenCalled();
    expect(getByText("ファイルに保存しました")).toBeTruthy();
  });

  it("returns to the save status when export is cancelled", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });
    exportMock.exportIdeaAsMarkdown.mockResolvedValue("cancelled");

    const { getByRole, getByText } = render(<IdeaEditorApp />);
    fireEvent.click(getByRole("button", { name: "ファイルに保存" }));

    await waitFor(() => expect(getByText("保存済み")).toBeTruthy());
  });

  it("reports an export error", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });
    exportMock.exportIdeaAsMarkdown.mockRejectedValue(new Error("failed"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { getByRole, getByText } = render(<IdeaEditorApp />);
    fireEvent.click(getByRole("button", { name: "ファイルに保存" }));

    await waitFor(() =>
      expect(getByText("ファイルに保存できませんでした")).toBeTruthy(),
    );
  });

  it("saves changes before notifying the main window", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    const savedIdea = {
      ...idea,
      title: "更新したサービス案",
      updatedAt: "2026-07-12T00:00:00.000Z",
    };
    const saveIdea = vi.fn().mockResolvedValue(savedIdea);
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea,
      removeIdea: vi.fn(),
    });
    eventMock.emitTo.mockResolvedValue(undefined);

    const { getByLabelText, getByRole } = render(<IdeaEditorApp />);
    fireEvent.change(getByLabelText("アイデアのタイトル"), {
      target: { value: "更新したサービス案" },
    });
    fireEvent.click(getByRole("button", { name: "保存" }));

    await waitFor(() =>
      expect(saveIdea).toHaveBeenCalledWith(
        { title: "更新したサービス案", body: idea.body },
        "idea-1",
      ),
    );
    expect(eventMock.emitTo).toHaveBeenCalledWith("main", "idea:changed", {
      ideaId: "idea-1",
    });
    expect(saveIdea.mock.invocationCallOrder[0]).toBeLessThan(
      eventMock.emitTo.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
  });

  it("deletes an existing idea and closes the editor", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    const removeIdea = vi.fn().mockResolvedValue(undefined);
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea,
    });
    eventMock.emitTo.mockResolvedValue(undefined);
    windowMock.destroy.mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const { getByRole } = render(<IdeaEditorApp />);
    fireEvent.click(getByRole("button", { name: "削除" }));

    await waitFor(() => expect(removeIdea).toHaveBeenCalledWith("idea-1"));
    expect(eventMock.emitTo).toHaveBeenCalledWith("main", "idea:changed", {
      ideaId: "idea-1",
    });
    await waitFor(() => expect(windowMock.destroy).toHaveBeenCalled());
  });

  it("automatically saves after editing stops", async () => {
    vi.useFakeTimers();
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    const savedIdea = { ...idea, title: "自動保存する案" };
    const saveIdea = vi.fn().mockResolvedValue(savedIdea);
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea,
      removeIdea: vi.fn(),
    });
    eventMock.emitTo.mockResolvedValue(undefined);

    const { getByLabelText } = render(<IdeaEditorApp />);
    fireEvent.change(getByLabelText("アイデアのタイトル"), {
      target: { value: "自動保存する案" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });

    expect(saveIdea).toHaveBeenCalledWith(
      { title: "自動保存する案", body: idea.body },
      "idea-1",
    );
  });

  it("does not autosave when undo returns to the saved content", async () => {
    vi.useFakeTimers();
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    const saveIdea = vi.fn();
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea,
      removeIdea: vi.fn(),
    });

    const { getByLabelText } = render(<IdeaEditorApp />);
    const body = getByLabelText("アイデアの本文");
    fireEvent.change(body, { target: { value: "一時的な編集" } });
    fireEvent.change(body, { target: { value: idea.body } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });

    expect(saveIdea).not.toHaveBeenCalled();
  });

  it("limits title and body input to the persisted data limits", () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });

    const { getByLabelText } = render(<IdeaEditorApp />);
    const title = getByLabelText("アイデアのタイトル");
    const body = getByLabelText("アイデアの本文");
    fireEvent.change(title, { target: { value: "a".repeat(201) } });

    expect(title).toHaveProperty("maxLength", 200);
    expect(title).toHaveProperty("value", "a".repeat(200));
    expect(body).toHaveProperty("maxLength", 200_000);
  });

  it("resets both field instances when another idea is opened", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    const secondIdea: IdeaItem = {
      ...idea,
      id: "idea-2",
      title: "別のアイデア",
      body: "別の本文",
    };
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea, secondIdea],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });

    const { getByLabelText } = render(<IdeaEditorApp />);
    const originalTitle = getByLabelText("アイデアのタイトル");
    const originalBody = getByLabelText("アイデアの本文");
    await waitFor(() => expect(eventMock.openHandler).toBeDefined());

    await act(async () => {
      await eventMock.openHandler?.({ payload: { ideaId: "idea-2" } });
    });

    expect(getByLabelText("アイデアのタイトル")).not.toBe(originalTitle);
    expect(getByLabelText("アイデアの本文")).not.toBe(originalBody);
    expect(getByLabelText("アイデアのタイトル")).toHaveProperty(
      "value",
      "別のアイデア",
    );
    expect(getByLabelText("アイデアの本文")).toHaveProperty(
      "value",
      "別の本文",
    );
  });

  it("resets both field instances when the same idea is reopened", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });

    const { getByLabelText } = render(<IdeaEditorApp />);
    const originalTitle = getByLabelText("アイデアのタイトル");
    const originalBody = getByLabelText("アイデアの本文");
    await waitFor(() => expect(eventMock.openHandler).toBeDefined());

    await act(async () => {
      await eventMock.openHandler?.({ payload: { ideaId: "idea-1" } });
    });

    expect(getByLabelText("アイデアのタイトル")).not.toBe(originalTitle);
    expect(getByLabelText("アイデアの本文")).not.toBe(originalBody);
  });

  it("leaves undo and redo shortcuts to the focused title field", () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });

    const { getByLabelText } = render(<IdeaEditorApp />);
    const title = getByLabelText("アイデアのタイトル");

    expect(fireEvent.keyDown(title, { key: "z", ctrlKey: true })).toBe(true);
    expect(
      fireEvent.keyDown(title, { key: "z", ctrlKey: true, shiftKey: true }),
    ).toBe(true);
  });

  it("saves immediately with Ctrl+S", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    const savedIdea = { ...idea, body: "ショートカットで保存" };
    const saveIdea = vi.fn().mockResolvedValue(savedIdea);
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea,
      removeIdea: vi.fn(),
    });
    eventMock.emitTo.mockResolvedValue(undefined);

    const { getByLabelText } = render(<IdeaEditorApp />);
    fireEvent.change(getByLabelText("アイデアの本文"), {
      target: { value: "ショートカットで保存" },
    });
    fireEvent.keyDown(window, { key: "s", ctrlKey: true });

    await waitFor(() =>
      expect(saveIdea).toHaveBeenCalledWith(
        { title: idea.title, body: "ショートカットで保存" },
        "idea-1",
      ),
    );
  });

  it("saves unsaved changes before closing", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    const savedIdea = { ...idea, title: "閉じる前に保存" };
    const saveIdea = vi.fn().mockResolvedValue(savedIdea);
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea,
      removeIdea: vi.fn(),
    });
    eventMock.emitTo.mockResolvedValue(undefined);
    windowMock.destroy.mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const { getByLabelText } = render(<IdeaEditorApp />);
    fireEvent.change(getByLabelText("アイデアのタイトル"), {
      target: { value: "閉じる前に保存" },
    });
    const preventDefault = vi.fn();
    await act(async () => {
      await windowMock.closeHandler?.({ preventDefault });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(saveIdea).toHaveBeenCalledWith(
      { title: "閉じる前に保存", body: idea.body },
      "idea-1",
    );
    await waitFor(() => expect(windowMock.destroy).toHaveBeenCalled());
  });

  it("destroys the window when there are no unsaved changes", async () => {
    window.history.replaceState({}, "", "/?view=idea-editor&ideaId=idea-1");
    ideaHookMock.usePersistedIdeas.mockReturnValue({
      ideas: [idea],
      isLoaded: true,
      errorMessage: null,
      saveIdea: vi.fn(),
      removeIdea: vi.fn(),
    });

    render(<IdeaEditorApp />);
    const preventDefault = vi.fn();
    await act(async () => {
      await windowMock.closeHandler?.({ preventDefault });
    });

    expect(preventDefault).toHaveBeenCalled();
    await waitFor(() => expect(windowMock.destroy).toHaveBeenCalled());
  });
});

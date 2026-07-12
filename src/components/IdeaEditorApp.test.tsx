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

const eventMock = vi.hoisted(() => ({
  emitTo: vi.fn(),
  listen: vi.fn().mockResolvedValue(vi.fn()),
}));

const windowMock = vi.hoisted(() => ({
  destroy: vi.fn(),
  onCloseRequested: vi.fn(),
  closeHandler: undefined as
    | ((event: { preventDefault: () => void }) => Promise<void>)
    | undefined,
}));

vi.mock("../hooks/usePersistedIdeas", () => ({
  usePersistedIdeas: ideaHookMock.usePersistedIdeas,
}));

vi.mock("../hooks/useTheme", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

vi.mock("./MarkdownEditor", () => ({
  MarkdownEditor: ({
    value,
    onChange,
    disabled,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <textarea
      aria-label="アイデアの本文"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
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
  eventMock.listen.mockResolvedValue(vi.fn());
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

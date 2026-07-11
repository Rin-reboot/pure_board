import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { IdeaItem } from "../hooks/usePersistedIdeas";
import { IdeaPanel } from "./IdeaPanel";

const ideaHookMock = vi.hoisted(() => ({
  usePersistedIdeas: vi.fn(),
}));

vi.mock("../hooks/usePersistedIdeas", () => ({
  usePersistedIdeas: ideaHookMock.usePersistedIdeas,
}));

const olderIdea: IdeaItem = {
  id: "idea-1",
  title: "ウィジェット改善",
  body: "操作をもっと分かりやすくする",
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T01:00:00.000Z",
};

const newerIdea: IdeaItem = {
  id: "idea-2",
  title: "",
  body: "# 新しい表示方法\n\n一覧を見直す",
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T01:00:00.000Z",
};

function mockIdeas({
  ideas = [],
  isLoaded = true,
  errorMessage = null,
  createIdea = vi.fn(() => newerIdea),
}: {
  ideas?: IdeaItem[];
  isLoaded?: boolean;
  errorMessage?: string | null;
  createIdea?: () => IdeaItem;
} = {}) {
  ideaHookMock.usePersistedIdeas.mockReturnValue({
    ideas,
    isLoaded,
    errorMessage,
    createIdea,
  });

  return { createIdea };
}

afterEach(() => {
  cleanup();
  ideaHookMock.usePersistedIdeas.mockReset();
});

describe("IdeaPanel", () => {
  it("renders loading, empty, and error states", () => {
    mockIdeas({ isLoaded: false });
    const loadingView = render(
      <IdeaPanel onCreateIdea={vi.fn()} onOpenIdea={vi.fn()} />,
    );
    expect(loadingView.getByText("読み込み中...")).toBeTruthy();
    loadingView.unmount();

    mockIdeas();
    const emptyView = render(
      <IdeaPanel onCreateIdea={vi.fn()} onOpenIdea={vi.fn()} />,
    );
    expect(
      emptyView.getByText("思いついたことを書き留めてみましょう"),
    ).toBeTruthy();
    emptyView.unmount();

    mockIdeas({ errorMessage: "failed" });
    const errorView = render(
      <IdeaPanel onCreateIdea={vi.fn()} onOpenIdea={vi.fn()} />,
    );
    expect(errorView.getByText("アイデアを読み込めませんでした")).toBeTruthy();
  });

  it("shows ideas by most recently updated first", () => {
    mockIdeas({ ideas: [olderIdea, newerIdea] });

    const { getAllByRole, getByText } = render(
      <IdeaPanel onCreateIdea={vi.fn()} onOpenIdea={vi.fn()} />,
    );

    const items = getAllByRole("listitem");
    expect(items[0]?.textContent).toContain("新しい表示方法");
    expect(items[1]?.textContent).toContain("ウィジェット改善");
    expect(getByText("新しい表示方法")).toBeTruthy();
  });

  it("creates an idea and passes it to the editor callback", () => {
    const { createIdea } = mockIdeas();
    const onCreateIdea = vi.fn();
    const { getByLabelText } = render(
      <IdeaPanel onCreateIdea={onCreateIdea} onOpenIdea={vi.fn()} />,
    );

    fireEvent.click(getByLabelText("新しいアイデアを書き留める"));

    expect(createIdea).toHaveBeenCalledTimes(1);
    expect(onCreateIdea).toHaveBeenCalledWith(newerIdea);
  });

  it("opens an existing idea", () => {
    mockIdeas({ ideas: [olderIdea] });
    const onOpenIdea = vi.fn();
    const { getByLabelText } = render(
      <IdeaPanel onCreateIdea={vi.fn()} onOpenIdea={onOpenIdea} />,
    );

    fireEvent.click(getByLabelText("アイデア「ウィジェット改善」を開く"));

    expect(onOpenIdea).toHaveBeenCalledWith("idea-1");
  });
});

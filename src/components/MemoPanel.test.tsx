import { cleanup, fireEvent, render, within } from "@testing-library/react";
import type { Dispatch, SetStateAction } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MemoItem } from "../hooks/usePersistedMemos";
import { MemoPanel } from "./MemoPanel";

type SetMemos = Dispatch<SetStateAction<MemoItem[]>>;

const memoHookMock = vi.hoisted(() => ({
  usePersistedMemos: vi.fn(),
}));

vi.mock("../hooks/usePersistedMemos", () => ({
  usePersistedMemos: memoHookMock.usePersistedMemos,
}));

afterEach(() => {
  memoHookMock.usePersistedMemos.mockReset();
  vi.restoreAllMocks();
  cleanup();
});

function mockMemos({
  memos = [],
  setMemos = vi.fn<SetMemos>(),
  deleteMemo = vi.fn<(id: string) => void>(),
  isLoaded = true,
}: {
  memos?: MemoItem[];
  setMemos?: SetMemos;
  deleteMemo?: (id: string) => void;
  isLoaded?: boolean;
}) {
  memoHookMock.usePersistedMemos.mockReturnValue({
    memos,
    setMemos,
    deleteMemo,
    isLoaded,
  });
  return { setMemos, deleteMemo };
}

describe("MemoPanel", () => {
  it("renders the loading state", () => {
    mockMemos({ isLoaded: false });

    const { getByText } = render(<MemoPanel />);

    expect(getByText("読み込み中...")).toBeTruthy();
  });

  it("renders existing memos", () => {
    mockMemos({
      memos: [
        { id: "memo-1", text: "Review tests", done: false, tag: "今日中" },
      ],
    });

    const { getByRole, getByText } = render(<MemoPanel />);

    expect(getByText("Review tests")).toBeTruthy();
    expect(within(getByRole("listitem")).getByText("今日中")).toBeTruthy();
  });

  it("toggles a memo through the setter updater", () => {
    const setMemos = vi.fn();
    mockMemos({
      memos: [
        { id: "memo-1", text: "Review tests", done: false, tag: "今日中" },
      ],
      setMemos,
    });

    const { getByRole } = render(<MemoPanel />);

    fireEvent.click(getByRole("checkbox"));

    const updater = setMemos.mock.calls[0]?.[0] as
      | ((memos: MemoItem[]) => MemoItem[])
      | undefined;
    expect(
      updater?.([
        { id: "memo-1", text: "Review tests", done: false, tag: "今日中" },
      ]),
    ).toEqual([
      { id: "memo-1", text: "Review tests", done: true, tag: "今日中" },
    ]);
  });

  it("deletes a memo", () => {
    const deleteMemo = vi.fn();
    mockMemos({
      memos: [
        { id: "memo-1", text: "Review tests", done: false, tag: "今日中" },
      ],
      deleteMemo,
    });

    const { getByLabelText } = render(<MemoPanel />);

    fireEvent.click(getByLabelText("削除"));

    expect(deleteMemo).toHaveBeenCalledWith("memo-1");
  });

  it("adds a memo and clears the draft", () => {
    const randomUUID = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValue("00000000-0000-4000-8000-000000000000");
    const setMemos = vi.fn();
    mockMemos({ setMemos });

    const { getByLabelText, getByPlaceholderText } = render(<MemoPanel />);
    const input = getByPlaceholderText("メモを入力...") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "  New memo  " } });
    fireEvent.click(getByLabelText("送信"));

    const updater = setMemos.mock.calls[0]?.[0] as
      | ((memos: MemoItem[]) => MemoItem[])
      | undefined;
    expect(updater?.([])).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000000",
        text: "New memo",
        done: false,
        tag: "今日中",
      },
    ]);
    expect(input.value).toBe("");

    randomUUID.mockRestore();
  });

  it("does not add blank memos", () => {
    const setMemos = vi.fn();
    mockMemos({ setMemos });

    const { getByLabelText, getByPlaceholderText } = render(<MemoPanel />);

    fireEvent.change(getByPlaceholderText("メモを入力..."), {
      target: { value: "   " },
    });
    fireEvent.click(getByLabelText("送信"));

    expect(setMemos).not.toHaveBeenCalled();
  });
});

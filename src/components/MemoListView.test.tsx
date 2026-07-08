import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoListView } from "./MemoListView";

const memos = [
  { id: "memo-1", text: "Review tests", done: false, tag: "today" },
  { id: "memo-2", text: "Ship release", done: true, tag: "tomorrow" },
  { id: "memo-3", text: "Plan docs", done: false, tag: "tomorrow" },
];

describe("MemoListView", () => {
  it("filters memos by completion state", () => {
    const { container, getByText, queryByText } = render(
      <MemoListView
        memos={memos}
        isExpanded={true}
        onToggleMemo={vi.fn()}
        onDeleteMemo={vi.fn()}
      />,
    );

    const [, activeButton] = Array.from(container.querySelectorAll("button"));
    fireEvent.click(activeButton);

    expect(getByText("2 / 3")).toBeTruthy();
    expect(getByText("Review tests")).toBeTruthy();
    expect(getByText("Plan docs")).toBeTruthy();
    expect(queryByText("Ship release")).toBeNull();
  });

  it("filters memos by tag", () => {
    const { getByRole, getByText, queryByText } = render(
      <MemoListView
        memos={memos}
        isExpanded={true}
        onToggleMemo={vi.fn()}
        onDeleteMemo={vi.fn()}
      />,
    );

    fireEvent.change(getByRole("combobox"), {
      target: { value: "today" },
    });

    expect(getByText("1 / 3")).toBeTruthy();
    expect(getByText("Review tests")).toBeTruthy();
    expect(queryByText("Ship release")).toBeNull();
    expect(queryByText("Plan docs")).toBeNull();
  });

  it("keeps memo actions available after filtering", () => {
    const onToggleMemo = vi.fn();
    const onDeleteMemo = vi.fn();
    const { getByRole, getByText } = render(
      <MemoListView
        memos={memos}
        isExpanded={true}
        onToggleMemo={onToggleMemo}
        onDeleteMemo={onDeleteMemo}
      />,
    );

    fireEvent.change(getByRole("combobox"), {
      target: { value: "today" },
    });
    fireEvent.click(getByRole("checkbox"));
    fireEvent.click(
      getByText("Review tests").parentElement?.querySelector(
        ".memo-delete",
      ) as HTMLButtonElement,
    );

    expect(onToggleMemo).toHaveBeenCalledWith("memo-1");
    expect(onDeleteMemo).toHaveBeenCalledWith("memo-1");
  });
});

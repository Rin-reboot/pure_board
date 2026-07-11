import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MarkdownEditor } from "./MarkdownEditor";

beforeAll(() => {
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
});

afterEach(cleanup);

describe("MarkdownEditor", () => {
  it("renders Markdown content in an accessible CodeMirror editor", () => {
    const { container, getByLabelText, rerender } = render(
      <MarkdownEditor
        value="# 新しいアイデア"
        onChange={vi.fn()}
        theme="dark"
      />,
    );

    expect(container.querySelector(".cm-editor")).toBeTruthy();
    expect(getByLabelText("アイデアの本文").textContent).toContain(
      "新しいアイデア",
    );

    rerender(
      <MarkdownEditor
        value="**更新しました**"
        onChange={vi.fn()}
        theme="dark"
      />,
    );

    expect(getByLabelText("アイデアの本文").textContent).toContain(
      "更新しました",
    );
  });

  it("reports document changes", async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <MarkdownEditor value="" onChange={onChange} theme="light" />,
    );
    const editor = getByLabelText("アイデアの本文");

    editor.textContent = "- 新しい項目";
    fireEvent.input(editor);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("- 新しい項目"));
  });
});

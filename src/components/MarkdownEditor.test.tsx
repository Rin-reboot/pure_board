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

  it("undoes and redoes body edits with the editor shortcuts", async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <MarkdownEditor value="original" onChange={onChange} theme="light" />,
    );
    const editor = getByLabelText("アイデアの本文");

    editor.textContent = "updated";
    fireEvent.input(editor);
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("updated"));

    fireEvent.keyDown(editor, { key: "z", ctrlKey: true });
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("original"));

    fireEvent.keyDown(editor, { key: "z", ctrlKey: true, shiftKey: true });
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("updated"));
  });

  it("undoes multiple edit groups in reverse order", async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <MarkdownEditor value="first" onChange={onChange} theme="light" />,
    );
    const editor = getByLabelText("アイデアの本文");

    editor.textContent = "second";
    fireEvent.input(editor);
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("second"));
    await new Promise((resolve) => window.setTimeout(resolve, 550));

    editor.textContent = "third";
    fireEvent.input(editor);
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("third"));

    fireEvent.keyDown(editor, { key: "z", ctrlKey: true });
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("second"));
    fireEvent.keyDown(editor, { key: "z", ctrlKey: true });
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("first"));
  });

  it("does not add externally loaded content to undo history", async () => {
    const onChange = vi.fn();
    const { getByLabelText, rerender } = render(
      <MarkdownEditor value="first idea" onChange={onChange} theme="light" />,
    );

    rerender(
      <MarkdownEditor value="second idea" onChange={onChange} theme="light" />,
    );
    const editor = getByLabelText("アイデアの本文");
    await waitFor(() => expect(editor.textContent).toContain("second idea"));

    fireEvent.keyDown(editor, { key: "z", ctrlKey: true });

    expect(editor.textContent).toContain("second idea");
    expect(onChange).toHaveBeenLastCalledWith("second idea");
  });

  it("rejects edits beyond the configured maximum length", async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <MarkdownEditor
        value="12345"
        onChange={onChange}
        theme="light"
        maxLength={5}
      />,
    );
    const editor = getByLabelText("アイデアの本文");

    editor.textContent = "123456";
    fireEvent.input(editor);

    await waitFor(() => expect(editor.textContent).toContain("12345"));
    expect(onChange).not.toHaveBeenCalledWith("123456");
  });
});

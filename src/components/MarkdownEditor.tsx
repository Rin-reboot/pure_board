import { markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { placeholder } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { EditorView, minimalSetup } from "codemirror";
import { useEffect, useRef } from "react";
import type { Theme } from "../hooks/useTheme";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  disabled?: boolean;
}

const darkHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, color: "#fda4af", fontWeight: "700" },
  { tag: tags.strong, color: "#f8fafc", fontWeight: "700" },
  { tag: tags.emphasis, color: "#c4b5fd", fontStyle: "italic" },
  { tag: [tags.link, tags.url], color: "#7dd3fc", textDecoration: "underline" },
  { tag: [tags.monospace, tags.processingInstruction], color: "#86efac" },
  { tag: tags.quote, color: "#cbd5e1", fontStyle: "italic" },
  { tag: [tags.list, tags.punctuation], color: "#f9a8d4" },
  { tag: [tags.meta, tags.contentSeparator], color: "#94a3b8" },
]);

const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, color: "#be123c", fontWeight: "700" },
  { tag: tags.strong, color: "#172033", fontWeight: "700" },
  { tag: tags.emphasis, color: "#6d28d9", fontStyle: "italic" },
  { tag: [tags.link, tags.url], color: "#0369a1", textDecoration: "underline" },
  { tag: [tags.monospace, tags.processingInstruction], color: "#15803d" },
  { tag: tags.quote, color: "#475569", fontStyle: "italic" },
  { tag: [tags.list, tags.punctuation], color: "#be185d" },
  { tag: [tags.meta, tags.contentSeparator], color: "#64748b" },
]);

function createEditorTheme(theme: Theme) {
  return EditorView.theme(
    {
      "&": {
        height: "100%",
        backgroundColor: "transparent",
        color: "var(--idea-editor-text)",
      },
      ".cm-content": {
        minHeight: "100%",
        padding: "18px",
        caretColor: "var(--accent-idea)",
      },
      ".cm-line": {
        padding: "0",
      },
      ".cm-scroller": {
        overflow: "auto",
        fontFamily: '"Cascadia Code", "Consolas", monospace',
        fontSize: "0.88rem",
        lineHeight: "1.7",
      },
      ".cm-gutters": {
        border: "0",
        backgroundColor: "transparent",
        color: "var(--idea-editor-placeholder)",
      },
      ".cm-placeholder": {
        color: "var(--idea-editor-placeholder)",
        fontStyle: "normal",
      },
      ".cm-activeLine, .cm-activeLineGutter": {
        backgroundColor:
          "color-mix(in srgb, var(--accent-idea) 7%, transparent)",
      },
      ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
        backgroundColor:
          "color-mix(in srgb, var(--accent-idea) 28%, transparent)",
      },
      "&.cm-focused": {
        outline: "none",
      },
    },
    { dark: theme === "dark" },
  );
}

export function MarkdownEditor({
  value,
  onChange,
  theme,
  disabled = false,
}: MarkdownEditorProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const view = new EditorView({
      doc: valueRef.current,
      parent,
      extensions: [
        minimalSetup,
        markdown(),
        placeholder("思いついたことを書いてみましょう..."),
        EditorView.lineWrapping,
        EditorView.editable.of(!disabled),
        EditorView.contentAttributes.of({
          "aria-label": "アイデアの本文",
          "aria-disabled": String(disabled),
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        createEditorTheme(theme),
        syntaxHighlighting(
          theme === "dark" ? darkHighlightStyle : lightHighlightStyle,
        ),
      ],
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [disabled, theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
  }, [value]);

  return <div ref={parentRef} className="idea-editor-body" />;
}

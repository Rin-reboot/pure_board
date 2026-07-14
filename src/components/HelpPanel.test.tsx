import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HELP_TOPICS } from "../help/helpTopics";
import { HelpPanel } from "./HelpPanel";

afterEach(cleanup);

describe("HelpPanel", () => {
  it("renders the help navigation and the default topic", () => {
    const { getByLabelText, getByRole, getByText } = render(<HelpPanel />);

    expect(getByLabelText("Help")).toBeTruthy();
    expect(getByLabelText("ヘルプ項目")).toBeTruthy();
    expect(getByRole("heading", { name: "はじめに" })).toBeTruthy();
    expect(getByText("カスタマイズ")).toBeTruthy();
    expect(getByText("サポート")).toBeTruthy();
  });

  it("shows the corresponding markdown when a topic is selected", () => {
    const { getByRole } = render(<HelpPanel />);

    fireEvent.click(getByRole("button", { name: "TODO" }));

    expect(getByRole("heading", { name: "TODO" })).toBeTruthy();
    expect(getByRole("heading", { name: "TODOを追加する" })).toBeTruthy();
  });

  it("explains how to capture and save ideas", () => {
    const { getByRole } = render(<HelpPanel />);

    fireEvent.click(getByRole("button", { name: "Ideas" }));

    expect(getByRole("heading", { name: "Ideas" })).toBeTruthy();
    expect(getByRole("heading", { name: "アイデアを書き留める" })).toBeTruthy();
    expect(getByRole("heading", { name: "保存" })).toBeTruthy();
    expect(getByRole("heading", { name: "Undo / Redo" })).toBeTruthy();
  });

  it("collapses and reopens the help navigation", () => {
    const { getByLabelText } = render(<HelpPanel />);

    const closeButton = getByLabelText("目次を閉じる");
    expect(closeButton).toHaveProperty("ariaExpanded", "true");

    fireEvent.click(closeButton);

    expect(getByLabelText("ヘルプ項目")).toHaveProperty("hidden", true);
    const openButton = getByLabelText("目次を開く");
    expect(openButton).toHaveProperty("ariaExpanded", "false");

    fireEvent.click(openButton);

    expect(getByLabelText("ヘルプ項目")).toHaveProperty("hidden", false);
  });

  it("contains every required basic help topic", () => {
    expect(HELP_TOPICS.map((topic) => topic.id)).toEqual([
      "getting-started",
      "window-controls",
      "system-monitor",
      "network-ping",
      "todo",
      "ideas",
      "shortcuts",
      "layout-editing",
      "settings",
      "troubleshooting",
    ]);
  });
});

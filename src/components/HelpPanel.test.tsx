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

    fireEvent.click(getByRole("button", { name: "Memo" }));

    expect(getByRole("heading", { name: "Memo" })).toBeTruthy();
    expect(getByRole("heading", { name: "メモを追加する" })).toBeTruthy();
  });

  it("contains every required basic help topic", () => {
    expect(HELP_TOPICS.map((topic) => topic.id)).toEqual([
      "getting-started",
      "window-controls",
      "system-monitor",
      "network-ping",
      "memo",
      "shortcuts",
      "layout-editing",
      "settings",
      "troubleshooting",
    ]);
  });
});

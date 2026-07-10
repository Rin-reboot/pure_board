import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "./Footer";

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-07T09:05:00"));
});

describe("Footer", () => {
  it("renders the current date and updates every thirty seconds", () => {
    const { getByText } = render(
      <Footer
        isHistoryOpen={false}
        isHelpOpen={false}
        isEditMode={false}
        isShortcutsOpen={false}
        theme="dark"
        onToggleHistory={vi.fn()}
        onToggleHelp={vi.fn()}
        onToggleEditMode={vi.fn()}
        onToggleShortcuts={vi.fn()}
        onToggleTheme={vi.fn()}
      />,
    );

    expect(getByText("2026/07/07 09:05")).toBeTruthy();

    act(() => {
      vi.setSystemTime(new Date("2026-07-07T09:06:00"));
      vi.advanceTimersByTime(30_000);
    });

    expect(getByText("2026/07/07 09:06")).toBeTruthy();
  });

  it("calls the theme toggle handler", () => {
    const onToggleTheme = vi.fn();
    const { getByLabelText } = render(
      <Footer
        isHistoryOpen={false}
        isHelpOpen={false}
        isEditMode={false}
        isShortcutsOpen={false}
        theme="light"
        onToggleHistory={vi.fn()}
        onToggleHelp={vi.fn()}
        onToggleEditMode={vi.fn()}
        onToggleShortcuts={vi.fn()}
        onToggleTheme={onToggleTheme}
      />,
    );

    fireEvent.click(getByLabelText("Toggle theme"));

    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("calls the edit mode toggle handler", () => {
    const onToggleEditMode = vi.fn();
    const { getByLabelText } = render(
      <Footer
        isHistoryOpen={false}
        isHelpOpen={false}
        isEditMode={false}
        isShortcutsOpen={false}
        theme="dark"
        onToggleHistory={vi.fn()}
        onToggleHelp={vi.fn()}
        onToggleEditMode={onToggleEditMode}
        onToggleShortcuts={vi.fn()}
        onToggleTheme={vi.fn()}
      />,
    );

    fireEvent.click(getByLabelText("Edit mode"));

    expect(onToggleEditMode).toHaveBeenCalledTimes(1);
  });

  it("calls the history toggle handler", () => {
    const onToggleHistory = vi.fn();
    const { getByLabelText } = render(
      <Footer
        isHistoryOpen={false}
        isHelpOpen={false}
        isEditMode={false}
        isShortcutsOpen={false}
        theme="dark"
        onToggleHistory={onToggleHistory}
        onToggleHelp={vi.fn()}
        onToggleEditMode={vi.fn()}
        onToggleShortcuts={vi.fn()}
        onToggleTheme={vi.fn()}
      />,
    );

    fireEvent.click(getByLabelText("Graph"));

    expect(onToggleHistory).toHaveBeenCalledTimes(1);
  });

  it("calls the shortcuts toggle handler", () => {
    const onToggleShortcuts = vi.fn();
    const { getByLabelText } = render(
      <Footer
        isHistoryOpen={false}
        isHelpOpen={false}
        isEditMode={false}
        isShortcutsOpen={false}
        theme="dark"
        onToggleHistory={vi.fn()}
        onToggleHelp={vi.fn()}
        onToggleEditMode={vi.fn()}
        onToggleShortcuts={onToggleShortcuts}
        onToggleTheme={vi.fn()}
      />,
    );

    fireEvent.click(getByLabelText("Shortcuts"));

    expect(onToggleShortcuts).toHaveBeenCalledTimes(1);
  });

  it("calls the help toggle handler and exposes the active state", () => {
    const onToggleHelp = vi.fn();
    const { getByLabelText } = render(
      <Footer
        isHistoryOpen={false}
        isHelpOpen={true}
        isEditMode={false}
        isShortcutsOpen={false}
        theme="dark"
        onToggleHistory={vi.fn()}
        onToggleHelp={onToggleHelp}
        onToggleEditMode={vi.fn()}
        onToggleShortcuts={vi.fn()}
        onToggleTheme={vi.fn()}
      />,
    );

    const helpButton = getByLabelText("Help");
    expect(helpButton).toHaveProperty("ariaPressed", "true");

    fireEvent.click(helpButton);

    expect(onToggleHelp).toHaveBeenCalledTimes(1);
  });
});

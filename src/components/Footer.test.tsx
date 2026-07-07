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
      <Footer theme="dark" onToggleTheme={vi.fn()} />,
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
      <Footer theme="light" onToggleTheme={onToggleTheme} />,
    );

    fireEvent.click(getByLabelText("テーマ切替"));

    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});

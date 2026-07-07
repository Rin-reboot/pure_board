import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TitleBar } from "./TitleBar";

const windowMocks = vi.hoisted(() => ({
  close: vi.fn(),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    close: windowMocks.close,
  }),
}));

afterEach(() => {
  windowMocks.close.mockClear();
  cleanup();
});

describe("TitleBar", () => {
  it("reflects the pinned state and calls the toggle handler", () => {
    const onTogglePin = vi.fn();
    const { getByLabelText } = render(
      <TitleBar isPinned={true} onTogglePin={onTogglePin} />,
    );
    const pinButton = getByLabelText("常に最前面に表示");

    expect(pinButton.getAttribute("aria-pressed")).toBe("true");
    expect(pinButton.className).toContain("is-active");

    fireEvent.click(pinButton);

    expect(onTogglePin).toHaveBeenCalledTimes(1);
  });

  it("closes the current window", () => {
    const { getByLabelText } = render(
      <TitleBar isPinned={false} onTogglePin={vi.fn()} />,
    );

    fireEvent.click(getByLabelText("閉じる"));

    expect(windowMocks.close).toHaveBeenCalledTimes(1);
  });
});

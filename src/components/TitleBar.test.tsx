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
      <TitleBar
        isDragEnabled={true}
        isPinned={true}
        isSettingsOpen={false}
        onTogglePin={onTogglePin}
        onToggleSettings={vi.fn()}
      />,
    );
    const pinButton = getByLabelText("常に最前面に表示");

    expect(pinButton.getAttribute("aria-pressed")).toBe("true");
    expect(pinButton.className).toContain("is-active");

    fireEvent.click(pinButton);

    expect(onTogglePin).toHaveBeenCalledTimes(1);
  });

  it("reflects the settings state and calls the toggle handler", () => {
    const onToggleSettings = vi.fn();
    const { getByLabelText } = render(
      <TitleBar
        isDragEnabled={true}
        isPinned={false}
        isSettingsOpen={true}
        onTogglePin={vi.fn()}
        onToggleSettings={onToggleSettings}
      />,
    );
    const settingsButton = getByLabelText("設定");

    expect(settingsButton.getAttribute("aria-pressed")).toBe("true");
    expect(settingsButton.className).toContain("is-active");

    fireEvent.click(settingsButton);

    expect(onToggleSettings).toHaveBeenCalledTimes(1);
  });

  it("closes the current window", () => {
    const { getByLabelText } = render(
      <TitleBar
        isDragEnabled={true}
        isPinned={false}
        isSettingsOpen={false}
        onTogglePin={vi.fn()}
        onToggleSettings={vi.fn()}
      />,
    );

    fireEvent.click(getByLabelText("閉じる"));

    expect(windowMocks.close).toHaveBeenCalledTimes(1);
  });

  it("omits the Tauri drag region when dragging is disabled", () => {
    const { container } = render(
      <TitleBar
        isDragEnabled={false}
        isPinned={false}
        isSettingsOpen={false}
        onTogglePin={vi.fn()}
        onToggleSettings={vi.fn()}
      />,
    );

    expect(
      container
        .querySelector(".title-bar")
        ?.hasAttribute("data-tauri-drag-region"),
    ).toBe(false);
  });
});

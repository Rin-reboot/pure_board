import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TitleBar } from "./TitleBar";

afterEach(cleanup);

describe("TitleBar", () => {
  it("reflects the pinned state and calls the toggle handler", () => {
    const onTogglePin = vi.fn();
    const { getByLabelText } = render(
      <TitleBar
        isDragEnabled={true}
        isPinned={true}
        isSettingsOpen={false}
        onCloseRequest={vi.fn()}
        onTogglePin={onTogglePin}
        onToggleSettings={vi.fn()}
      />,
    );
    const pinButton = getByLabelText("Toggle always on top");

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
        onCloseRequest={vi.fn()}
        onTogglePin={vi.fn()}
        onToggleSettings={onToggleSettings}
      />,
    );
    const settingsButton = getByLabelText("Toggle settings");

    expect(settingsButton.getAttribute("aria-pressed")).toBe("true");
    expect(settingsButton.className).toContain("is-active");

    fireEvent.click(settingsButton);

    expect(onToggleSettings).toHaveBeenCalledTimes(1);
  });

  it("calls the close request handler", () => {
    const onCloseRequest = vi.fn();
    const { getByLabelText } = render(
      <TitleBar
        isDragEnabled={true}
        isPinned={false}
        isSettingsOpen={false}
        onCloseRequest={onCloseRequest}
        onTogglePin={vi.fn()}
        onToggleSettings={vi.fn()}
      />,
    );

    fireEvent.click(getByLabelText("Close"));

    expect(onCloseRequest).toHaveBeenCalledTimes(1);
  });

  it("omits the Tauri drag region when dragging is disabled", () => {
    const { container } = render(
      <TitleBar
        isDragEnabled={false}
        isPinned={false}
        isSettingsOpen={false}
        onCloseRequest={vi.fn()}
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

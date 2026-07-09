import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "./SettingsPanel";

afterEach(cleanup);

describe("SettingsPanel", () => {
  it("renders the settings title and update interval", () => {
    const { getByLabelText, getByText } = render(
      <SettingsPanel
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        updateIntervalMs={1500}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    expect(getByLabelText("Settings")).toBeTruthy();
    expect(getByText("Settings")).toBeTruthy();
    expect(getByText("System")).toBeTruthy();
    expect(getByText("Application")).toBeTruthy();
    expect(getByText("Update interval")).toBeTruthy();
    expect(getByText("Launch at startup")).toBeTruthy();
    expect(getByLabelText("Update interval")).toHaveProperty("value", "1.5");
  });

  it("calls the interval change handler with the entered value in milliseconds", () => {
    const onUpdateIntervalChange = vi.fn();
    const { getByLabelText } = render(
      <SettingsPanel
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        updateIntervalMs={1500}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={onUpdateIntervalChange}
      />,
    );

    fireEvent.change(getByLabelText("Update interval"), {
      target: { value: "2.4" },
    });

    expect(onUpdateIntervalChange).toHaveBeenCalledWith(2400);
  });

  it("calls the auto-start toggle handler", () => {
    const onToggleAutoStart = vi.fn();
    const { getByLabelText } = render(
      <SettingsPanel
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        updateIntervalMs={1500}
        onToggleAutoStart={onToggleAutoStart}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    fireEvent.click(getByLabelText("Launch at startup"));

    expect(onToggleAutoStart).toHaveBeenCalledTimes(1);
  });

  it("disables the auto-start toggle until the setting is loaded", () => {
    const { getByLabelText } = render(
      <SettingsPanel
        isAutoStartEnabled={false}
        isAutoStartLoaded={false}
        updateIntervalMs={1500}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    expect(getByLabelText("Launch at startup")).toHaveProperty(
      "disabled",
      true,
    );
  });
});

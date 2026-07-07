import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "./SettingsPanel";

afterEach(cleanup);

describe("SettingsPanel", () => {
  it("renders the settings title and update interval", () => {
    const { getByLabelText, getByText } = render(
      <SettingsPanel
        updateIntervalMs={1500}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    expect(getByLabelText("Settings")).toBeTruthy();
    expect(getByText("Settings")).toBeTruthy();
    expect(getByText("System")).toBeTruthy();
    expect(getByText("Update interval")).toBeTruthy();
    expect(getByLabelText("Update interval")).toHaveProperty("value", "1.5");
  });

  it("calls the interval change handler with the entered value in milliseconds", () => {
    const onUpdateIntervalChange = vi.fn();
    const { getByLabelText } = render(
      <SettingsPanel
        updateIntervalMs={1500}
        onUpdateIntervalChange={onUpdateIntervalChange}
      />,
    );

    fireEvent.change(getByLabelText("Update interval"), {
      target: { value: "2.4" },
    });

    expect(onUpdateIntervalChange).toHaveBeenCalledWith(2400);
  });
});

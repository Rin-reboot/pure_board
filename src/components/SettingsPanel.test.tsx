import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SettingsPanel } from "./SettingsPanel";

afterEach(cleanup);

describe("SettingsPanel", () => {
  it("renders the settings title and update interval", () => {
    const { getByLabelText, getByText } = render(
      <SettingsPanel updateIntervalLabel="1.5s" />,
    );

    expect(getByLabelText("Settings")).toBeTruthy();
    expect(getByText("Settings")).toBeTruthy();
    expect(getByText("System")).toBeTruthy();
    expect(getByText("Update interval")).toBeTruthy();
    expect(getByText("1.5s")).toBeTruthy();
  });
});

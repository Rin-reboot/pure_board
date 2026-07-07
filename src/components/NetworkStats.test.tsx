import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NetworkStats } from "./NetworkStats";

afterEach(cleanup);

describe("NetworkStats", () => {
  it("renders network values and units", () => {
    const { getByText, getAllByText } = render(
      <NetworkStats downloadMbps={120} uploadMbps={28} pingMs={8} />,
    );
    const pingStat = getByText("Ping").closest(".network-stat");

    expect(getByText(/120/)).toBeTruthy();
    expect(getByText(/28/)).toBeTruthy();
    if (!(pingStat instanceof HTMLElement)) {
      throw new Error("Ping stat was not rendered");
    }
    expect(within(pingStat).getByText(/8/)).toBeTruthy();
    expect(getAllByText("Mbps")).toHaveLength(2);
    expect(getByText("ms")).toBeTruthy();
  });
});

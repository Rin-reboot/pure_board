import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HistoryChart } from "./HistoryChart";

afterEach(cleanup);

describe("HistoryChart", () => {
  it("renders grid lines, area, and line points from data", () => {
    const { container } = render(
      <HistoryChart
        data={[0, 50, 100]}
        color="red"
        label="CPU history"
        width={100}
        height={50}
      />,
    );
    const lines = container.querySelectorAll("line");
    const polylines = container.querySelectorAll("polyline");

    expect(lines).toHaveLength(3);
    expect(polylines).toHaveLength(2);
    expect(polylines[0]?.getAttribute("points")).toBe(
      "0,50 0,50 50,25 100,0 100,50",
    );
    expect(polylines[1]?.getAttribute("points")).toBe("0,50 50,25 100,0");
  });

  it("clamps values into a percentage range", () => {
    const { container } = render(
      <HistoryChart
        data={[-10, 120]}
        color="blue"
        label="RAM history"
        width={100}
        height={50}
      />,
    );
    const polylines = container.querySelectorAll("polyline");

    expect(polylines[1]?.getAttribute("points")).toBe("0,50 100,0");
  });
});

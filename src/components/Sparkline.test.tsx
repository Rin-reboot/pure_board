import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Sparkline } from "./Sparkline";

afterEach(cleanup);

describe("Sparkline", () => {
  it("renders line and area points from data", () => {
    const { container } = render(
      <Sparkline data={[0, 50, 100]} color="red" width={100} height={50} />,
    );
    const polylines = container.querySelectorAll("polyline");

    expect(polylines).toHaveLength(2);
    expect(polylines[0]?.getAttribute("points")).toBe(
      "0,50 0,50 50,25 100,0 100,50",
    );
    expect(polylines[1]?.getAttribute("points")).toBe("0,50 50,25 100,0");
  });

  it("uses the provided dimensions", () => {
    const { container } = render(
      <Sparkline data={[10, 20]} color="blue" width={120} height={40} />,
    );
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("width")).toBe("120");
    expect(svg?.getAttribute("height")).toBe("40");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 120 40");
  });
});

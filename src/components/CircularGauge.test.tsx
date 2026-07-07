import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CircularGauge } from "./CircularGauge";

afterEach(cleanup);

describe("CircularGauge", () => {
  it("renders the label and value", () => {
    const { getByText } = render(
      <CircularGauge percent={42} color="red" label="CPU" valueLabel="42%" />,
    );

    expect(getByText("CPU")).toBeTruthy();
    expect(getByText("42%")).toBeTruthy();
  });

  it("clamps values below zero", () => {
    const { container } = render(
      <CircularGauge percent={-20} color="red" label="CPU" valueLabel="0%" />,
    );
    const ring = container.querySelector(".gauge-ring");

    expect(ring?.getAttribute("stroke-dashoffset")).toBe(
      ring?.getAttribute("stroke-dasharray"),
    );
  });

  it("clamps values above one hundred", () => {
    const { container } = render(
      <CircularGauge percent={140} color="red" label="CPU" valueLabel="100%" />,
    );
    const ring = container.querySelector(".gauge-ring");

    expect(ring?.getAttribute("stroke-dashoffset")).toBe("0");
  });

  it("uses the provided dimensions", () => {
    const { container } = render(
      <CircularGauge
        percent={50}
        color="red"
        size={80}
        strokeWidth={4}
        label="CPU"
        valueLabel="50%"
      />,
    );
    const wrapper = container.querySelector(".gauge") as HTMLElement | null;
    const svg = container.querySelector("svg");
    const ring = container.querySelector(".gauge-ring");

    expect(wrapper?.style.width).toBe("80px");
    expect(wrapper?.style.height).toBe("80px");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 80 80");
    expect(ring?.getAttribute("stroke-width")).toBe("4");
  });
});

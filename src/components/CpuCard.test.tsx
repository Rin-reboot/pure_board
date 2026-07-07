import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CpuCard } from "./CpuCard";

afterEach(cleanup);

describe("CpuCard", () => {
  it("renders rounded CPU usage, processor name, and history chart", () => {
    const { container, getByText } = render(
      <CpuCard usage={42.6} processorName="Test CPU" history={[10, 20, 30]} />,
    );

    expect(getByText("43%")).toBeTruthy();
    expect(getByText("Test CPU")).toBeTruthy();
    expect(container.querySelector(".sparkline")).toBeTruthy();
  });
});

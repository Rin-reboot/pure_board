import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CpuCard } from "./CpuCard";

afterEach(cleanup);

describe("CpuCard", () => {
  it("renders rounded CPU usage, processor name, and history chart", () => {
    const { container, getByText } = render(
      <CpuCard
        usage={42.6}
        processorName="Test CPU"
        history={[10, 20, 30]}
        topProcesses={[]}
      />,
    );

    expect(getByText("43%")).toBeTruthy();
    expect(getByText("Test CPU")).toBeTruthy();
    expect(container.querySelector(".sparkline")).toBeTruthy();
  });

  it("shows top CPU processes when expanded", () => {
    const { getByLabelText, getByText, queryByText } = render(
      <CpuCard
        usage={42.6}
        processorName="Test CPU"
        history={[10, 20, 30]}
        topProcesses={[
          {
            pid: "100",
            name: "renderer.exe",
            cpu_usage: 21.4,
            memory_bytes: 1024,
          },
        ]}
      />,
    );

    expect(queryByText("renderer.exe")).toBeNull();

    fireEvent.click(getByLabelText("Toggle top CPU processes"));

    expect(getByText("renderer.exe")).toBeTruthy();
    expect(getByText("21%")).toBeTruthy();
  });
});

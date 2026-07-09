import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RamCard } from "./RamCard";

afterEach(cleanup);

describe("RamCard", () => {
  it("renders RAM usage as GB and percent", () => {
    const gib = 1024 ** 3;
    const { container, getByText } = render(
      <RamCard usedBytes={8 * gib} totalBytes={16 * gib} topProcesses={[]} />,
    );

    expect(getByText("50%")).toBeTruthy();
    expect(getByText("8.0")).toBeTruthy();
    expect(getByText(/GB \/ 16\.0 GB/)).toBeTruthy();
    expect(container.querySelector(".bar-fill")?.getAttribute("style")).toBe(
      "width: 50%;",
    );
  });

  it("handles zero total memory without dividing by zero", () => {
    const { container, getByText } = render(
      <RamCard usedBytes={1024 ** 3} totalBytes={0} topProcesses={[]} />,
    );

    expect(getByText("0%")).toBeTruthy();
    expect(container.querySelector(".bar-fill")?.getAttribute("style")).toBe(
      "width: 0%;",
    );
  });

  it("does not render negative free memory", () => {
    const gib = 1024 ** 3;
    const { getByText } = render(
      <RamCard usedBytes={20 * gib} totalBytes={16 * gib} topProcesses={[]} />,
    );

    expect(getByText("空き 0.0 GB")).toBeTruthy();
  });

  it("shows top memory processes when expanded", () => {
    const gib = 1024 ** 3;
    const { getByLabelText, getByText, queryByText } = render(
      <RamCard
        usedBytes={8 * gib}
        totalBytes={16 * gib}
        topProcesses={[
          {
            pid: "200",
            name: "editor.exe",
            cpu_usage: 2.1,
            memory_bytes: 1.5 * gib,
          },
        ]}
      />,
    );

    expect(queryByText("editor.exe")).toBeNull();

    fireEvent.click(getByLabelText("Toggle top RAM processes"));

    expect(getByText("editor.exe")).toBeTruthy();
    expect(getByText("1.5 GB")).toBeTruthy();
  });
});

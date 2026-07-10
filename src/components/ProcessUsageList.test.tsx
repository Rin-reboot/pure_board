import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProcessUsageList } from "./ProcessUsageList";

afterEach(cleanup);

describe("ProcessUsageList", () => {
  it("renders an empty state when no process data is available", () => {
    const { getByText, queryByRole } = render(
      <ProcessUsageList processes={[]} metric="cpu" />,
    );

    expect(getByText("No process data")).toBeTruthy();
    expect(queryByRole("list")).toBeNull();
  });

  it("renders process names and rounded CPU usage", () => {
    const { getByRole } = render(
      <ProcessUsageList
        metric="cpu"
        processes={[
          {
            pid: "100",
            name: "renderer.exe",
            cpu_usage: 21.6,
            memory_bytes: 1024,
          },
          {
            pid: "200",
            name: "editor.exe",
            cpu_usage: 4.2,
            memory_bytes: 2048,
          },
        ]}
      />,
    );
    const list = getByRole("list", { name: "Top cpu processes" });

    expect(within(list).getByText("renderer.exe")).toBeTruthy();
    expect(within(list).getByText("22%")).toBeTruthy();
    expect(within(list).getByText("editor.exe")).toBeTruthy();
    expect(within(list).getByText("4%")).toBeTruthy();
  });

  it("formats memory usage in gigabytes and megabytes", () => {
    const gib = 1024 ** 3;
    const mib = 1024 ** 2;
    const { getByRole } = render(
      <ProcessUsageList
        metric="memory"
        processes={[
          {
            pid: "100",
            name: "large.exe",
            cpu_usage: 0,
            memory_bytes: 1.5 * gib,
          },
          {
            pid: "200",
            name: "small.exe",
            cpu_usage: 0,
            memory_bytes: 512.4 * mib,
          },
        ]}
      />,
    );
    const list = getByRole("list", { name: "Top memory processes" });

    expect(within(list).getByText("1.5 GB")).toBeTruthy();
    expect(within(list).getByText("512 MB")).toBeTruthy();
  });
});

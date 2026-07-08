import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SystemHistoryView } from "./SystemHistoryView";

afterEach(cleanup);

describe("SystemHistoryView", () => {
  it("renders CPU and RAM history summaries", () => {
    const { getAllByText, getByText } = render(
      <SystemHistoryView
        cpuHistory={[10, 20, 30]}
        ramHistory={[40, 50, 60]}
        updateIntervalMs={1000}
      />,
    );

    expect(getByText("CPU / RAM History")).toBeTruthy();
    expect(getByText("Last 3s")).toBeTruthy();
    expect(getByText("CPU")).toBeTruthy();
    expect(getByText("RAM")).toBeTruthy();
    expect(getAllByText("30%")).toHaveLength(2);
    expect(getAllByText("60%")).toHaveLength(2);
  });
});

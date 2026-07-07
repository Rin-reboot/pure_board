import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RamCard } from "./RamCard";

afterEach(cleanup);

describe("RamCard", () => {
  it("renders RAM usage as GB and percent", () => {
    const gib = 1024 ** 3;
    const { container, getByText } = render(
      <RamCard usedBytes={8 * gib} totalBytes={16 * gib} />,
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
      <RamCard usedBytes={1024 ** 3} totalBytes={0} />,
    );

    expect(getByText("0%")).toBeTruthy();
    expect(container.querySelector(".bar-fill")?.getAttribute("style")).toBe(
      "width: 0%;",
    );
  });

  it("does not render negative free memory", () => {
    const gib = 1024 ** 3;
    const { getByText } = render(
      <RamCard usedBytes={20 * gib} totalBytes={16 * gib} />,
    );

    expect(getByText("空き 0.0 GB")).toBeTruthy();
  });
});

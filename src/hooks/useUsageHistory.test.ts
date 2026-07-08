import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useUsageHistory } from "./useUsageHistory";

describe("useUsageHistory", () => {
  it("starts with the requested number of zero values", () => {
    const { result } = renderHook(() =>
      useUsageHistory(undefined, { length: 3 }),
    );

    expect(result.current).toEqual([0, 0, 0]);
  });

  it("appends new values while keeping the history length", () => {
    const { rerender, result } = renderHook(
      ({ value }: { value: number | undefined }) =>
        useUsageHistory(value, { length: 3 }),
      { initialProps: { value: undefined as number | undefined } },
    );

    rerender({ value: 25 });
    rerender({ value: 50 });

    expect(result.current).toEqual([0, 25, 50]);
  });

  it("ignores repeated values and undefined values", () => {
    const { rerender, result } = renderHook(
      ({ value }: { value: number | undefined }) =>
        useUsageHistory(value, { length: 3 }),
      { initialProps: { value: 10 as number | undefined } },
    );
    const afterFirstValue = result.current;

    rerender({ value: 10 });
    expect(result.current).toBe(afterFirstValue);

    rerender({ value: undefined });
    expect(result.current).toBe(afterFirstValue);
  });
});

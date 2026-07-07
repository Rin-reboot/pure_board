import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCpuHistory } from "./useCpuHistory";

describe("useCpuHistory", () => {
  it("starts with forty zero values", () => {
    const { result } = renderHook(() => useCpuHistory(undefined));

    expect(result.current).toEqual(Array(40).fill(0));
  });

  it("appends new values while keeping the history length", () => {
    const { rerender, result } = renderHook(
      ({ value }: { value: number | undefined }) => useCpuHistory(value),
      { initialProps: { value: undefined as number | undefined } },
    );

    rerender({ value: 25 });

    expect(result.current).toHaveLength(40);
    expect(result.current[result.current.length - 1]).toBe(25);
  });

  it("ignores repeated values and undefined values", () => {
    const { rerender, result } = renderHook(
      ({ value }: { value: number | undefined }) => useCpuHistory(value),
      { initialProps: { value: 10 as number | undefined } },
    );
    const afterFirstValue = result.current;

    rerender({ value: 10 });
    expect(result.current).toBe(afterFirstValue);

    rerender({ value: undefined });
    expect(result.current).toBe(afterFirstValue);
  });
});

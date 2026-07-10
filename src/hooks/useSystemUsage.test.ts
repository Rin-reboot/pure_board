import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSystemUsage } from "./useSystemUsage";

const tauriMocks = vi.hoisted(() => ({
  invoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: tauriMocks.invoke,
}));

afterEach(() => {
  vi.useRealTimers();
  tauriMocks.invoke.mockReset();
});

describe("useSystemUsage", () => {
  it("fetches usage on mount", async () => {
    const usage = {
      cpu_usage: 33,
      cpu_name: "Test CPU",
      mem_used: 10,
      mem_total: 20,
    };
    tauriMocks.invoke.mockResolvedValue(usage);

    const { result } = renderHook(() => useSystemUsage());

    await waitFor(() => expect(result.current).toEqual(usage));
    expect(tauriMocks.invoke).toHaveBeenCalledWith("get_system_usage");
  });

  it("polls at the provided interval", async () => {
    vi.useFakeTimers();
    tauriMocks.invoke.mockResolvedValue({
      cpu_usage: 33,
      cpu_name: "Test CPU",
      mem_used: 10,
      mem_total: 20,
    });

    renderHook(() => useSystemUsage(500));
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(tauriMocks.invoke).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(tauriMocks.invoke).toHaveBeenCalledTimes(3);
  });

  it("stops polling after unmount", async () => {
    vi.useFakeTimers();
    tauriMocks.invoke.mockResolvedValue({
      cpu_usage: 33,
      cpu_name: "Test CPU",
      mem_used: 10,
      mem_total: 20,
    });

    const { unmount } = renderHook(() => useSystemUsage(500));

    expect(tauriMocks.invoke).toHaveBeenCalledTimes(1);
    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(tauriMocks.invoke).toHaveBeenCalledTimes(1);
  });
});

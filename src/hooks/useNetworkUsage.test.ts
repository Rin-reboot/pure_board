import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNetworkUsage } from "./useNetworkUsage";

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

describe("useNetworkUsage", () => {
  it("fetches network usage on mount", async () => {
    const usage = {
      download_mbps: 12.4,
      upload_mbps: 2.8,
    };
    tauriMocks.invoke.mockResolvedValue(usage);

    const { result } = renderHook(() => useNetworkUsage());

    await waitFor(() => expect(result.current).toEqual(usage));
    expect(tauriMocks.invoke).toHaveBeenCalledWith("get_network_usage");
  });

  it("polls at the provided interval", async () => {
    vi.useFakeTimers();
    tauriMocks.invoke.mockResolvedValue({
      download_mbps: 12.4,
      upload_mbps: 2.8,
    });

    renderHook(() => useNetworkUsage(500));
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(tauriMocks.invoke).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(tauriMocks.invoke).toHaveBeenCalledTimes(3);
  });

  it("does not update after unmount", async () => {
    let resolveUsage: (value: {
      download_mbps: number;
      upload_mbps: number;
    }) => void = () => {};
    tauriMocks.invoke.mockReturnValue(
      new Promise((resolve) => {
        resolveUsage = resolve;
      }),
    );

    const { result, unmount } = renderHook(() => useNetworkUsage());

    unmount();
    resolveUsage({
      download_mbps: 12.4,
      upload_mbps: 2.8,
    });

    await waitFor(() => expect(result.current).toBeNull());
  });
});

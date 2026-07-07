import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SystemUsage } from "./SystemUsage";

const tauriMocks = vi.hoisted(() => ({
  invoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: tauriMocks.invoke,
}));

afterEach(() => {
  vi.useRealTimers();
  tauriMocks.invoke.mockReset();
  cleanup();
});

describe("SystemUsage", () => {
  it("loads and renders system usage", async () => {
    tauriMocks.invoke.mockResolvedValue({
      cpu_usage: 42,
      mem_used: 8 * 1024 ** 3,
      mem_total: 16 * 1024 ** 3,
    });

    const { getByText } = render(<SystemUsage />);

    expect(getByText("読み込み中...")).toBeTruthy();

    await waitFor(() => expect(getByText("42%")).toBeTruthy());
    expect(getByText("8.0 / 16.0 GB")).toBeTruthy();
  });

  it("polls every 1.5 seconds", async () => {
    vi.useFakeTimers();
    tauriMocks.invoke.mockResolvedValue({
      cpu_usage: 10,
      mem_used: 1,
      mem_total: 2,
    });

    render(<SystemUsage />);
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(tauriMocks.invoke).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(tauriMocks.invoke).toHaveBeenCalledTimes(3);
  });

  it("logs failures without throwing", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    tauriMocks.invoke.mockRejectedValue(new Error("failed"));

    render(<SystemUsage />);

    await waitFor(() => expect(consoleError).toHaveBeenCalledTimes(1));

    consoleError.mockRestore();
  });
});

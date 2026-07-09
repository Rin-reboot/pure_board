import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAutoStart } from "./useAutoStart";

const mocks = vi.hoisted(() => ({
  disable: vi.fn(),
  enable: vi.fn(),
  isEnabled: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-autostart", () => ({
  disable: mocks.disable,
  enable: mocks.enable,
  isEnabled: mocks.isEnabled,
}));

afterEach(() => {
  mocks.disable.mockReset();
  mocks.enable.mockReset();
  mocks.isEnabled.mockReset();
});

describe("useAutoStart", () => {
  it("loads the current auto-start state from the operating system", async () => {
    mocks.isEnabled.mockResolvedValue(true);

    const { result } = renderHook(() => useAutoStart());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.isAutoStartEnabled).toBe(true);
  });

  it("enables auto-start when toggled on", async () => {
    mocks.isEnabled.mockResolvedValue(false);
    mocks.enable.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAutoStart());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.toggleAutoStart();
    });

    expect(result.current.isAutoStartEnabled).toBe(true);
    expect(mocks.enable).toHaveBeenCalledTimes(1);
    expect(mocks.disable).not.toHaveBeenCalled();
  });

  it("disables auto-start when toggled off", async () => {
    mocks.isEnabled.mockResolvedValue(true);
    mocks.disable.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAutoStart());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.toggleAutoStart();
    });

    expect(result.current.isAutoStartEnabled).toBe(false);
    expect(mocks.disable).toHaveBeenCalledTimes(1);
    expect(mocks.enable).not.toHaveBeenCalled();
  });

  it("rolls back the auto-start state when toggling fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mocks.isEnabled.mockResolvedValue(false);
    mocks.enable.mockRejectedValue(new Error("failed"));

    const { result } = renderHook(() => useAutoStart());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      await result.current.toggleAutoStart();
    });

    expect(result.current.isAutoStartEnabled).toBe(false);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});

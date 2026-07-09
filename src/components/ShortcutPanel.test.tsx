import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShortcutPanel } from "./ShortcutPanel";

const tauriMocks = vi.hoisted(() => ({
  invoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: tauriMocks.invoke,
}));

afterEach(() => {
  cleanup();
  tauriMocks.invoke.mockReset();
});

describe("ShortcutPanel", () => {
  it("renders an empty state when no shortcuts are configured", () => {
    const { getByText } = render(
      <ShortcutPanel shortcuts={[]} isLoaded={true} />,
    );

    expect(getByText("Settings からショートカットを追加")).toBeTruthy();
  });

  it("runs a shortcut action when clicked", async () => {
    tauriMocks.invoke.mockResolvedValue(undefined);
    const { getByText } = render(
      <ShortcutPanel
        isLoaded={true}
        shortcuts={[
          {
            id: "shortcut-1",
            label: "Docs",
            actionType: "url",
            target: "https://example.com",
            icon: "globe",
          },
        ]}
      />,
    );

    fireEvent.click(getByText("Docs"));

    await waitFor(() =>
      expect(tauriMocks.invoke).toHaveBeenCalledWith("run_shortcut_action", {
        action: {
          action_type: "url",
          target: "https://example.com",
        },
      }),
    );
  });

  it("shows a failure state when execution fails", async () => {
    tauriMocks.invoke.mockRejectedValue("Could not open target");
    const { getByText } = render(
      <ShortcutPanel
        isLoaded={true}
        shortcuts={[
          {
            id: "shortcut-1",
            label: "Docs",
            actionType: "url",
            target: "https://example.com",
            icon: "globe",
          },
        ]}
      />,
    );

    fireEvent.click(getByText("Docs"));

    await waitFor(() => expect(getByText("失敗")).toBeTruthy());
  });
});

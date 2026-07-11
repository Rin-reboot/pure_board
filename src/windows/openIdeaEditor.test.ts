import { beforeEach, describe, expect, it, vi } from "vitest";
import { openIdeaEditor } from "./openIdeaEditor";

const tauriMocks = vi.hoisted(() => ({
  emitTo: vi.fn(),
  getByLabel: vi.fn(),
  constructor: vi.fn(),
}));

vi.mock("@tauri-apps/api/event", () => ({
  emitTo: tauriMocks.emitTo,
}));

vi.mock("@tauri-apps/api/webviewWindow", () => ({
  WebviewWindow: class {
    static getByLabel = tauriMocks.getByLabel;

    once = vi.fn((eventName: string, handler: () => void) => {
      if (eventName === "tauri://created") handler();
      return Promise.resolve(vi.fn());
    });

    constructor(label: string, options: unknown) {
      tauriMocks.constructor(label, options);
    }
  },
}));

beforeEach(() => {
  tauriMocks.emitTo.mockReset();
  tauriMocks.getByLabel.mockReset();
  tauriMocks.constructor.mockReset();
});

describe("openIdeaEditor", () => {
  it("creates the editor window for a selected idea", async () => {
    tauriMocks.getByLabel.mockResolvedValue(null);

    await openIdeaEditor("idea-1");

    expect(tauriMocks.constructor).toHaveBeenCalledWith(
      "idea-editor",
      expect.objectContaining({
        url: "index.html?view=idea-editor&ideaId=idea-1",
        title: "Idea Editor",
        width: 760,
        height: 620,
      }),
    );
  });

  it("reuses and focuses the existing editor window", async () => {
    const existing = {
      unminimize: vi.fn().mockResolvedValue(undefined),
      show: vi.fn().mockResolvedValue(undefined),
      setFocus: vi.fn().mockResolvedValue(undefined),
    };
    tauriMocks.getByLabel.mockResolvedValue(existing);
    tauriMocks.emitTo.mockResolvedValue(undefined);

    await openIdeaEditor("idea-2");

    expect(existing.unminimize).toHaveBeenCalled();
    expect(existing.show).toHaveBeenCalled();
    expect(existing.setFocus).toHaveBeenCalled();
    expect(tauriMocks.emitTo).toHaveBeenCalledWith("idea-editor", "idea:open", {
      ideaId: "idea-2",
    });
    expect(tauriMocks.constructor).not.toHaveBeenCalled();
  });
});

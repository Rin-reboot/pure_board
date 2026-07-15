import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  exportIdeaAsMarkdown,
  getIdeaExportFilename,
} from "./exportIdeaAsMarkdown";

const pluginMock = vi.hoisted(() => ({
  save: vi.fn(),
  writeTextFile: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({ save: pluginMock.save }));
vi.mock("@tauri-apps/plugin-fs", () => ({
  writeTextFile: pluginMock.writeTextFile,
}));

beforeEach(() => {
  pluginMock.save.mockReset();
  pluginMock.writeTextFile.mockReset();
});

describe("getIdeaExportFilename", () => {
  it("uses the trimmed idea title and replaces spaces with underscores", () => {
    expect(getIdeaExportFilename("  新しい アイデア  ")).toBe(
      "新しい_アイデア.md",
    );
    expect(getIdeaExportFilename("Windows  Linux\t対応")).toBe(
      "Windows_Linux_対応.md",
    );
  });

  it("falls back when the title is empty", () => {
    expect(getIdeaExportFilename("   ")).toBe("idea.md");
  });

  it("replaces invalid filename characters", () => {
    expect(getIdeaExportFilename("仕様: Windows / Linux?*")).toBe(
      "仕様-_Windows_-_Linux--.md",
    );
  });

  it("avoids Windows reserved filenames and trailing dots", () => {
    expect(getIdeaExportFilename("CON")).toBe("_CON.md");
    expect(getIdeaExportFilename("CON.txt")).toBe("_CON.txt.md");
    expect(getIdeaExportFilename("release... ")).toBe("release.md");
  });
});

describe("exportIdeaAsMarkdown", () => {
  it("writes the unchanged body to the selected path", async () => {
    pluginMock.save.mockResolvedValue("C:\\notes\\設計.md");
    pluginMock.writeTextFile.mockResolvedValue(undefined);

    await expect(exportIdeaAsMarkdown("設計", "# 概要\n\n本文")).resolves.toBe(
      "saved",
    );

    expect(pluginMock.save).toHaveBeenCalledWith({
      defaultPath: "設計.md",
      filters: [{ name: "Markdown", extensions: ["md"] }],
      title: "Markdownファイルに保存",
    });
    expect(pluginMock.writeTextFile).toHaveBeenCalledWith(
      "C:\\notes\\設計.md",
      "# 概要\n\n本文",
    );
  });

  it("does not write when the dialog is cancelled", async () => {
    pluginMock.save.mockResolvedValue(null);

    await expect(exportIdeaAsMarkdown("設計", "本文")).resolves.toBe(
      "cancelled",
    );
    expect(pluginMock.writeTextFile).not.toHaveBeenCalled();
  });
});

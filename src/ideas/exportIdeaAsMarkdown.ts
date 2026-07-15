import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

const DEFAULT_EXPORT_FILENAME = "idea";
const MAX_EXPORT_FILENAME_LENGTH = 120;
const INVALID_EXPORT_FILENAME_CHARACTERS = new Set('<>:"/\\|?*');
const WINDOWS_RESERVED_FILENAME =
  /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

export type IdeaExportResult = "saved" | "cancelled";

export function getIdeaExportFilename(title: string): string {
  const sanitized = title
    .trim()
    .replace(/\s+/g, "_")
    .split("")
    .map((character) =>
      character.charCodeAt(0) < 32 ||
      INVALID_EXPORT_FILENAME_CHARACTERS.has(character)
        ? "-"
        : character,
    )
    .join("")
    .slice(0, MAX_EXPORT_FILENAME_LENGTH)
    .replace(/[. ]+$/g, "");
  const filename =
    sanitized && !WINDOWS_RESERVED_FILENAME.test(sanitized)
      ? sanitized
      : sanitized
        ? `_${sanitized}`
        : DEFAULT_EXPORT_FILENAME;

  return `${filename}.md`;
}

export async function exportIdeaAsMarkdown(
  title: string,
  body: string,
): Promise<IdeaExportResult> {
  const path = await save({
    defaultPath: getIdeaExportFilename(title),
    filters: [{ name: "Markdown", extensions: ["md"] }],
    title: "Markdownファイルに保存",
  });

  if (!path) return "cancelled";

  await writeTextFile(path, body);
  return "saved";
}

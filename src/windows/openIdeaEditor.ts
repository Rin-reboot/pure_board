import { emitTo } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  IDEA_EDITOR_LABEL,
  IDEA_OPEN_EVENT,
  type IdeaOpenPayload,
} from "../ideas/events";

function getEditorUrl(ideaId?: string): string {
  const params = new URLSearchParams({ view: "idea-editor" });
  if (ideaId) params.set("ideaId", ideaId);
  return `index.html?${params.toString()}`;
}

export async function openIdeaEditor(ideaId?: string): Promise<void> {
  const existing = await WebviewWindow.getByLabel(IDEA_EDITOR_LABEL);

  if (existing) {
    await existing.unminimize();
    await existing.show();
    await existing.setFocus();
    await emitTo<IdeaOpenPayload>(IDEA_EDITOR_LABEL, IDEA_OPEN_EVENT, {
      ideaId: ideaId ?? null,
    });
    return;
  }

  const editor = new WebviewWindow(IDEA_EDITOR_LABEL, {
    url: getEditorUrl(ideaId),
    title: "Idea Editor",
    width: 760,
    height: 620,
    minWidth: 520,
    minHeight: 420,
    center: true,
    decorations: true,
    transparent: false,
    shadow: true,
    resizable: true,
    focus: true,
  });

  await new Promise<void>((resolve, reject) => {
    void editor.once("tauri://created", () => resolve());
    void editor.once<string>("tauri://error", (event) =>
      reject(new Error(event.payload)),
    );
  });
}

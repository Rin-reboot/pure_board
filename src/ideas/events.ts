export const IDEA_EDITOR_LABEL = "idea-editor";
export const IDEA_OPEN_EVENT = "idea:open";
export const IDEA_CHANGED_EVENT = "idea:changed";

export interface IdeaOpenPayload {
  ideaId: string | null;
}

export interface IdeaChangedPayload {
  ideaId: string;
}

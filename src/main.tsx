import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const IdeaEditorApp = lazy(() =>
  import("./components/IdeaEditorApp").then((module) => ({
    default: module.IdeaEditorApp,
  })),
);

const view = new URLSearchParams(window.location.search).get("view");
const rootApp =
  view === "idea-editor" ? (
    <Suspense fallback={null}>
      <IdeaEditorApp />
    </Suspense>
  ) : (
    <App />
  );

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>{rootApp}</React.StrictMode>,
);

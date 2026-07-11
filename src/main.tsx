import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { IdeaEditorApp } from "./components/IdeaEditorApp";

const view = new URLSearchParams(window.location.search).get("view");
const RootApp = view === "idea-editor" ? IdeaEditorApp : App;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
);

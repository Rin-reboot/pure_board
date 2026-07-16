# Architecture

This document describes the current architecture of **pure_board** and where new functionality should be implemented.

Implementation rules and coding conventions are documented separately in `development.md`.

---

# High-Level Overview

pure_board is a Tauri 2 desktop application built with React 19, TypeScript, and Rust.

The application uses two integration paths between the frontend and the desktop environment:

```text
React components
    |
    +-- React hooks and focused helpers
    |       |
    |       +-- invoke() --------> Rust commands --------> OS / sysinfo
    |       |
    |       +-- Tauri APIs ------> windows and events
    |       |
    |       +-- Tauri plugins ---> store / autostart / dialog / filesystem
    |
    +-- rendered UI
```

Rust commands own system information collection and focused operating-system actions. Tauri APIs and plugins provide local persistence, window management, cross-window events, automatic startup, native save dialogs, and scoped filesystem access.

Not every feature needs a Rust command. Prefer the narrowest existing Tauri API or plugin that satisfies the requirement.

---

# Directory Structure

```text
src/
├── components/          Visible React UI
├── help/                Markdown help content and topic registry
├── hooks/               Polling, persistence, and reusable state
├── ideas/               Idea events and Markdown file saving
├── windows/             Secondary window creation and reuse
├── App.tsx              Main dashboard composition
├── App.css              Shared application styling
└── main.tsx             Frontend entry point and window-role selection

src-tauri/
├── capabilities/
│   ├── default.json     Main-window permissions
│   └── idea-editor.json Idea Editor permissions
├── src/
│   ├── lib.rs           Commands, tray setup, and Tauri plugins
│   ├── main.rs          Desktop executable entry point
│   └── tray_status.rs   Tray mini-graph worker and renderer
├── Cargo.toml
└── tauri.conf.json

packaging/
└── arch/                Arch Linux package definition
```

Each directory should keep a focused responsibility. Do not introduce parallel structures for features that fit an existing layer.

---

# Frontend Composition

`src/main.tsx` selects the React tree from the `view` query parameter:

- the default view renders the main dashboard `App`
- `view=idea-editor` lazily loads and renders `IdeaEditorApp`

Lazy loading keeps CodeMirror and the editor-specific bundle out of the main-window startup path.

`App` composes the dashboard and its alternate views:

- CPU, RAM, Network, TODO, and Ideas widgets
- Settings panel
- Shortcuts view
- CPU / RAM history view
- Markdown-powered Help view
- widget edit mode
- close-action dialog
- skippable first-run tutorial

React state controls transient UI state. Reusable polling and persistence behavior belongs in hooks.

---

# Component Layer

Components represent visible UI and user interaction.

Examples include:

- `TitleBar`
- `CpuCard` and `RamCard`
- `NetworkStats`
- `TodoPanel` and `TodoListView`
- `IdeaPanel` and `IdeaEditorApp`
- `MarkdownEditor`
- `SettingsPanel`
- `ShortcutPanel`
- `HelpPanel`
- `SystemHistoryView`
- `WidgetFrame`

Components should consume hooks for reusable behavior. Focused, view-specific orchestration may remain in a component when extracting it would not improve reuse or clarity. Current examples include Ping and close actions in `App`, shortcut invocation in `ShortcutPanel`, and window lifecycle handling in `IdeaEditorApp`.

---

# Hook Layer

Hooks encapsulate reusable application logic:

- `useSystemUsage` and `useNetworkUsage` poll Rust commands
- `useUsageHistory` retains bounded frontend history
- `usePersistedTodos` and `usePersistedIdeas` manage stored productivity data
- settings hooks manage theme, always-on-top, update interval, Ping target, close behavior, shortcuts, widget layout, and tray status
- `useAutoStart` wraps the Tauri autostart plugin
- `useFirstRunTutorial` manages persisted tutorial completion
- `useTrayStatusSettings` persists mini-graph settings and synchronizes them with Rust

Widgets should not implement their own polling or duplicate persistence logic.

---

# Rust Commands

The frontend invokes focused commands registered in `src-tauri/src/lib.rs`:

- `get_system_usage`: CPU, memory, processor name, and top process usage
- `get_network_usage`: received and transmitted byte deltas converted to Mbps
- `measure_ping`: one user-triggered OS Ping measurement
- `show_main_window`: show and focus the main window
- `hide_main_window`: hide the main window while the app remains active
- `quit_app`: terminate the application
- `run_shortcut_action`: validate and open a URL, file, folder, or application
- `configure_tray_status`: validate and apply tray mini-graph visibility, metric, interval, and reduced-motion state

Commands should perform one task, validate untrusted frontend input, and return predictable errors. Platform-specific command construction belongs in localized Rust functions.

---

# Tauri APIs and Plugins

The application also communicates with Tauri without custom Rust commands.

## Core APIs

- Window APIs manage always-on-top and Idea Editor close handling.
- WebviewWindow APIs create, reuse, show, and focus the secondary editor window.
- Event APIs send focused `idea:open` and `idea:changed` messages between windows.

## Plugins

- `tauri-plugin-store` persists TODOs, ideas, and settings locally.
- `tauri-plugin-autostart` manages launch-at-login state.
- `tauri-plugin-dialog` opens the native Markdown save dialog.
- `tauri-plugin-fs` writes the selected Markdown file.

Prefer these existing integrations before adding dependencies or broader custom commands.

---

# Capabilities and Security

Tauri permissions are separated by window role.

`default.json` grants the main window the core window, webview-window creation, autostart, and store permissions required by the dashboard.

`idea-editor.json` grants the editor:

- window destruction
- native save-dialog access
- text-file writing
- store access

Store enumeration, reset, clear, and delete operations are explicitly denied in both capabilities. Add only the minimum permission needed by a feature and keep secondary-window permissions scoped to that window.

Changes to capabilities require a full Tauri application restart; frontend hot reload does not reload them.

---

# State and Persistence

The application uses React state and hooks rather than a separate global state library. State should remain as local as practical.

Persistent data uses `tauri-plugin-store`:

- `settings.json`: theme, always-on-top, update interval, Ping target, close preference, shortcuts, widget layout, tray status, and first-run tutorial completion
- `todos.json`: TODO text, completion state, and tag
- `ideas.json`: idea title, Markdown body, and timestamps

`usePersistedTodos` retains compatibility with the legacy `memos.json` store and normalizes stored data before use. Persistence format changes should preserve existing user data whenever practical.

Saving the current idea to a user-selected `.md` file is deliberately separate from application persistence. It writes the current editor body, including unsaved changes, without changing the stored idea or its timestamps.

---

# System Information and Polling

Rust owns system information retrieval through `sysinfo` and the OS:

- CPU usage and processor name
- memory totals and usage
- top CPU and memory-consuming processes
- network received and transmitted byte deltas
- one-shot Ping latency

`useSystemUsage` and `useNetworkUsage` poll at the persisted update interval, with a 100 ms minimum. Network throughput is current device activity, not link speed or an internet speed test.

CPU and RAM history is stored only in bounded frontend memory. Rendering remains separate from collection, and alternate views reuse the same polling flow.

---

# Tray Status Worker

`src-tauri/src/tray_status.rs` owns a background worker that remains active while the main window is hidden. It samples CPU, RAM, and network data independently of the React polling flow and renders a 32 px history graph into the tray icon.

The frontend persists whether the graph is enabled, the selected metric, and a 1 to 60 second interval. `configure_tray_status` applies those values and the current reduced-motion preference to the Rust controller.

The worker updates tooltip and menu text even when graph animation is static. It detects battery power through the Windows power API or Linux power-supply state and resumes graph rendering when the static condition ends.

---

# Ideas and Window Communication

The main window lists ideas from the shared store. `src/windows/openIdeaEditor.ts` creates the `idea-editor` window or reuses the existing instance.

When a different idea is opened in an existing editor, the main window sends an `idea:open` event. After the editor saves or deletes an idea, it sends `idea:changed` to the main window, which reloads its list.

Idea Editor behavior includes:

- Markdown syntax highlighting through CodeMirror
- bounded title and body input
- autosave after 700 ms of inactivity
- explicit save through `Ctrl+S` or the Save button
- title and body undo / redo histories
- save-before-close handling
- deletion with confirmation
- native Markdown file saving through dialog and filesystem plugins

The editor destroys its secondary window after pending persistence completes to avoid re-entering the close-request event.

---

# Help Content

In-app help lives under `src/help/content` as Markdown. `helpTopics.ts` imports each file as raw text, assigns its category and title, and `HelpPanel` renders it with React Markdown. Settings can open Help directly on the taskbar-status topic.

Help content is user-facing documentation and must be updated when related behavior or supported-platform guidance changes.

The first-run tutorial is a separate persisted overlay rather than a Help topic. It introduces the primary dashboard, customization, tray status, and Help, and records completion when finished or skipped.

---

# Theme and Layout

Theme selection is application state persisted in `settings.json`. The initial theme uses the saved preference or the detected OS theme. Widgets consume the selected theme rather than deciding it independently.

Widget order and visibility are also persisted. The default layout contains CPU, RAM, Network, TODO, and Ideas. Legacy `memo` layout entries normalize to `todo`.

---

# Platform Separation

Platform-specific behavior remains localized in Rust where operating-system commands differ. Current examples are Ping arguments, shortcut launching, and tray-worker battery detection.

Do not scatter Windows, Linux, Wayland, or X11 conditions through unrelated frontend modules. Evaluate desktop behavior on the affected supported environment before adding a workaround.

---

# Extending the Application

When adding functionality:

1. Decide whether it is presentation, reusable frontend logic, Tauri integration, or OS-dependent behavior.
2. Reuse existing components, hooks, commands, plugins, and capabilities.
3. Use a Rust command for focused backend or OS logic that existing Tauri APIs do not provide.
4. Grant the minimum capability permissions to the required window only.
5. Keep persistence backward compatible.
6. Update developer documentation and in-app help when behavior changes.

New widgets that need backend data should normally follow `Rust command -> polling hook -> component`. Pure frontend features do not need an artificial backend layer.

---

# Design Goals

The architecture prioritizes:

- readability
- maintainability
- predictable data flow
- minimal dependencies and permissions
- local-first behavior
- clear platform boundaries

Large architectural changes should only be made when explicitly requested.

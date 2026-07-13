# Roadmap

This document describes planned, proposed, and out-of-scope functionality for **pure_board**.

Roadmap items are not active implementation tasks unless explicitly requested.

AI agents should not implement features from this document without a direct instruction.

---

# Project Direction

pure_board is a cross-platform desktop productivity dashboard inspired by the glass-style UI of Windows 11.

The project focuses on:

* lightweight system monitoring
* desktop-resident utility behavior
* Glassmorphism UI
* simple productivity widgets
* local-first user experience

The application should remain small, practical, and easy to maintain.

---

# Current Implemented Features

The following features are already implemented:

* transparent Glassmorphism-style window
* CPU usage circular gauge
* CPU usage waveform graph
* RAM usage circular gauge
* RAM usage display
* detailed CPU / RAM history view
* configurable system usage update interval with a 0.1s minimum
* actual processor name display
* TODO widget
* TODO add / complete / delete behavior
* TODO tag selection
* TODO list view
* TODO persistence
* Ideas widget and persistent idea storage
* separate Idea Editor window
* Markdown syntax highlighting and autosave
* settings panel
* dark mode / light mode toggle
* OS theme detection at startup
* manual theme preference persistence
* always-on-top toggle
* widget edit mode
* widget drag reordering
* widget visibility toggle
* shortcut button view
* close button

---

# Known Placeholder Values

The following values are currently placeholders:

None.

Network speed and Ping are retrieved by Rust commands. Ping uses the OS ping command and is measured only when the user presses the Ping button, avoiding periodic traffic to external services.

---

# Implemented Feature Notes

The sections below retain implementation details for completed roadmap items.
They are not active tasks.

## Settings Panel

Status: implemented

Purpose:

* provide a place for runtime preferences
* show the current system usage update interval
* allow users to enter custom update intervals with a 0.1s minimum
* preserve selected settings

Possible future extension:

* graph history length

Implementation should remain simple.

---

## Widget Edit Mode

Status: implemented

Purpose:

* allow users to customize visible widgets
* allow widget order changes
* allow temporary hiding of widgets

Implemented behavior:

* edit mode is toggled from the footer pencil button
* widgets are reordered by dragging their edit-mode handle
* widget visibility can be toggled from edit mode
* widget order and visibility are persisted in the settings store
* the main window drag region is disabled while edit mode is active

---

## TODO List View

Status: implemented

Purpose:

* provide a fuller view of TODO items
* improve usability when many TODO items exist
* support filtering by completion state or tag

This should build on the existing TODO model rather than replacing it.

---

## Detailed CPU / RAM History View

Status: implemented

Purpose:

* provide a larger graph view for historical CPU and RAM usage
* make system trends easier to inspect

Implemented behavior:

* toggled from the footer graph button
* reuses the existing system usage polling flow
* keeps CPU and RAM usage history in frontend memory
* shows current, average, and maximum values for the retained history window

---

# System Monitoring Improvements

## Real Network Speed

Status: implemented

Current state:

* displayed values are calculated from network interface byte deltas

Goal:

* collect real network throughput
* display upload and download speed
* keep polling lightweight

Implemented behavior:

* Rust collects network interface received / transmitted byte deltas with `sysinfo`
* frontend displays download and upload throughput in Mbps
* values represent current PC network activity, not link speed or ISP speed-test results

---

## Real Ping

Status: implemented

Current state:

* Ping is measured manually only

Goal:

* measure network latency
* expose result to the dashboard

Implementation should be conservative.

Implemented behavior:

* Ping is triggered by a button in the Network widget
* the app does not send periodic Ping traffic
* the default target host is `8.8.8.8`
* users can change the target host from Settings

---

## Real Processor Name

Status: implemented

Current state:

* processor name is retrieved from the operating system through Rust

Goal:

* obtain actual processor name from the operating system
* expose it through a Tauri command

Implemented behavior:

* Rust reads the first CPU brand from `sysinfo`
* frontend displays the returned processor name in the CPU widget
* an empty value falls back to `Unknown CPU`

---

# Desktop Integration

## Task Tray

Status: implemented

Purpose:

* keep the app resident in the system tray
* allow hiding and restoring the window
* provide quick access actions
* allow users to choose whether the close button exits or minimizes to tray

Target platform:

* Windows 11
* Linux

Platform-specific behavior should be evaluated on the affected environment. Preserve the shared product experience while allowing small, isolated adaptations where desktop APIs or compositor capabilities differ.

Implemented behavior:

* tray menu provides Open and Quit actions
* left-clicking the tray icon restores the main window
* the close button can ask every time, exit, or minimize to tray
* remembered close behavior can be changed from Settings

---

## Auto Start

Status: implemented

Purpose:

* allow the app to launch automatically on login

Target platform:

* Windows 11
* Linux

Implemented using Tauri's autostart plugin.

---

## Shortcut Buttons

Status: implemented

Purpose:

* provide quick access buttons for common actions
* keep shortcut execution local to the desktop app
* avoid exposing arbitrary shell command execution

Implemented behavior:

* the footer shortcuts button toggles a shortcuts-only view
* users can configure up to six shortcuts from Settings
* supported shortcut types are URL, file / folder, and app
* shortcut definitions are persisted in the settings store
* shortcut execution is routed through a focused Rust command

Out of scope:

* arbitrary shell command shortcuts
* shortcut arguments
* plugin-style shortcut extensions

---

# Future Ideas

The items in this section are ideas, not active plans.

They should not be implemented without explicit approval.

---

## Idea Editor Undo / Redo Shortcuts

Status: proposed

Purpose:

* make editing longer ideas easier with familiar keyboard shortcuts
* keep editor-specific shortcuts scoped to Idea Editor

Proposed behavior:

* `Ctrl+Z` undoes the latest edit
* `Ctrl+Shift+Z` redoes the latest undone edit
* shortcuts operate only while the relevant Idea Editor field has focus
* shortcuts do not affect the dashboard or other application-level state

Implementation notes:

* verify CodeMirror's existing history and keymap behavior before adding custom handling
* reuse the editor's native history rather than maintaining a second history in React state
* confirm expected behavior for both the Markdown body and title field
* document platform-specific alternatives only if supported, such as `Cmd` shortcuts on macOS
* add focused tests for shortcut scope, undo order, redo order, and autosave interaction

---

## Export Idea as Markdown

Status: proposed

Purpose:

* allow an idea to be saved as a portable local Markdown file
* let users reuse or archive idea content outside pure_board

Proposed behavior:

* export the currently open idea through an explicit Idea Editor action
* suggest a `.md` filename derived from the idea title
* preserve the Markdown body without silently changing its content
* save text as UTF-8
* report cancellation and write errors clearly without changing the stored idea

Implementation notes:

* use a native save dialog and the narrowest required Tauri filesystem capability
* define how the title is represented in the exported file before implementation
* sanitize suggested filenames while allowing the user to choose the final path
* keep export separate from the existing local persistence and autosave flow

Out of scope for the initial version:

* importing Markdown files
* synchronizing an exported file with later edits
* bulk export of all ideas

---

## Git / GitHub Integration for Ideas

Status: exploratory

Purpose:

* explore ways to connect Idea Editor content with Git or GitHub workflows

The concrete user workflow has not been decided. Requirements should be defined before implementation.

Questions to resolve:

* whether integration targets a local Git repository, GitHub, or both
* whether the main action is exporting files, committing changes, creating issues, or another focused workflow
* how users select a repository, branch, destination path, and GitHub account
* which actions require preview and explicit confirmation
* how authentication, offline use, conflicts, and failures are handled

Implementation constraints:

* do not expose arbitrary shell command execution
* do not store access tokens or GitHub credentials in the idea store
* prefer established Git and GitHub authentication mechanisms
* show the exact content and destination before any remote write
* keep Git / GitHub failures from affecting local idea persistence
* request only the minimum repository and GitHub permissions required by the chosen workflow

Out of scope until requirements are approved:

* automatic commits or pushes
* background synchronization
* creating or modifying remote GitHub content without explicit user confirmation

---

## AI Consultation from Idea Editor

Status: proposed

Purpose:

* allow users to consult an AI service or coding agent while developing an idea
* pass the current idea title and body as consultation context
* start the consultation from an explicit button in Idea Editor

Possible targets include:

* ChatGPT
* Codex
* Claude
* Claude Code

Expected flow:

* the user selects the AI target
* the user presses a consultation button in Idea Editor
* the app shows the content that will be shared and asks for confirmation
* the selected AI target opens with the idea content as context

Implementation notes:

* browser-based services and locally installed coding agents may require different integration paths
* prefer supported deep links, official APIs, or focused local commands over UI automation
* do not send idea content automatically or in the background
* do not expose or persist API keys, session tokens, or other authentication secrets unnecessarily
* define content-length limits and clear error handling before implementation
* keep provider-specific behavior isolated so adding or removing a target does not affect Idea persistence

Out of scope for the initial version:

* automatic background consultation
* sending all saved ideas at once
* allowing an AI target to modify or delete saved ideas without explicit user approval

---

## Gmail Dashboard

Status: proposed

Scope:

* Gmail only
* single account
* display message list only
* show subject
* show sender
* show received time
* show unread / read state
* open messages in the default browser

Out of scope:

* Yahoo Mail
* multiple accounts
* displaying email body inside the app
* composing mail
* sending mail
* deleting mail
* bulk mail operations

Authentication:

* OAuth 2.0
* Gmail API

Do not implement password-based or basic-auth access.

Gmail access must not expose secrets or tokens.

---

# Out of Scope

The following are currently out of scope:

* Electron migration
* backend server
* cloud synchronization
* multi-user support
* mobile support
* web-only version
* complex plugin system
* full email client functionality
* advanced task manager replacement

pure_board is not intended to replace Task Manager.

It is a lightweight desktop dashboard.

---

# Scope Control

When adding features:

* keep the app small
* avoid unrelated redesigns
* reuse existing architecture
* prefer incremental improvements
* avoid introducing broad frameworks

A roadmap item becoming implemented should also result in this document being updated.

---

# AI Agent Notes

Roadmap items must be treated as passive context.

Do not implement them unless a task explicitly requests implementation.

If a user asks for a roadmap item, inspect the current code first and implement only the requested portion.

When the requested task is ambiguous, prefer a small incremental implementation over a large complete redesign.

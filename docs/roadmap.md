# Roadmap

This document records implemented milestones, proposed work, and explicit scope limits for **pure_board**.

Roadmap entries are passive context. They are not active implementation tasks unless a user explicitly requests them.

---

# Project Direction

pure_board is a cross-platform desktop productivity dashboard inspired by the glass-style UI of Windows 11.

The project focuses on:

- lightweight system monitoring
- desktop-resident utility behavior
- a transparent Glassmorphism interface
- simple local productivity tools
- a small dependency and permission footprint
- maintainable Windows 11 and Linux support

The application should remain practical and incremental rather than becoming a full system manager or cloud service.

---

# Current Implemented Features

## System Monitoring

- CPU usage gauge and waveform
- actual processor name
- RAM usage gauge, used memory, total memory, and available memory
- expandable top CPU and memory-consuming process lists
- detailed CPU / RAM history with current, average, and maximum values
- real network upload and download throughput from interface byte deltas
- user-triggered Ping with a configurable target
- persisted update interval with a 0.1 second minimum

## Productivity

- persistent TODOs with add, complete, and delete actions
- TODO tags and a filterable full-list view
- persistent Ideas list ordered by update time
- separate reusable Idea Editor window
- CodeMirror Markdown syntax highlighting
- automatic and explicit Idea saving
- Idea Editor undo / redo shortcuts
- local Markdown file saving from the current editor content
- up to six configurable URL, file, folder, or application shortcuts
- Markdown-powered in-app help

## Desktop Integration and Customization

- transparent, undecorated Glassmorphism dashboard
- opaque, decorated Idea Editor window
- light and dark themes with OS-theme detection and persisted preference
- always-on-top mode
- task tray with Open and Quit actions
- configurable close behavior
- launch-at-login setting
- widget edit mode
- drag reordering and visibility controls
- persisted widget layout

---

# Implemented Feature Notes

The sections below record current behavior for features that began as roadmap work. They are not pending tasks.

## Settings Panel

Status: implemented

Settings currently manages:

- system and network polling interval
- manual Ping target
- six configurable shortcut slots
- launch at startup
- close button behavior

Settings values are stored locally where appropriate. The update interval is clamped to a 0.1 second minimum.

Possible future extension:

- configurable graph history length

## Widget Edit Mode

Status: implemented

- toggled from the Footer edit button
- shows hidden widgets while editing
- reorders widgets through a drag handle
- toggles visibility per widget
- persists order and visibility in `settings.json`
- disables the main-window drag region while editing
- normalizes the legacy `memo` widget identifier to `todo`

The default layout contains CPU, RAM, Network, TODO, and Ideas.

## TODO List View

Status: implemented

- toggled from the TODO header
- filters by all, active, or completed state
- filters by tag
- shows the visible and total item counts
- reuses the persisted TODO model rather than maintaining a second list

Legacy memo data is migrated into the current TODO store when present.

## Detailed CPU / RAM History View

Status: implemented

- toggled from the Footer graph button
- reuses the existing system polling flow
- keeps a bounded CPU and RAM history in frontend memory
- shows current, average, and maximum values
- derives the represented time range from the update interval

## Real Network Throughput

Status: implemented

- Rust collects network interface received and transmitted byte deltas with `sysinfo`
- the frontend displays current download and upload throughput in Mbps
- polling uses the same configured interval as system usage
- values describe current PC traffic, not link speed or ISP speed-test results

## Manual Ping

Status: implemented

- triggered explicitly from the Network widget
- sends no periodic background Ping traffic
- defaults to `8.8.8.8`
- lets users change the target in Settings
- executes the operating system's Ping command with platform-specific arguments
- reports command and parsing failures in the UI

## Processor and Process Information

Status: implemented

- Rust reads the processor brand through `sysinfo`
- an empty processor value falls back to `Unknown CPU`
- CPU and RAM cards can expand to show the highest-usage processes

## Task Tray and Close Behavior

Status: implemented

- the tray menu provides Open and Quit
- left-clicking the tray icon restores and focuses the main window
- the close button can ask every time, exit, or hide the main window to the tray
- a selected close preference can be remembered and changed from Settings

Desktop-shell differences are evaluated on the affected Windows or Linux environment.

## Automatic Startup

Status: implemented

- uses `tauri-plugin-autostart`
- toggled from **Launch at startup** in Settings
- uses the native login-startup mechanism exposed by the plugin

## Shortcut Buttons

Status: implemented

- the Footer shortcut button toggles a shortcuts-only view
- users configure up to six shortcuts in Settings
- supported types are URL, file or folder, and application
- shortcut definitions are persisted in `settings.json`
- execution is routed through a focused Rust command
- URL schemes and local paths are validated

Out of scope:

- arbitrary shell commands
- shortcut command-line arguments
- plugin-style shortcut extensions

## Idea Editor

Status: implemented

- opens in a separate opaque, decorated native window
- reuses the existing editor window when another idea is selected
- stores title, Markdown body, and timestamps locally
- limits titles to 200 characters and bodies to 200,000 characters
- highlights Markdown syntax with CodeMirror
- autosaves approximately 700 ms after editing stops
- supports immediate saving with `Ctrl+S`
- saves pending changes before close after user confirmation
- notifies the main window after saving or deleting

## Idea Editor Undo / Redo

Status: implemented

- `Ctrl+Z` undoes in the focused title or Markdown body field
- `Ctrl+Shift+Z` redoes on Windows and Linux
- the title uses native input history
- the Markdown body uses CodeMirror history
- title and body histories reset when another idea is opened, including reopening the same idea
- externally loaded body content is not added to editor history
- undo and redo participate in the normal autosave flow
- history remains in frontend memory and is not persisted between editor sessions

## Save Idea as a Markdown File

Status: implemented

- started from the Idea Editor **ファイルに保存** action
- saves the current Markdown body as UTF-8
- uses a native save dialog
- suggests a `.md` filename derived from the title
- replaces title whitespace with underscores and sanitizes characters for Windows and Linux
- uses the title only for the suggested filename and does not add it to the file body
- includes current unsaved editor changes
- treats dialog cancellation as a no-op
- reports write failures without changing the stored idea
- does not change Idea persistence state or timestamps
- disables the action when both title and body are empty after trimming

Implementation uses Idea Editor-scoped dialog and text-file write permissions. Importing files, synchronizing later edits, and bulk saving remain out of scope.

## Markdown-Powered Help

Status: implemented

- toggled from the Footer help button
- loads user-facing topics from `src/help/content`
- groups topics by category in a collapsible sidebar
- renders the source Markdown through React Markdown

---

# Future Ideas

The following entries are ordered by the current implementation priority. They still require explicit approval and requirement review before work begins.

## AI Consultation from Idea Editor

Status: proposed

Purpose:

- let users consult an AI service or coding agent while developing an idea
- pass the current title and body as explicit consultation context
- start consultation from a deliberate Idea Editor action

Possible targets include ChatGPT, Codex, Claude, and Claude Code.

Questions and constraints:

- browser services and local coding agents need different integration paths
- show the exact shared content and ask for confirmation
- do not send idea content automatically or in the background
- prefer official APIs, supported deep links, or focused local commands over UI automation
- do not expose or persist authentication secrets unnecessarily
- define content-length limits and useful error handling
- isolate provider-specific behavior from Idea persistence
- do not allow a target to modify or delete saved ideas without explicit approval

## Git / GitHub Integration for Ideas

Status: exploratory

Purpose:

- explore a focused connection between Idea Editor content and Git or GitHub workflows

The concrete user workflow is not yet defined. Requirements must decide:

- local Git, GitHub, or both
- saving files, committing, creating issues, or another primary action
- repository, branch, path, and account selection
- preview and confirmation boundaries
- authentication, offline behavior, conflicts, and failures

Constraints:

- do not expose arbitrary shell execution
- do not store GitHub tokens or credentials in the idea store
- prefer established Git and GitHub authentication mechanisms
- preview the exact content and destination before a remote write
- keep failures from affecting local idea persistence
- request the minimum necessary permissions

Automatic commits, pushes, background synchronization, and unconfirmed remote writes remain out of scope until requirements are approved.

## Gmail Dashboard

Status: proposed

Initial scope:

- Gmail only
- one account
- message list only
- subject, sender, received time, and read state
- open a selected message in the default browser
- OAuth 2.0 and the Gmail API

Out of scope:

- Yahoo Mail or other providers
- multiple accounts
- rendering message bodies in pure_board
- composing, sending, deleting, or bulk-operating on mail
- password or basic-auth access

Authentication secrets and tokens must not be exposed through application data or logs.

---

# Out of Scope

The following are currently out of scope:

- Electron migration
- a backend server
- cloud synchronization
- multi-user support
- mobile support
- a web-only version
- a complex plugin system
- a full email client
- an advanced task-manager replacement

pure_board remains a lightweight local desktop dashboard.

---

# Scope Control

When adding a feature:

- inspect the current implementation first
- implement only the explicitly requested portion
- reuse the existing architecture
- prefer incremental changes
- avoid broad frameworks and permissions
- update this document when a roadmap item becomes implemented

When requirements are unclear, define the user workflow before choosing an integration or dependency.

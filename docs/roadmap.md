# Roadmap

This document describes planned, proposed, and out-of-scope functionality for **pure_board**.

Roadmap items are not active implementation tasks unless explicitly requested.

AI agents should not implement features from this document without a direct instruction.

---

# Project Direction

pure_board is a Windows 11 desktop dashboard.

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

# Near-Term Tasks

These are likely next implementation targets.

## Settings Panel

Status: implemented

Purpose:

* provide a place for runtime preferences
* show the current system usage update interval
* allow users to enter custom update intervals with a 0.1s minimum
* preserve selected settings

Future extensions:

* expose additional runtime preferences

Possible settings:

* graph history length
* theme preference
* startup behavior

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

Linux behavior should not drive the design unless explicitly requested.

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

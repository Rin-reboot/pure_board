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
* memo widget
* memo add / complete / delete behavior
* memo tag selection
* memo list view
* memo persistence
* settings panel
* dark mode / light mode toggle
* OS theme detection at startup
* manual theme preference persistence
* always-on-top toggle
* widget edit mode
* widget drag reordering
* widget visibility toggle
* close button

---

# Known Placeholder Values

The following values are currently placeholders:

None.

Network speed and Ping are retrieved by Rust commands. Ping is measured only when the user presses the Ping button, avoiding periodic traffic to external services.

Do not treat them as bugs unless the task explicitly asks to replace placeholders with real values.

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

## Memo List View

Status: implemented

Purpose:

* provide a fuller view of memo items
* improve usability when many memos exist
* support filtering by completion state or tag

This should build on the existing memo model rather than replacing it.

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
* the initial target is Google DNS over TCP, `8.8.8.8:443`

---

## Real Processor Name

Status: planned

Current state:

* processor name is displayed as a fixed placeholder

Goal:

* obtain actual processor name from the operating system
* expose it through a Tauri command

Implementation should prioritize Windows correctness.

---

# Desktop Integration

## Task Tray

Status: planned

Purpose:

* keep the app resident in the system tray
* allow hiding and restoring the window
* provide quick access actions

Target platform:

* Windows 11

Linux behavior should not drive the design unless explicitly requested.

---

## Auto Start

Status: planned

Purpose:

* allow the app to launch automatically on login

Target platform:

* Windows 11

Implementation should use native or Tauri-supported mechanisms when possible.

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

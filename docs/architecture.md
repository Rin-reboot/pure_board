# Architecture

This document describes the architecture of **pure_board**.

It explains how the application is organized and where new functionality should be implemented.

Implementation rules and coding conventions are documented separately in `development.md`.

---

# High-Level Overview

pure_board is a desktop application built with:

* Tauri 2
* React 19
* TypeScript
* Rust

The frontend is responsible for presentation and user interaction.

The backend is responsible for operating system integration and system information retrieval.

Communication between the frontend and backend occurs through Tauri commands.

```
React UI
    │
    ▼
React Hooks
    │
    ▼
Tauri invoke()
    │
    ▼
Rust Commands
    │
    ▼
Operating System
```

---

# Directory Structure

```
src/
├── components/
├── hooks/
├── assets/
├── styles/
└── App.tsx

src-tauri/
├── src/
│   └── lib.rs
├── capabilities/
└── Cargo.toml
```

Each directory has a single responsibility.

---

# Frontend

The frontend is responsible for:

* rendering widgets
* user interaction
* animations
* local UI state
* theme switching

The frontend should not contain platform-specific logic whenever it can be delegated to Rust.

---

# Backend

Rust is responsible for:

* system information
* operating system APIs
* filesystem access
* platform integration
* Tauri commands

Business logic that depends on the operating system belongs in Rust.

---

# Component Layer

Components should represent visible UI.

Examples:

* TitleBar
* CpuCard
* RamCard
* MemoPanel
* Footer

Components should:

* receive data
* render UI
* emit events

Components should avoid directly communicating with Tauri whenever possible.

---

# Hook Layer

Hooks provide reusable application logic.

Examples include:

* polling
* persistence
* theme handling
* widget state

Hooks may call Tauri commands.

Components should consume hooks instead of duplicating logic.

---

# Tauri Commands

Frontend communicates with Rust using Tauri commands.

Typical flow:

```
Component

↓

Hook

↓

invoke()

↓

Rust command

↓

Response

↓

React state

↓

UI update
```

Commands should be:

* focused
* predictable
* well named

Avoid commands that perform multiple unrelated operations.

---

# State Management

The application currently relies on React state and hooks.

Introduce additional state management libraries only when the existing approach becomes insufficient.

Keep state as local as possible.

---

# Persistence

Persistent user data should be stored using:

* tauri-plugin-store

Examples include:

* memos
* settings
* user preferences

Avoid introducing multiple persistence mechanisms unless required.

---

# System Information

System information originates from Rust.

Examples:

* CPU usage
* RAM usage
* processor information
* network information

The frontend should treat these values as read-only.

---

# UI Updates

System usage is obtained periodically.

Rendering should remain independent from data collection.

For example:

```
Polling

↓

React State

↓

Widget Rendering
```

Widgets should never directly manage polling.

---

# Theme

Theme selection belongs to the application layer.

Individual widgets should react to the current theme rather than determining it themselves.

---

# Window Management

Window behavior should remain centralized.

Examples include:

* always-on-top
* transparency
* blur
* resizing
* startup behavior

Avoid scattering window-related logic across multiple components.

---

# Platform Separation

Platform-specific behavior should remain isolated.

Do not mix:

* Windows-specific logic
* Linux-specific workarounds

When platform branching is required, keep it localized and document the reason.

---

# Dependencies

Dependency direction should remain simple.

```
Components

↓

Hooks

↓

Tauri Commands

↓

Operating System
```

Lower layers must never depend on upper layers.

---

# Extending the Application

When adding new functionality:

1. Decide whether it belongs in the frontend or backend.
2. Reuse existing hooks where appropriate.
3. Add new Tauri commands only when frontend APIs are insufficient.
4. Keep responsibilities clearly separated.

---

# Future Features

Future functionality should integrate into the existing architecture rather than introducing parallel structures.

New widgets should follow the same flow:

```
Backend

↓

Hook

↓

Component
```

Maintain consistency with existing patterns whenever possible.

---

# Design Goals

The architecture prioritizes:

* readability
* maintainability
* predictable data flow
* minimal dependencies
* clear separation of responsibilities

Large architectural changes should only be made when explicitly requested.

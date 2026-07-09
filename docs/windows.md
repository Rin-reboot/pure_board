# Windows & Platform Guide

This document describes platform-specific behavior and development policies for **pure_board**.

The application targets **Windows 11**, while development may occur on either **Windows 11** or **Linux (CachyOS)**.

AI agents should read this document before modifying platform-specific functionality.

---

# Supported Platforms

## Primary Target

* Windows 11

The application is designed primarily for Windows 11.

Correct behavior should always be judged against Windows unless a task explicitly targets another platform.

---

## Development Platforms

Development may occur on:

* Windows 11
* Linux (CachyOS)

Linux is a supported development environment, but it is **not** the reference platform for desktop behavior.

---

# Execution Environment

AI agents (Codex, ChatGPT, etc.) may execute on either Windows or Linux.

Do not assume which operating system is currently being used.

Before diagnosing a problem, determine whether the observed behavior originates from:

* the application
* Tauri
* the operating system
* the desktop environment
* the window manager
* the compositor

Do not modify application logic before identifying the actual cause.

---

# Windows Is the Source of Truth

The following features should be evaluated primarily on Windows:

* transparent windows
* blur effects
* always-on-top
* title bar behavior
* task tray integration
* auto start
* window focus
* native window controls

Differences observed only on Linux should not automatically be treated as bugs.

---

# Linux Development

Linux is intended primarily for development.

Most application logic can be implemented and tested on Linux.

However, some desktop features may behave differently depending on:

* Wayland
* X11
* KDE Plasma
* GNOME
* compositor implementation

These differences should not result in platform-specific workarounds unless explicitly required.

---

# Wayland

Wayland intentionally restricts several window management operations.

Depending on the compositor:

* Always-on-top requests may be ignored.
* Window positioning may differ.
* Transparency effects may vary.
* Blur implementations may differ.
* Window activation behavior may vary.

These behaviors are expected.

Do not implement application workarounds solely to satisfy Wayland behavior.

---

# X11

Some Linux users may still use X11.

Behavior under X11 may differ from Wayland.

Unless the task explicitly targets Linux compatibility, Windows behavior remains the reference.

---

# Transparency

The application uses a transparent Glassmorphism-style interface.

Transparency may appear differently depending on:

* operating system
* graphics driver
* compositor
* desktop theme

Visual differences alone do not necessarily indicate implementation problems.

---

# Blur

Blur is a visual enhancement.

If blur behaves differently across platforms:

* verify the platform
* verify compositor capabilities
* verify Tauri support

Do not replace the implementation without evidence that the current implementation is incorrect.

---

# Always-on-Top

Always-on-top behavior depends on the operating system.

On Windows:

* this feature should function normally.

On Linux:

* the compositor may ignore the request.

An ignored request is not necessarily an application bug.

---

# Native Window Features

Features such as:

* minimize
* close
* title bar controls
* window decorations

should remain as close as possible to native platform behavior.

Avoid implementing custom behavior unless necessary.

---

# Task Tray

Task tray functionality is implemented.

Implementation should prioritize Windows behavior.

Platform-specific handling may be introduced when necessary, but only within isolated code paths.

The close button can either exit the app or hide the main window while keeping the app resident in the tray. Users can choose the behavior from Settings.

---

# Auto Start

Automatic startup should integrate with the native operating system.

Do not introduce platform-independent abstractions unless they simplify maintenance.

---

# File System

Use Tauri APIs whenever possible.

Avoid writing platform-specific filesystem logic unless absolutely required.

---

# Testing

When modifying platform-specific functionality:

On Windows:

* verify behavior directly whenever possible.

On Linux:

* verify that compilation succeeds.
* verify that application logic remains correct.
* do not assume desktop behavior matches Windows.

---

# Continuous Integration

Windows builds are performed using GitHub Actions.

Successful Windows builds provide stronger validation than Linux desktop behavior for platform-specific functionality.

---

# Platform-Specific Code

When platform-specific code becomes necessary:

* isolate it
* document why it exists
* avoid leaking platform conditions into unrelated modules

Prefer a single platform boundary instead of scattered conditional logic.

---

# Bug Reports

Before fixing a reported issue:

Determine:

1. Which operating system is affected?
2. Which desktop environment is being used?
3. Which window system is being used?
4. Can the issue be reproduced on Windows?

Only after answering these questions should implementation changes be considered.

---

# AI Agent Expectations

When working on this repository:

* treat Windows 11 as the reference platform
* treat Linux primarily as a development environment
* avoid introducing Linux-specific workarounds without explicit request
* avoid assuming compositor behavior is controlled by the application
* preserve cross-platform buildability whenever possible

Correct platform analysis is more important than platform-specific code changes.

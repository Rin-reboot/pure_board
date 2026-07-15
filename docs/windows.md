# Windows & Platform Guide

This document describes platform-specific behavior and development policies for **pure_board**.

The application supports **Windows 11** and **Linux**. Its visual design is inspired by and respects the glass-style UI of Windows 11.

AI agents should read this document before modifying platform-specific functionality.

---

# Supported Platforms

* Windows 11
* Linux

The application is designed as a cross-platform productivity dashboard.

Correct behavior should be evaluated on the affected supported platform. Windows 11 is the visual reference for the glass-style design, not the sole behavioral reference.

---

## Development Platforms

Development may occur on:

* Windows 11
* Linux (CachyOS)

Both platforms are supported development and application environments. macOS is not currently included in the build matrix or supported-platform claim.

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

# Platform-Specific Desktop Behavior

The following features should be evaluated on each affected platform:

* transparent windows
* blur effects
* always-on-top
* title bar behavior
* task tray integration
* auto start
* window focus
* native window controls

Differences between platforms should not automatically be treated as bugs. Determine whether the behavior comes from the application, the operating system, the window system, or the compositor.

---

# Linux Development

Linux is a supported application and development environment.

Most application logic can be implemented and tested on Linux.

However, some desktop features may behave differently depending on:

* Wayland
* X11
* KDE Plasma
* GNOME
* compositor implementation

These differences may require small platform-specific handling when they prevent supported functionality. Keep such handling isolated and verify that it does not regress other platforms.

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

Evaluate X11-specific issues on X11 and keep any necessary compatibility logic isolated.

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

The main dashboard keeps its custom transparent, undecorated window. Idea Editor is a separate opaque, decorated native window so long-form text remains readable in both themes.

Idea Editor intercepts a close request only when it needs to finish saving. After persistence succeeds, it destroys the secondary window directly to avoid re-entering the same close-request event. Changes to window capabilities require a full Tauri app restart; frontend hot reload alone does not apply them.

---

# Task Tray

Task tray functionality is implemented.

Implementation should preserve behavior across supported platforms. Platform-specific handling may be introduced when necessary, but only within isolated code paths.

The close button can either exit the app or hide the main window while keeping the app resident in the tray. Users can choose the behavior from Settings.

The tray icon shows a mini graph for the selected CPU, RAM, or network metric. The feature is enabled by default, can be disabled in Settings, and supports an update interval from 1 to 60 seconds. It keeps running while the main window is hidden.

Windows 11 is the priority platform for this feature. Windows controls whether a third-party icon is shown directly in the notification area or inside the hidden-icons overflow, so the skippable first-run tutorial introduces the feature and a persistent Settings link explains how users can make the icon visible.

The graph remains static while the device is running on battery power or while the operating system requests reduced motion. Tooltip and menu values continue to update. On Linux, the icon and context menu are the baseline behavior; tooltip and left-click support may vary by desktop environment.

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

Windows and Linux builds are performed using GitHub Actions.

Windows and Linux builds validate cross-platform buildability. Platform-specific desktop behavior still requires verification on the affected environment.

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
4. Can the issue be reproduced on another supported environment, and is that comparison relevant?

Only after answering these questions should implementation changes be considered.

---

# AI Agent Expectations

When working on this repository:

* treat Windows 11 as the visual reference for the glass-style UI
* treat Windows 11 and Linux as supported platforms
* evaluate platform-specific issues on the affected environment
* keep necessary platform-specific handling isolated
* avoid assuming compositor behavior is controlled by the application
* preserve cross-platform buildability whenever possible

Correct platform analysis is more important than platform-specific code changes.

# Windows & Platform Guide

This document describes platform-specific behavior and development policies for **pure_board**.

The application supports **Windows 11** and **Linux**. Windows 11 is the visual reference for its glass-style UI, not the sole reference for application behavior.

Read this document before modifying window, tray, startup, Ping, shortcut, transparency, or other desktop integration behavior.

---

# Supported and Development Platforms

Supported application platforms:

- Windows 11
- Linux

Development may occur on Windows 11 or Linux, including CachyOS. macOS is not currently included in the build matrix or supported-platform claim.

AI agents may also execute in a different environment from the target platform. Inspect the current environment and evaluate a reported problem on the affected supported platform.

---

# Diagnosing Desktop Behavior

Before changing implementation, determine whether the observed behavior comes from:

- pure_board
- Tauri or the WebView runtime
- the operating system
- the desktop environment
- Wayland or X11
- the window manager or compositor
- a missing operating-system command

A difference between Windows and Linux is not automatically an application bug.

---

# Linux, Wayland, and X11

Linux is a supported application and development environment. Most application logic can be implemented and tested there, but desktop integration varies by environment.

Wayland compositors may restrict or reinterpret:

- always-on-top requests
- window positioning and activation
- transparency and blur
- focus changes

X11 behavior may differ from Wayland. KDE Plasma, GNOME, and other desktops may also expose different tray, startup, and compositor behavior.

Do not add a workaround solely to make one environment imitate Windows. When a supported feature is prevented from working, keep any necessary platform-specific handling small, isolated, documented, and verified against other supported platforms.

---

# Main Window and Glass UI

The main dashboard is configured as a transparent, undecorated 400 x 600 window with a 350 px minimum width. The React UI supplies the title bar, window controls, glass surfaces, and CSS backdrop blur.

Transparency and blur appearance may vary with:

- operating system and WebView implementation
- graphics driver
- compositor
- desktop theme
- whether the compositor supports background sampling

Visual differences alone do not prove that the application implementation is incorrect.

Always-on-top uses the Tauri window API and is persisted in the local settings store. Windows should normally honor it; a Linux compositor may ignore the request.

---

# Idea Editor Window

Idea Editor is a separate, opaque, decorated, resizable native window. This keeps long-form text readable in light and dark themes.

The frontend creates it with `WebviewWindow`, reuses an existing editor instance, and sends focused events when another idea should open. CodeMirror is loaded lazily only for the editor role.

When closing with pending changes, Idea Editor asks whether to save. After persistence succeeds, it destroys the secondary window directly so the same close-request event is not entered again.

The editor has a separate Tauri capability. Changes to window capabilities require a full Tauri application restart; frontend hot reload alone does not apply them.

---

# Task Tray and Close Behavior

Task tray functionality is implemented on supported desktop platforms.

- left-clicking the tray icon shows and focuses the main window
- the tray menu provides **Open** and **Quit**
- the main close button can ask every time, exit the app, or hide the window while the process remains in the tray
- the remembered close preference can be changed from Settings

Tray icon visibility, menu placement, and activation behavior may vary between Windows desktop shells and Linux tray implementations.

---

# Taskbar Status Mini Graph

The tray icon can display a configurable mini graph for CPU, RAM, or Network. It is enabled by default, uses CPU initially, and accepts a persisted update interval from 1 to 60 seconds.

A dedicated Rust worker samples system information and renders the 32 px icon independently of the main-window polling flow. It continues running while the main window is hidden. The tray tooltip and first menu item show current values.

Windows 11 is the priority platform for this feature. Windows decides whether a third-party icon appears directly in the notification area or in the hidden-icons overflow. The skippable first-run tutorial introduces the feature, while Settings and Help retain instructions for keeping the icon visible.

On Linux, the mini graph and context menu are the baseline behavior. Tooltip and left-click support may vary by desktop environment and tray implementation.

The graph remains visually static on battery power or when the frontend reports a reduced-motion preference. Tooltip and menu values continue updating, and graph rendering resumes after AC power returns or reduced motion is disabled.

---

# Automatic Startup

Automatic startup is implemented with `tauri-plugin-autostart`.

Users enable or disable **Launch at startup** from Settings. The plugin registers the application with the native login-startup mechanism for the current platform; the application does not maintain a parallel startup-file format.

Verify registration and launch behavior on the affected operating system. Desktop-session startup behavior on Linux may depend on the environment.

---

# System Information

CPU, memory, processor, process, and network values are collected in Rust with `sysinfo`.

Network throughput is calculated from received and transmitted byte deltas across network interfaces and displayed in Mbps. It represents current device traffic, not physical link speed or an ISP speed test.

The frontend polls system and network commands at the persisted update interval, with a 100 ms minimum.

---

# Ping

Ping is measured only after the user presses the Ping button. The app does not send periodic background Ping traffic.

Rust starts the operating system's `ping` executable with one request and a short timeout:

- Windows uses Windows-compatible count and timeout flags
- Linux uses Linux-compatible count and timeout flags

The target is passed as a command argument rather than interpolated into a shell command. Failures may indicate an invalid target, network restrictions, a host that does not answer ICMP, or an unavailable `ping` executable.

---

# Shortcut Launching

Shortcut definitions are local settings. The supported action types are URL, file or folder, and application.

- URLs must start with `http://` or `https://`.
- File and application targets must exist.
- Windows opens URLs, files, and folders through the default registered application.
- Linux opens URLs, files, and folders through `xdg-open`.
- Application targets are launched directly without accepting arbitrary command-line arguments.

Arbitrary shell-command shortcuts are intentionally unsupported. Keep validation in Rust and add platform branches only inside the focused launcher boundary.

---

# Markdown File Saving

Idea Editor can save its current body to a user-selected Markdown file.

- `tauri-plugin-dialog` opens the native save dialog.
- `tauri-plugin-fs` writes UTF-8 text to the selected path.
- dialog and text-file write permissions are scoped to the `idea-editor` capability.
- the title supplies only the suggested cross-platform-safe filename.
- saving a file does not change Idea persistence or timestamps.

Do not replace this with platform-specific filesystem code unless the Tauri APIs cannot provide required supported behavior.

---

# Testing Platform-Specific Changes

For Windows-specific reports:

- verify behavior on Windows 11 when possible
- distinguish WebView, shell, and application behavior
- check tray, startup, transparency, window controls, and path handling directly

For Linux-specific reports:

- record the distribution, desktop environment, and Wayland or X11 session
- verify compilation and application logic
- verify affected desktop behavior on the reported environment when possible
- do not assume comparison with Windows alone determines correctness

Cross-platform compilation is necessary but does not replace desktop behavior testing.

---

# Continuous Integration

Pull request Rust checks run on Ubuntu and validate formatting, Clippy warnings, and compilation. Frontend checks also run on Ubuntu.

Release builds produce:

- Windows MSI and NSIS installers
- Linux DEB, RPM, and AppImage packages on Ubuntu 22.04
- an Arch Linux package in an Arch container

Successful builds validate cross-platform buildability, not identical transparency, blur, tray, startup, focus, or always-on-top behavior. See `ci.md` for the complete workflow and package details.

---

# Platform-Specific Code

When a platform branch is necessary:

- isolate it at one clear boundary
- document why it exists
- use argument-based process invocation instead of a shell when possible
- avoid leaking platform checks into unrelated components and hooks
- verify that supported platforms still compile

Current localized examples are Ping arguments and default-application launching in `src-tauri/src/lib.rs`, plus battery-state detection in `src-tauri/src/tray_status.rs`.

---

# Bug Reports

Before implementing a fix, determine:

1. Which operating system and version are affected?
2. Which desktop environment is used?
3. Is the session Wayland or X11?
4. Which WebView, shell, compositor, or external OS command is involved?
5. Can the issue be reproduced on another relevant supported environment?

Correct platform analysis is more important than adding platform-specific code quickly.

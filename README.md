# pure_board

A lightweight, cross-platform productivity dashboard inspired by the glass-style UI of Windows 11.

[日本語](README-ja.md)

![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-stable-CE422B?logo=rust&logoColor=white)

## Overview

**pure_board** brings system monitoring and small productivity tools together in a transparent desktop widget. It provides quick access to system activity, TODOs, ideas, and user-defined shortcuts while keeping user data on the local device.

## Features

### System monitoring

- Real-time CPU and RAM usage
- CPU waveform and detailed CPU / RAM history views
- Per-process CPU and memory usage
- Network upload and download throughput
- Manual ping measurement with a configurable target
- Configurable system information update interval

### Productivity

- Persistent TODOs with completion state, tags, and a filterable list view
- Persistent ideas with a separate Idea Editor window
- Markdown syntax highlighting, automatic saving, and undo / redo for ideas
- Saving the current Idea Editor content as a local Markdown file
- Up to six configurable shortcuts for URLs, files, folders, and apps
- In-app help managed with Markdown

### Desktop integration

- Transparent glassmorphism-style interface
- Light and dark themes
- Always-on-top mode
- Task tray integration and automatic startup
- Reorderable and hideable widgets
- Configurable close behavior

## Platforms

pure_board is a cross-platform application for Windows 11 and Linux. Its visual design respects the glass-style UI of Windows 11 while remaining useful across supported desktop environments.

GitHub Releases provide Windows installers and x86_64 Linux packages in DEB, RPM, AppImage, and Arch Linux (`.pkg.tar.zst`) formats. The Arch package can be installed on Arch-family distributions such as CachyOS with `sudo pacman -U <package-file>`.

Transparency, blur, always-on-top, task tray, and startup behavior may differ by operating system, window system, and compositor. These platform differences are evaluated on the affected environment rather than against Windows as the sole reference. macOS is not currently included in the build matrix or supported-platform claim.

## Local-first behavior

TODOs, ideas, shortcuts, and preferences are stored locally. Network throughput is measured on the device. Ping is run only when requested by the user and uses the operating system's ping command; it is not sent periodically in the background.

## Built with

- [Tauri 2](https://tauri.app/)
- React 19 and TypeScript
- Rust and [`sysinfo`](https://crates.io/crates/sysinfo)
- Tauri plugins for local storage, automatic startup, native save dialogs, and filesystem access
- CodeMirror 6
- React Markdown

## Project links

- [Contributing guide](CONTRIBUTE.md)
- [CI and release builds](docs/ci.md)
- [Roadmap](docs/roadmap.md)

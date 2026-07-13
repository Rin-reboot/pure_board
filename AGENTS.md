# AGENTS.md

# AI Agent Guide

This document provides guidance for AI coding agents (Codex, ChatGPT, GitHub Copilot, Claude Code, etc.) working on this repository.

This file describes development rules, repository conventions, platform considerations, and project expectations.

For architectural details, refer to the documentation under `docs/`.

---

# Project Overview

pure_board is a cross-platform desktop productivity dashboard built with Tauri 2. Its visual design is inspired by and respects the glass-style UI of Windows 11.

The application displays system information such as CPU and RAM usage inside a transparent Glassmorphism-style desktop widget while also providing lightweight productivity features such as persistent memos.

The project prioritizes:

- Simplicity
- Readability
- Maintainability
- Native desktop experience
- Small dependency footprint

---

# Target Platform

Supported and development environments:

- Windows 11
- Linux (CachyOS)

The development environment is **not always the same as the target environment**.

Always distinguish between:

- application bugs
- platform limitations
- desktop environment behavior

before modifying implementation.

---

## Line Endings

Use LF line endings for source files, Markdown, JSON, TOML, TypeScript, Rust, CSS, and config files.

Do not introduce CRLF line endings except for Windows-specific script files such as `.bat`, `.cmd`, or `.ps1`.

If line-ending normalization is required, keep it in a dedicated commit separate from feature changes.

---

# Execution Environment

Codex may execute on either:

- Windows
- Linux

Do not assume which environment is being used.

Always inspect the repository and available tooling before making platform-specific decisions.

---

# Platform Rules

## Windows

Windows 11 is the visual design reference for the application's glass-style UI, but it is not the sole source of truth for application behavior.

Features involving:

- transparency
- blur
- window decorations
- always-on-top
- task tray
- startup

should be evaluated on Windows when a reported issue affects Windows.

---

## Linux

Linux is a supported application and development platform.

Linux behavior may differ because of:

- Wayland
- X11
- KDE Plasma
- compositor implementation

Evaluate Linux issues on the affected window system and compositor. Distinguish application bugs from platform limitations before modifying application logic.

---

# Development Principles

When implementing features:

- Keep changes as small as possible.
- Preserve existing architecture.
- Prefer extending existing code over rewriting.
- Do not perform unrelated refactoring.
- Avoid introducing unnecessary abstractions.

---

# Repository Philosophy

Readable code is preferred over clever code.

Small files are preferred over large files.

Explicit code is preferred over magic.

---

# Dependency Policy

Avoid adding new dependencies.

Before introducing a package:

- verify existing APIs cannot solve the problem
- verify Tauri already doesn't provide the feature
- justify why the dependency is necessary

Smaller dependency trees are preferred.

---

# TypeScript Guidelines

Always:

- use strict typing
- avoid any
- avoid unnecessary assertions
- keep components focused
- extract reusable logic into hooks when appropriate

Prefer:

- interfaces for public structures
- type aliases for unions

---

# React Guidelines

Prefer:

- functional components
- hooks
- composition

Avoid:

- deeply nested JSX
- unnecessary state
- prop drilling when avoidable

Do not optimize prematurely.

---

# Rust Guidelines

Rust code should remain:

- explicit
- safe
- readable

Prefer standard library functionality before introducing crates.

Avoid suppressing warnings.

Code should pass:

cargo fmt

cargo clippy --all-targets -- -D warnings

---

# Tauri Guidelines

Prefer existing Tauri APIs.

Avoid platform-specific code unless required.

When platform-specific code is necessary:

- isolate it
- document why
- keep it minimal

---

# UI Principles

The application follows a Glassmorphism design.

Changes should preserve:

- transparency
- spacing consistency
- visual simplicity
- desktop-widget appearance

Avoid introducing UI elements that conflict with the overall aesthetic.

---

# Memo System

Memo data is persisted.

Maintain backward compatibility whenever possible.

Breaking persistence formats should only occur when explicitly requested.

---

# Mock Data

Some features intentionally use placeholder values.

Examples include:

- processor name
- network speed
- ping

These are known placeholders.

Do not treat them as bugs.

---

# Performance

Prefer lightweight implementations.

Avoid:

- unnecessary polling
- unnecessary renders
- excessive allocations

Optimize only when measurable.

---

# Formatting

Frontend:

Use Biome.

Rust:

Use cargo fmt.

Never manually reformat unrelated files.

---

# Testing

Before considering work complete:

Frontend:

- lint
- typecheck
- tests when applicable

Rust:

- fmt
- clippy

If execution is impossible, explain why.

Do not claim code has been tested when it has not.

---

# Git Changes

Keep commits focused.

Do not commit or push changes directly to `main`.

Create a dedicated branch and submit changes through a pull request.

Avoid:

- formatting-only commits mixed with features
- unrelated file modifications
- large-scale renames without request

---

# Documentation

Update documentation whenever behavior changes.

If implementation differs from documentation, update the documentation.

---

# Roadmap

Future ideas documented under `docs/roadmap.md` are **not active tasks**.

Do not implement roadmap items unless explicitly requested.

---

# CI

Release and build configuration are documented in:

docs/ci.md

Do not modify workflows unless the task requires it.

---

# Architecture

Architecture documentation lives in:

docs/architecture.md

Do not infer architecture from assumptions.

Read the documentation before performing large refactors.

---

# Development Rules

Development conventions are documented in:

docs/development.md

Consult them before introducing new patterns.

---

# Windows Notes

Platform-specific behavior is documented in:

docs/windows.md

Read before modifying:

- window behavior
- transparency
- startup
- task tray
- desktop integration

---

# When Unsure

If implementation details are unclear:

- stop
- inspect the existing code
- explain uncertainty
- avoid guessing

Correctness is preferred over speed.

---

# Never Do

Never:

- rewrite working code without request
- redesign the architecture
- replace libraries without reason
- introduce Electron
- add backend services
- bypass persistence compatibility
- assume Linux behavior matches Windows
- ignore compiler or linter warnings
- claim tests passed without running them
- modify unrelated files

---

# Goal

Produce maintainable, minimal, readable code that matches the existing project style while preserving its cross-platform direction and Windows 11-inspired glass-style design.

# Development Guide

This document defines the development conventions for **pure_board**.

Architecture is described in `architecture.md`. Platform behavior is described in `windows.md`.

AI agents and contributors should also follow `AGENTS.md`.

---

# General Principles

Prefer readable, explicit code and small changes that follow the existing architecture.

- extend existing code before introducing a parallel implementation
- keep each change limited to the requested behavior
- avoid unrelated refactoring or formatting
- prefer standard, React, Rust, and Tauri APIs before adding dependencies
- preserve local data and cross-platform behavior

Simple code is preferred over clever abstractions.

---

# Before Writing Code

Before implementing a change:

1. Inspect the existing implementation and tests.
2. Read the relevant architecture and platform documentation.
3. Check Tauri capabilities when the change uses windows, plugins, or filesystem access.
4. Distinguish application bugs from operating-system, window-system, or compositor behavior.
5. Keep the plan and implementation scoped to the requested task.

Roadmap entries are passive context and are not active tasks without explicit user approval.

---

# TypeScript

TypeScript strict mode is enabled.

Avoid:

- `any`
- unnecessary type assertions
- silently accepting invalid persisted or IPC data
- duplicating public structures across modules

Prefer:

- interfaces for public object structures
- type aliases for unions
- readonly values where appropriate
- validation and normalization at storage and command boundaries

---

# React

Use functional components and hooks.

Components should focus on presentation, interaction, and view-specific orchestration. Reusable polling, persistence, and settings behavior belongs in hooks. Do not extract a hook solely to move one small, single-use handler out of a component.

Avoid:

- duplicated state and persistence logic
- deeply nested JSX
- unnecessary global state
- expensive work during render

Split components when doing so gives the resulting files clearer responsibilities.

---

# File Organization

Use the existing directories:

- `src/components`: visible React UI
- `src/hooks`: reusable polling, persistence, and application state
- `src/help`: in-app Markdown help and topic metadata
- `src/ideas`: Idea-specific events and file operations
- `src/windows`: secondary window creation and reuse
- `src-tauri/src`: Rust commands and desktop integration
- `src-tauri/capabilities`: permissions scoped by window
- `packaging`: distribution-specific packaging

Avoid generic utility files that collect unrelated behavior.

---

# Rust

Rust code should remain explicit, safe, readable, and warning-free.

- prefer the standard library before adding crates
- keep platform-specific branches localized
- validate command input before invoking OS processes
- return useful errors instead of suppressing failures
- avoid `unsafe` unless it is unavoidable and documented

Do not suppress Clippy warnings to make validation pass.

---

# Tauri Integration

Choose the narrowest integration that fits the task:

1. existing Tauri JavaScript API
2. existing configured Tauri plugin
3. existing focused Rust command
4. new focused Rust command when the previous options are insufficient

Custom commands should perform one task, expose a small interface, validate input, and keep OS-specific details in Rust.

When adding an API or plugin call:

- update the capability for the window that needs it
- grant only the required permission
- do not broaden main-window permissions to solve a secondary-window need
- remember that capability changes require a full Tauri restart

The Idea Editor intentionally has separate dialog, text-file write, store, and window-destroy permissions.

---

# Persistence

Persistent data uses `tauri-plugin-store`.

Current stores are:

- `settings.json`
- `todos.json`
- `ideas.json`

Stored data must be validated and normalized when loaded. Preserve backward compatibility whenever practical; the TODO implementation, for example, migrates legacy memo data.

If a migration is necessary:

- document the old and new formats
- make the migration deterministic
- preserve existing user data
- add tests for valid, invalid, and legacy values

User-selected Markdown files are external outputs, not another application persistence store.

---

# Dependencies

Before adding a dependency, check:

- the TypeScript, React, or Rust standard facilities
- existing project helpers
- Tauri core APIs
- configured Tauri plugins

Add a package or crate only when it provides clear value that the existing stack cannot provide. Explain the need in the change description and avoid broad packages for a narrow task.

---

# Formatting and Line Endings

Source, Markdown, JSON, TOML, TypeScript, Rust, and CSS files use LF line endings. Windows-specific `.bat`, `.cmd`, and `.ps1` files may use CRLF.

Frontend formatting is handled by Biome:

```bash
pnpm lint
pnpm lint:fix
pnpm format
```

Do not manually reformat unrelated files.

From the repository root, check Rust formatting with:

```bash
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
```

To apply Rust formatting, run `cargo fmt` from `src-tauri` or use the same manifest path without `--check`.

---

# Testing and Validation

Frontend unit and component tests use Vitest, Testing Library, and jsdom. Test files live next to their implementation.

Run the frontend validation stack from the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Rust validation either from `src-tauri` or with an explicit manifest path:

```bash
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
cargo build --manifest-path src-tauri/Cargo.toml
```

Run tests that are proportional to the change. Platform-specific desktop behavior still requires verification on the affected environment.

If a command cannot be executed, report exactly which validation was skipped and why. Never claim that a check passed unless it was run successfully.

---

# Error Handling

Fail gracefully and expose useful user-facing errors where recovery is possible.

- do not silently ignore persistence or OS integration failures
- log contextual information without exposing secrets
- treat a cancelled native dialog as a normal no-op
- keep external file and shortcut failures from corrupting local state
- avoid catch blocks that cannot handle or report the error

---

# Performance

Optimize only after identifying an actual problem.

Avoid:

- multiple pollers for the same data
- unnecessary state updates and renders
- unbounded history or editor state
- repeated expensive computations
- background network activity that the feature does not require

The system and network hooks should continue to share the configured update interval. Ping remains user-triggered.

---

# Documentation

When behavior changes:

- update README feature descriptions when the product surface changes
- update architecture and platform documentation when integration changes
- update the roadmap when a planned item becomes implemented
- update `src/help/content` when users need new instructions
- remove obsolete planned-state wording
- keep English and Japanese document pairs equivalent

Documentation must describe the current implementation rather than an intended future design.

---

# Git and Pull Requests

Do not commit or push directly to `main`.

1. Create a dedicated branch from the current default branch before editing.
2. Keep commits and the pull request focused on one related change.
3. Use a typed commit prefix such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, or `ci:`.
4. Avoid unrelated formatting, refactoring, and renames.
5. Update tests and documentation when behavior changes.

Pull request descriptions should explain the submitted changes, their purpose, and relevant validation. Do not include unsuccessful local attempts or local environment problems in the pull request description.

Do not commit or push until the user explicitly requests the publication flow.

---

# Code Review Expectations

Before considering implementation complete, confirm that:

- the change matches the requested scope
- data compatibility and capability permissions were considered
- relevant formatting, lint, type, test, and build checks passed
- platform-specific claims were verified on the appropriate environment or clearly qualified
- documentation reflects the resulting behavior

The goal is to keep the project maintainable for contributors and AI agents as well as functional for users.

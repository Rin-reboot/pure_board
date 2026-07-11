# Development Guide

This document defines the development conventions for **pure_board**.

Architecture is described in `architecture.md`.

AI agents and contributors should follow these conventions unless a task explicitly requires otherwise.

---

# General Principles

Prefer:

* readable code
* explicit behavior
* small changes
* consistency with the existing project

Avoid unnecessary abstractions.

A simple implementation is preferred over a clever implementation.

---

# Before Writing Code

Before implementing a feature:

1. Understand the existing implementation.
2. Follow existing patterns.
3. Reuse code before creating new code.
4. Keep the scope limited to the requested task.

Do not refactor unrelated code.

---

# TypeScript

Always enable strict typing.

Avoid:

* any
* unnecessary type assertions
* implicit assumptions

Prefer:

* interfaces for public structures
* type aliases for unions
* readonly values where appropriate

---

# React

Use functional components.

Prefer hooks over class-style patterns.

Components should be responsible only for rendering and user interaction.

Business logic belongs inside hooks.

Avoid:

* duplicated state
* duplicated logic
* deeply nested JSX

Split components before they become difficult to understand.

---

# Component Design

Each component should have one responsibility.

Good examples:

* CpuCard
* RamCard
* TodoPanel
* TitleBar

Avoid components that perform multiple unrelated tasks.

If a component becomes excessively large, split it into smaller components.

---

# Hooks

Hooks encapsulate reusable logic.

Typical responsibilities include:

* polling
* persistence
* application state
* Tauri communication

Hooks should remain reusable.

Avoid creating hooks for logic that is only used once.

---

# Rust

Rust code should be:

* explicit
* readable
* idiomatic

Prefer standard library functionality whenever practical.

Avoid suppressing warnings.

Keep unsafe code out of the project unless absolutely necessary.

---

# Tauri

Use Tauri APIs before considering third-party libraries.

Platform-specific code should remain isolated.

Tauri commands should:

* perform one task
* return predictable results
* expose simple interfaces

---

# Naming

Choose descriptive names.

Avoid abbreviations unless they are already widely understood.

Examples:

Good

* CpuCard
* TodoPanel
* useSystemUsage

Avoid

* DataManager2
* TempThing
* UtilHelper

---

# File Organization

Prefer small files.

When creating new files:

* place components under `components`
* place reusable hooks under `hooks`
* keep Rust code inside `src-tauri`

Avoid dumping unrelated utilities into generic helper files.

---

# Dependencies

Before adding a dependency:

* check the standard library
* check React
* check Tauri
* check existing project utilities

Add a dependency only when it provides clear value.

Smaller dependency trees are preferred.

---

# Formatting

Frontend formatting is handled by Biome.

Do not manually reformat unrelated files.

Rust formatting should use:

```bash
cargo fmt
```

---

# Linting

Frontend:

```bash
pnpm lint
```

Automatic fixes:

```bash
pnpm lint:fix
```

Rust:

```bash
cargo clippy --all-targets -- -D warnings
```

Warnings should be fixed rather than ignored whenever possible.

---

# Testing

Frontend:

```bash
pnpm test
```

Type checking:

```bash
pnpm typecheck
```

If tests cannot be executed in the current environment, clearly explain why.

Never state that tests passed unless they were actually run.

---

# Persistence

Persistent data should remain backward compatible whenever possible.

Avoid changing stored data formats unless explicitly required.

If a migration becomes necessary:

* document it
* keep it predictable
* preserve existing user data whenever practical

---

# Error Handling

Fail gracefully.

Provide meaningful error messages.

Do not silently ignore errors.

Avoid catching exceptions unless they can be handled correctly.

---

# Performance

Optimize only after identifying an actual bottleneck.

Avoid:

* unnecessary polling
* unnecessary state updates
* unnecessary allocations
* repeated expensive computations

Readability is generally more important than micro-optimizations.

---

# Documentation

Whenever behavior changes:

* update relevant documentation
* remove outdated information
* avoid duplicated documentation

Documentation should reflect the current implementation.

---

# Pull Requests

Each change should focus on a single feature or bug.

Avoid combining:

* formatting
* refactoring
* feature work
* documentation updates

into one large change unless they are directly related.

---

# Commit Philosophy

Small commits are preferred.

Commit messages should clearly describe:

* what changed
* why it changed

---

# Code Review Expectations

Before considering work complete:

* code builds
* formatting passes
* lint passes
* documentation is updated if necessary

The goal is not only to make the code work, but also to keep the project maintainable for future contributors and AI agents.

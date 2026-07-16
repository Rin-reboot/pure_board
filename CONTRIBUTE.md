# Contributing to pure_board

[日本語](CONTRIBUTE-ja.md)

Thank you for your interest in contributing to pure_board. Bug reports, feature proposals, documentation improvements, and code contributions are welcome.

pure_board is a cross-platform Tauri application inspired by the glass-style UI of Windows 11. Please keep changes small, focused, and consistent with the existing architecture.

## Before you start

- Search the existing issues before opening a new one.
- Open an issue when you find a bug or want to propose a feature.
- For small, well-defined fixes, you may open a pull request directly.
- For larger changes, open an issue first so the approach and scope can be discussed.

When reporting a bug, include the operating system, OS version, desktop environment or window system when relevant, reproduction steps, expected behavior, actual behavior, and screenshots or logs when useful. Desktop behavior should be evaluated on the affected supported platform.

## Development setup

Install the following tools:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)
- The [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system

Clone the repository and install dependencies:

```bash
git clone git@github.com:Rin-reboot/pure_board.git
cd pure_board
pnpm install
```

`pnpm install` also installs the repository's Lefthook Git hooks.

Start the desktop application in development mode:

```bash
pnpm tauri dev
```

## Validation

Run the relevant checks before opening a pull request.

Frontend:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Rust:

```bash
cd src-tauri
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
```

Windows 11 and Linux are supported platforms. Transparency, blur, always-on-top, task tray, startup, and other desktop integration behavior may vary by operating system, window system, and compositor. Verify issues on the affected environment and distinguish application defects from platform limitations before changing the implementation.

## Pull requests

- Create a branch from the latest default branch.
- Do not commit or push changes directly to `main`.
- Keep each pull request focused on one change.
- Avoid unrelated refactoring or formatting changes.
- Add or update tests when behavior changes.
- Update documentation when user-visible behavior changes.
- Explain what changed, why it changed, and how it was validated.
- Keep the pull request description focused on the submitted changes. Do not include unsuccessful local attempts or environment problems.
- Preserve backward compatibility for persisted user data whenever practical.

Commit messages must start with an appropriate type such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, or `ci:`.

## Development documentation

- [`AGENTS.md`](AGENTS.md): repository rules for AI coding agents
- [`docs/architecture.md`](docs/architecture.md): application architecture
- [`docs/development.md`](docs/development.md): coding and development conventions
- [`docs/windows.md`](docs/windows.md): platform-specific behavior
- [`docs/roadmap.md`](docs/roadmap.md): planned and proposed functionality

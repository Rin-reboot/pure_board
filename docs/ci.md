# CI and release builds

GitHub Actions checks pull requests and pushes to `main`, and builds release packages for Windows and x86_64 Linux.

## Pull request checks

`.github/workflows/pr.yml` runs for pull requests and pushes to `main`. It uses Node.js 20 and pnpm 9 to run frontend lint, format, type-check, and unit-test commands. It also uses the stable Rust toolchain to check Rust formatting, Clippy warnings, and compilation on Ubuntu.

Distribution packages are not generated during pull request checks. DEB, RPM, AppImage, and Arch packages are all built only by the release workflow, so no Linux distribution receives a separate packaging check on every pull request.

## Release packages

Pushing a tag matching `v*` runs `.github/workflows/build.yml` and publishes these files to the corresponding GitHub Release:

- Windows: MSI and NSIS installers
- Debian-family Linux: DEB package
- RPM-family Linux: RPM package
- General x86_64 Linux: AppImage
- Arch-family Linux, including CachyOS: pacman package (`.pkg.tar.zst`)

Linux DEB, RPM, and AppImage files are built on Ubuntu 22.04 to keep the build baseline stable. The Arch package is compiled separately in an up-to-date Arch Linux container and is intended for rolling-release Arch-family distributions.

The workflow can also be started manually with `workflow_dispatch`. Run it from a `v*` tag so `github.ref_name` identifies the intended release tag; the workflow uses that value as the GitHub Release tag and name.

## Installing the Arch package

Download the `.pkg.tar.zst` file from the GitHub Release, then install it with pacman:

```bash
sudo pacman -U ./pure-board-<version>-1-x86_64.pkg.tar.zst
```

Updates are downloaded from GitHub Releases and installed explicitly.

## Compatibility limits

Linux desktop behavior can vary between Wayland, X11, desktop environments, and compositors. Building a package successfully does not guarantee identical transparency, blur, tray, startup, or always-on-top behavior on every Linux installation.

The current release matrix targets x86_64 only. ARM64 packages are not produced.

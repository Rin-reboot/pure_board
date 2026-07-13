# CI and release builds

GitHub Actions checks pull requests and builds release packages for Windows and x86_64 Linux.

## Pull request checks

`.github/workflows/pr.yml` runs the frontend lint, format, type-check, and unit-test commands. It also checks Rust formatting, Clippy warnings, and compilation on Ubuntu.

The workflow additionally builds the Arch Linux package in the official `archlinux:base-devel` container. This verifies the repository-local `PKGBUILD` against current Arch packages before a release is created.

## Release packages

Pushing a tag matching `v*` runs `.github/workflows/build.yml` and publishes these files to the corresponding GitHub Release:

- Windows: MSI and NSIS installers
- Debian-family Linux: DEB package
- RPM-family Linux: RPM package
- General x86_64 Linux: AppImage
- Arch-family Linux, including CachyOS: pacman package (`.pkg.tar.zst`)

Linux DEB, RPM, and AppImage files are built on Ubuntu 22.04 to keep the build baseline stable. The Arch package is compiled separately in an up-to-date Arch Linux container and is intended for rolling-release Arch-family distributions.

## Installing the Arch package

Download the `.pkg.tar.zst` file from the GitHub Release, then install it with pacman:

```bash
sudo pacman -U ./pure-board-<version>-1-x86_64.pkg.tar.zst
```

This project does not currently publish to the Arch User Repository (AUR). Updates must be downloaded from GitHub Releases and installed explicitly.

## Compatibility limits

Linux desktop behavior can vary between Wayland, X11, desktop environments, and compositors. Building a package successfully does not guarantee identical transparency, blur, tray, startup, or always-on-top behavior on every Linux installation.

The current release matrix targets x86_64 only. ARM64 packages are not produced.

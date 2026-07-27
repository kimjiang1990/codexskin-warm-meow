# Warm Meow Morandi for Codex

A calm, low-saturation Morandi Codex theme built around a seven-cat illustration.

## Downloads

- `packages/warm-meow-morandi-v0.3.10.codexskin-theme` — ready-to-install theme package.
- `packages/build-codexskin-theme.skill` — reusable Skill bundle for building and auditing a CodexSkin theme.

`SHA256SUMS` records the checksums for both packages.

## Install the theme

Use the current official CodexSkin toolkit to import and activate the theme:

```bash
node <toolkit>/scripts/codexskin.mjs install packages/warm-meow-morandi-v0.3.10.codexskin-theme
node <toolkit>/scripts/codexskin.mjs switch warm-meow
```

The theme package includes the artwork and CSS. It is self-contained and does
not load external assets.

## Use the Skill

Install or copy `skill/build-codexskin-theme/` into your Codex Skills directory,
or import the packaged `.skill` file. The Skill uses the official CodexSkin
toolkit for validation and activation, produces both wide and narrow previews,
and audits the real application including sidebars, settings, menus, dialogs,
and tooltips.

## Restart-aware launcher (macOS)

CodexSkin themes are injected at runtime, so a normal restart removes the live
stylesheet. The launcher starts Codex with the official loopback-only debug
endpoint and reapplies the theme.

1. Bootstrap the official toolkit into `~/.cache/codexskin-skills`, or set
   `CODEXSKIN_TOOLKIT_DIR` to its location.
2. Copy `launcher/launch-warm-meow.sh` to `~/.codexskin/bin/` and make it
   executable.
3. Run it whenever you want to start Codex with the theme restored.

`launcher/launch-warm-meow.applescript` is a small macOS app-wrapper source.
It assumes the shell launcher is at `~/.codexskin/bin/launch-warm-meow.sh`.
The launcher does not patch Codex.app.

## Repository layout

- `packages/` — final distributable packages.
- `skill/` — editable reusable Skill source.
- `launcher/` — macOS restart-aware launcher sources.

## Notes

This repository intentionally excludes workspace screenshots, chat content, and
intermediate asset variants.

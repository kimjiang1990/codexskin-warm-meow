---
name: build-codexskin-theme
description: Turn a user-supplied reference image or visual brief into an original Codex desktop skin, including artwork expansion, semantic palette design, managed theme implementation, preview generation, permission-gated activation, real Codex UI inspection, targeted Portal/state repairs, readability auditing, and portable .codexskin-theme export. Use when a user asks to create, redesign, apply, activate, finish, repair, audit, or package a Codex/CodexSkin desktop theme.
---

# Build a complete CodexSkin theme

Create a reversible Codex desktop theme from visual input and finish the real
application workflow. Do not stop at a background image, CSS draft, design
preview, or successful injection marker.

## Use the official toolkit

Treat the current official CodexSkin repository as the schema, validator,
runtime, and package authority.

Bootstrap or refresh it:

```bash
bash scripts/bootstrap_official_toolkit.sh
```

The script prints the toolkit directory. Read these files completely before
creating a theme:

- `<toolkit>/skills/codexskin-theme-creator/SKILL.md`
- `<toolkit>/skills/codexskin-theme-switcher/SKILL.md`
- every reference required by the creator skill

If the official instructions conflict with this skill, follow the current
official instructions. See [references/official-toolkit.md](references/official-toolkit.md)
for command routing and offline behavior.

## 1. Establish the visual contract

Inspect the supplied image before editing it. If no image is supplied, turn the
brief into explicit mood, subject, palette, focal point, and density decisions.

Record:

- layout mode and artwork scope;
- light/dark rationale;
- focal point and text-safe region;
- semantic palette;
- native behaviors to preserve;
- target viewports;
- asset source and transformation note.

For portrait or square artwork, expand the scene to a landscape workspace
composition instead of stretching it. Preserve the subject and move important
art away from text-heavy regions. When choice is subjective, generate two or
three numbered candidates and let the user choose before implementation.

Read [references/art-and-color.md](references/art-and-color.md) when adapting
artwork or building a low-saturation/Morandi palette.

## 2. Create managed theme source

Use the official managed location:

```text
~/.codexskin/themes/<theme-id>/
```

Create only the files required by the official schema. Keep the editable source
there; export a copy to the user's chosen workspace only after verification.

Implement in this order:

1. semantic palette and native token bridges;
2. shell, sidebar, header, content, composer, cards;
3. route-scoped artwork and readability veils;
4. menus, dialogs, tooltips, dropdowns, settings cards;
5. idle, hover, selected, open, disabled, focus, loading, running;
6. output, diff, code, and mounted terminal;
7. narrow-window and reduced-motion rules.

Keep native geometry and hit targets. Prefer verified structural selectors,
roles, and component roots. Never repair a component with broad rules such as
`main *`, `body *`, global opacity, hidden controls, or changed positioning.

Read [references/css-and-portals.md](references/css-and-portals.md) before
repairing a component whose surface luminance changes.

## 3. Validate and produce design previews

Run the official validator and creator against the managed directory:

```bash
node <toolkit>/scripts/codexskin.mjs validate ~/.codexskin/themes/<theme-id>
node <toolkit>/scripts/codexskin.mjs create ~/.codexskin/themes/<theme-id>
```

Fix every static error. Produce full-workspace previews at 1440×900 and
980×760. Label mockups as design previews; do not present them as proof that
the live app works.

## 4. Apply only with authority

Applying, changing settings, or restarting Codex requires user permission.
An explicit request such as “apply”, “activate”, or “应用” is permission to
apply the named theme. Restart only when the user separately approves it or the
official switcher confirmation flow obtains approval.

Use the official switcher and loopback-only endpoint:

```bash
node <toolkit>/scripts/codexskin.mjs switch <theme-id>
node <toolkit>/scripts/codexskin.mjs status
node <toolkit>/scripts/codexskin.mjs audit
```

Never modify the signed application, `app.asar`, authentication data, or bind
the debugging endpoint beyond `127.0.0.1`.

## 5. Audit the real Codex UI

After activation, run:

```bash
node scripts/audit_live_ui.mjs \
  --toolkit <toolkit> \
  --theme <theme-id> \
  --all
```

This is a diagnostic assistant, not a substitute for looking at screenshots.
Inspect the real app at wide and narrow sizes and cover all mounted surfaces in
[references/live-ui-matrix.md](references/live-ui-matrix.md).

Report unmounted surfaces as `not mounted`; never claim they passed. Auxiliary
Codex windows intentionally skipped by the official runtime are not failures.

## 6. Use the exact-state repair loop

When the user reports a visual defect:

1. reproduce the exact route, element, and state;
2. create a fast computed-style check for that state;
3. inspect the live component root and Portal role;
4. rank plausible token, selector, Portal, and transition causes;
5. patch the smallest verified component root;
6. reapply the theme;
7. rerun the same computed-style check and capture a real screenshot;
8. rerun the route audit.

Distinguish a sidebar row from the project information tooltip it opens. Treat
`[role="menu"]`, `[role="dialog"]`, and `[role="tooltip"]` as independent
Portal surfaces unless live DOM evidence shows otherwise. Check descendants
when active-selection foreground tokens override the parent color.

Do not say “fixed” because a stylesheet contains the intended rule. Require the
real computed background, foreground, state, and screenshot to agree.

## 7. Export and hand off

After the final real-app checks:

1. replace the primary preview with a privacy-safe applied-theme screenshot;
2. rerun the official creator;
3. verify the package contains no private screenshots, absolute paths,
   credentials, external CSS, scripts, or unrelated files;
4. copy the `.codexskin-theme` package to the requested destination;
5. report the active id, tested surfaces, unmounted surfaces, package path, and
   restore command separately.

Do not publish or submit the package unless the user asks and confirms they may
publish every included asset.

## Optional: restart persistence

CodexSkin themes are runtime-injected. The managed theme source survives a
restart, but the injected stylesheet does not. Do not claim persistence after a
normal Codex launch.

If the user asks for restart persistence, explain that the official switcher
needs Codex launched with its loopback-only debugging flags. With separate
permission, install a user-owned launcher (not a modification of Codex.app)
that runs:

```bash
node <toolkit>/scripts/codexskin.mjs switch <theme-id> \
  --launch --relaunch --port 9341 --app <codex-app-path>
```

Make clear that the user must launch Codex through that launcher; do not create
a hidden daemon, patch the signed app, or silently terminate a running Codex
session. A real restart test needs explicit approval because it closes the
current app session.

## Completion criteria

Finish only when all applicable items are true:

- artwork and semantic palette match the chosen direction;
- both required previews exist;
- static validation passes;
- the requested theme id is active in every live workspace renderer;
- real home/conversation/settings/Portal/sidebar/narrow checks are complete;
- readability has no unresolved hard failure;
- exact reported defects no longer reproduce;
- final package has been regenerated after the last CSS change.

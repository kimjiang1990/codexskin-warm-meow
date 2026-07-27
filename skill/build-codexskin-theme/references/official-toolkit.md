# Official CodexSkin toolkit

Use the official repository:

```text
https://github.com/yunhe-dev/codexskin-skills.git
```

The bootstrap script installs or refreshes it under:

```text
${CODEXSKIN_TOOLKIT_DIR:-$HOME/.cache/codexskin-skills}
```

Set `CODEXSKIN_TOOLKIT_DIR` when a different cache location is required.

## Commands

Run the CLI from any directory by using its absolute path:

```bash
node <toolkit>/scripts/codexskin.mjs validate <managed-theme-dir>
node <toolkit>/scripts/codexskin.mjs create <managed-theme-dir>
node <toolkit>/scripts/codexskin.mjs list
node <toolkit>/scripts/codexskin.mjs switch <theme-id>
node <toolkit>/scripts/codexskin.mjs status
node <toolkit>/scripts/codexskin.mjs audit
node <toolkit>/scripts/codexskin.mjs rollback
node <toolkit>/scripts/codexskin.mjs restore
```

If direct CLI execution is unavailable in the host, import the module and call
its exported functions from Node. Never recreate the package schema or runtime
in an unverified ad-hoc implementation.

## Offline behavior

Run:

```bash
bash scripts/bootstrap_official_toolkit.sh --offline
```

This succeeds only when a valid cached toolkit already exists. If no cache is
available, stop and explain that the current official validator/runtime cannot
be obtained; do not invent a substitute format.

#!/bin/zsh
# Launch Codex with its official loopback-only debug endpoint, then reapply
# the managed warm-meow theme. This does not modify Codex.app.

set -euo pipefail

toolkit="${CODEXSKIN_TOOLKIT_DIR:-$HOME/.cache/codexskin-skills}"
switcher="$toolkit/scripts/codexskin.mjs"
app="/Applications/ChatGPT.app"
theme="warm-meow"

if [[ ! -f "$switcher" ]]; then
  fallback="/tmp/codexskin-skills/scripts/codexskin.mjs"
  if [[ -f "$fallback" ]]; then
    switcher="$fallback"
  else
    print -u2 "CodexSkin toolkit not found. Set CODEXSKIN_TOOLKIT_DIR or run the Skill bootstrap script."
    exit 1
  fi
fi

exec "$(command -v node)" "$switcher" switch "$theme" \
  --launch --relaunch --port 9341 --app "$app"

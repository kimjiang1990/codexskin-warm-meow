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

node_bin=""
for candidate in /usr/local/bin/node /opt/homebrew/bin/node "$HOME"/.nvm/versions/node/*/bin/node; do
  if [[ -x "$candidate" ]]; then
    node_bin="$candidate"
    break
  fi
done

if [[ -z "$node_bin" ]]; then
  print -u2 "Node.js was not found. Install Node.js or add it to a standard macOS path."
  exit 1
fi

if [[ "${1:-}" == "--dry-run" ]]; then
  print "launcher ready"
  print "node=$node_bin"
  print "switcher=$switcher"
  print "app=$app"
  exit 0
fi

exec "$node_bin" "$switcher" switch "$theme" \
  --launch --relaunch --port 9341 --app "$app"

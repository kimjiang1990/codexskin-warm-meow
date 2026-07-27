#!/bin/sh
set -eu

repository_url="https://github.com/yunhe-dev/codexskin-skills.git"
toolkit_dir="${CODEXSKIN_TOOLKIT_DIR:-${HOME}/.cache/codexskin-skills}"
offline="false"

if [ "${1:-}" = "--offline" ]; then
  offline="true"
elif [ "$#" -gt 0 ]; then
  printf '%s\n' "Usage: $0 [--offline]" >&2
  exit 2
fi

required_file="${toolkit_dir}/scripts/codexskin.mjs"

if [ "$offline" = "false" ]; then
  if [ -d "${toolkit_dir}/.git" ]; then
    git -C "$toolkit_dir" pull --ff-only --quiet
  elif [ -e "$toolkit_dir" ]; then
    printf '%s\n' "Toolkit path exists but is not a Git checkout: ${toolkit_dir}" >&2
    exit 1
  else
    mkdir -p "$(dirname "$toolkit_dir")"
    git clone --depth 1 --quiet "$repository_url" "$toolkit_dir"
  fi
fi

if [ ! -f "$required_file" ]; then
  printf '%s\n' "Official CodexSkin toolkit is unavailable at ${toolkit_dir}" >&2
  exit 1
fi

printf '%s\n' "$toolkit_dir"

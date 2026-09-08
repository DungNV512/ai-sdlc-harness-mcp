#!/usr/bin/env bash
# Post-tool-use: auto-format any Dart file we just wrote / edited.
#
# Rewritten 2026-06-11 to use jq / python via the
# shared `_parse_payload.sh` helper instead of fragile sed regex.
set -euo pipefail

# shellcheck source=./_parse_payload.sh
source "$(dirname "$0")/_parse_payload.sh"

payload="$(cat -)"
path="$(printf '%s' "$payload" | hook_extract '.tool_input.file_path')"

[[ -z "$path" ]] && exit 0

if [[ "$path" == *.dart && -f "$path" ]]; then
  dart format "$path" >/dev/null 2>&1 || true
fi

exit 0

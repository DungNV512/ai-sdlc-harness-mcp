# Shared helper for Claude Code hooks.
#
# Source from another hook:
#   source "$(dirname "$0")/_parse_payload.sh"
#   path="$(printf '%s' "$payload" | hook_extract '.tool_input.file_path')"
#
# Rewritten 2026-07-30:
# - jq is now a hard dependency. The prior python fallback embedded
#   `${path}` into a here-doc via bash interpolation — a
#   shell-injection surface for any future caller that passed a
#   dynamic path — and its `.replace("//", " ")` transform mishandled
#   jq's own `//` alternation operator. Rather than harden the
#   fallback, we require the tool the primary path already uses.
# - `jq // empty` yields empty string on missing keys, so callers can
#   `[[ -z "$path" ]] && exit 0` safely.

hook_extract() {
  local path="$1"
  if ! command -v jq >/dev/null 2>&1; then
    echo "hook_extract: jq is required (brew install jq)." >&2
    return 2
  fi
  jq -r "${path} // empty"
}

#!/usr/bin/env bash
# Local pre-push hook. Runs the coverage gate before a diff leaves
# the laptop. Analyze + per-file test correctness are covered by
# pre-commit; this tier is where the WHOLE-project coverage tiers
# get evaluated.
#
# Coverage tiers (per docs/ai-sdlc/coding-standards.md):
#   - all production code          aggregate floor: 80%
#   - per-module domain layers     floor: 90%
#
# Production code covers both `lib/**` (app shell) and
# `modules/*/lib/**` (Flutter local packages). Domain layers on this
# repo's modular layout live at `modules/*/lib/src/domain/**`. If the
# repo shape changes back to `lib/features/*/domain/**`, update the
# `extract` pattern below.
#
# Fixes 2026-07-30:
# - Coverage % regex accepts integer AND decimal (`100%` vs `100.0%`).
#   lcov 1.16 (brew default) emits `100%` without decimal.
# - Domain-tier extraction uses `lcov --extract` (works on 1.16 and
#   2.x) instead of `lcov --summary --include` (2.x-only, silently
#   returned the whole-repo summary on 1.16).
# - `flutter analyze` removed — pre-commit already ran it on the
#   staged commit; running it again on every push doubles wall time.
set -euo pipefail

flutter test --coverage --reporter compact

if ! command -v lcov >/dev/null 2>&1; then
  echo "lcov not on PATH; coverage gates skipped." >&2
  exit 0
fi

if [[ ! -s coverage/lcov.info ]]; then
  echo "coverage/lcov.info missing or empty; coverage gates skipped." >&2
  exit 0
fi

# Extract percentage from an lcov summary. Accepts both `100%` and
# `99.87%`. Returns the first `lines` percent found; empty on failure.
extract_pct() {
  local file="$1"
  lcov --summary "$file" 2>/dev/null \
    | awk '
        /^ *lines/ {
          for (i = 1; i <= NF; i++) {
            if (match($i, /^[0-9]+(\.[0-9]+)?%$/)) {
              gsub(/%/, "", $i)
              print $i
              exit
            }
          }
        }
      '
}

pct_below() {
  # Bash-safe numeric compare that tolerates integer or decimal input.
  awk -v v="$1" -v t="$2" 'BEGIN{exit !(v+0 < t+0)}'
}

# Aggregate lib/ gate (80%).
agg="$(extract_pct coverage/lcov.info)"
if [[ -n "$agg" ]] && pct_below "$agg" 80; then
  echo "Aggregate coverage $agg% < 80% gate. Push blocked." >&2
  exit 1
fi

# Domain-only gate (90%). `lcov --extract` copies matching lines into
# a temp file that we then summarise — works on both lcov 1.16 and
# 2.x, unlike `--summary --include`.
tmp_dom="$(mktemp -t domainlcov.XXXXXX)"
trap 'rm -f "$tmp_dom"' EXIT
if lcov --extract coverage/lcov.info \
       'lib/features/*/domain/*' \
       'modules/*/lib/src/domain/*' \
     --output-file "$tmp_dom" >/dev/null 2>&1 \
   && [[ -s "$tmp_dom" ]]; then
  dom="$(extract_pct "$tmp_dom")"
  if [[ -n "$dom" ]] && pct_below "$dom" 90; then
    echo "Domain coverage $dom% < 90% gate. Push blocked." >&2
    exit 1
  fi
fi

exit 0

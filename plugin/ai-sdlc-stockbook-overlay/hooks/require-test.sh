#!/usr/bin/env bash
# Pre-tool-use hook: gate NEW dart files that land in production code
# so they arrive with a matching *_test.dart counterpart. Existing
# files pass through with a soft stderr nudge.
#
# Design notes (2026-07-30):
#
# - Accepts both absolute paths (Write/Edit tools always emit
#   absolute) and repo-relative paths. Normalised via `git rev-parse
#   --show-toplevel` so the case matcher works either way.
# - New-file gate only: if the target file already exists on disk we
#   soft-warn but do not block — the loop is used to iterate on
#   skeleton code that predates the hook, and hard-blocking every
#   edit to any test-less file makes the hook unusable.
# - Two production roots are recognised:
#     • `lib/**`                    → tests at `test/**` (app shell)
#     • `modules/<name>/lib/**`     → tests at `modules/<name>/test/**`
#   Each Flutter local package under `modules/` has its own
#   `pubspec.yaml` and its own `test/` — that's the standard
#   `flutter test` / `dart pub workspaces` convention.
# - Whitelist covers real entrypoint / infra paths (`bootstrap.dart`,
#   `app.dart`, `main.dart`, `lib/config/*`, `lib/core/*`) alongside
#   per-module infra (`modules/*/lib/<name>.dart` barrels, `src/di/*`,
#   `src/routes/*`).
#
# Configuration via env vars (space-separated glob lists relative to
# repo root):
#   REQUIRE_TEST_WHITELIST  — space-separated globs skipped from the
#                             test requirement. Defaults below.
set -euo pipefail

# shellcheck source=./_parse_payload.sh
source "$(dirname "$0")/_parse_payload.sh"

: "${REQUIRE_TEST_WHITELIST:=lib/main.dart lib/main_*.dart lib/app.dart lib/my_app.dart lib/bootstrap.dart lib/config/* lib/config/** lib/core/* lib/core/** lib/shared/* lib/shared/** lib/gen/** lib/design_system/** modules/*/lib/*.dart modules/*/lib/src/di/** modules/*/lib/src/routes/**}"

payload="$(cat -)"
raw_path="$(printf '%s' "$payload" | hook_extract '.tool_input.file_path')"

[[ -z "$raw_path" ]] && exit 0

# Normalise absolute → repo-relative so the case patterns work either
# way. On macOS `git rev-parse --show-toplevel` returns the resolved
# path (e.g. /private/var/folders/…) while `pwd` may return the
# symlink form (/var/folders/…) — so we resolve both to the same
# form via a pushd/pwd -P dance before comparing.
resolve() { (cd "$1" 2>/dev/null && pwd -P) || printf '%s' "$1"; }
repo_root_raw="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -n "$repo_root_raw" ]]; then
  repo_root="$(resolve "$repo_root_raw")"
else
  repo_root=""
fi

if [[ -n "$repo_root" && "$raw_path" == /* ]]; then
  # Absolute path — resolve its directory (file may not yet exist)
  # so a symlinked prefix matches the resolved repo_root.
  dir_of_path="$(dirname "$raw_path")"
  resolved_dir="$(resolve "$dir_of_path")"
  resolved_path="$resolved_dir/$(basename "$raw_path")"
  if [[ "$resolved_path" == "$repo_root"/* ]]; then
    path="${resolved_path#"$repo_root"/}"
  else
    # Outside the repo — hook is a no-op.
    exit 0
  fi
else
  path="$raw_path"
fi

# Only guard *.dart files. Route to the correct test-root by prefix:
#   - `lib/**`                → tests at `test/**`
#   - `modules/<name>/lib/**` → tests at `modules/<name>/test/**`
case "$path" in
  lib/*.dart)
    rel="${path#lib/}"
    test_path="test/${rel%.dart}_test.dart"
    ;;
  modules/*/lib/*.dart)
    # Split on /lib/ so we get modules/<name> as prefix and the
    # remainder as the file path inside src/.
    module_prefix="${path%%/lib/*}"       # e.g. modules/auth
    inside_lib="${path#*/lib/}"           # e.g. src/domain/foo.dart
    test_path="${module_prefix}/test/${inside_lib%.dart}_test.dart"
    ;;
  *) exit 0 ;;
esac

# Whitelist bypass. We interpret the whitelist globs with
# `find`-style semantics: `*` matches any char EXCEPT `/`, and `**`
# matches any char including `/`. Bash's builtin `[[ x == pat ]]` does
# NOT distinguish `*` from `**` — plain `*` there greedily matches
# across `/`, which lets `lib/config/*` swallow `lib/config/a/b/c.dart`
# and `modules/*/lib/*.dart` swallow every dart file under any module.
# We convert each pattern to an anchored regex and match with `=~`.
#
# `set -f` disables filename expansion so the whitelist words below
# aren't expanded against the filesystem before the loop runs.
set -f
matched=0
for pattern in $REQUIRE_TEST_WHITELIST; do
  # Escape regex metacharacters other than * and /, then swap
  # `**` → `.*` (any chars including /), `*` → `[^/]*` (any chars
  # not including /), and anchor both ends.
  regex=""
  i=0
  while (( i < ${#pattern} )); do
    ch="${pattern:$i:1}"
    if [[ "$ch" == "*" ]]; then
      # Check for `**`
      if [[ "${pattern:$i:2}" == "**" ]]; then
        regex+=".*"
        (( i += 2 ))
        continue
      fi
      regex+="[^/]*"
      (( i += 1 ))
      continue
    fi
    # Escape regex metacharacters.
    case "$ch" in
      .|+|?|\(|\)|\[|\]|\{|\}|\^|\$|\|) regex+="\\$ch" ;;
      *) regex+="$ch" ;;
    esac
    (( i += 1 ))
  done
  regex="^${regex}\$"
  if [[ "$path" =~ $regex ]]; then
    matched=1
    break
  fi
done
set +f
if (( matched == 1 )); then
  exit 0
fi

# `path` here is repo-relative. Resolve against $repo_root when
# available so we correctly test for existence regardless of the
# working directory the hook was invoked from.
if [[ -n "${repo_root:-}" ]]; then
  abs_target="$repo_root/$path"
  abs_test="$repo_root/$test_path"
else
  abs_target="$path"
  abs_test="$test_path"
fi

if [[ -e "$abs_test" ]]; then
  exit 0
fi

if [[ -e "$abs_target" ]]; then
  # Existing file, no test — soft warn, do not block. Iterating on a
  # pre-existing untested file is a legitimate part of the loop.
  echo "WARN: $path has no matching test at $test_path — consider adding one." >&2
  exit 0
fi

# New file + no test — block. This is the test-first gate.
echo "BLOCK: creating $path requires a matching test at $test_path. Write the test first (Phase 5 sub-step of /implement)." >&2
exit 2

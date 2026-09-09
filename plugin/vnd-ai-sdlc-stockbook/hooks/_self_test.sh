#!/usr/bin/env bash
# Smoke tests for the .claude/hooks/ scripts.
#
# Run from repo root:
#   bash .claude/hooks/_self_test.sh
#
# Exit 0 = all pass. Non-zero = at least one hook misbehaves. The
# assertions here use self-contained fixtures created in a temp dir
# so the tests don't depend on which files happen to exist in the
# repo today.
#
# Also covered by pre-commit.sh so the test suite runs on every
# commit — a regression in any hook fails locally before it lands.
set -euo pipefail

cd "$(dirname "$0")/../.."   # repo root

pass=0
fail=0
log() { printf '  %s %s\n' "$1" "$2"; }

# Fixture tree — pretend-repo with two files that exist and one
# whose test peer exists.
fixture_root="$(mktemp -d -t claudehookfx.XXXXXX)"
trap 'rm -rf "$fixture_root"' EXIT
mkdir -p "$fixture_root/lib/features/foo/domain"
mkdir -p "$fixture_root/lib/config"
mkdir -p "$fixture_root/lib/shared"
mkdir -p "$fixture_root/test/features/foo/domain"
echo 'class Foo {}' > "$fixture_root/lib/features/foo/domain/foo.dart"
echo 'void main() {}' > "$fixture_root/test/features/foo/domain/foo_test.dart"
echo 'class Bar {}' > "$fixture_root/lib/features/foo/domain/bar.dart"
echo 'class C {}' > "$fixture_root/lib/config/c.dart"
echo 'class S {}' > "$fixture_root/lib/shared/s.dart"
# Init the fixture as a git repo so `git rev-parse --show-toplevel`
# resolves inside require-test.sh.
(cd "$fixture_root" && git init -q && git config user.email t@t && git config user.name t && git add -A && git commit -qm init)

real_repo="$(pwd)"

assert_exit() {
  local description="$1" expected="$2" hook="$3" payload="$4"
  # Optional 5th arg is a directory to cd into before firing the
  # hook. Used by the fixture-based require-test.sh assertions so
  # git rev-parse --show-toplevel resolves inside the fixture repo,
  # not the real repo.
  local run_dir="${5:-$real_repo}"
  # Optional 6th arg is a single VAR=value string exported into the
  # hook's env — used to override defaults like REQUIRE_TEST_WHITELIST.
  local env_override="${6:-}"
  local actual=0
  local hook_abs
  case "$hook" in
    /*) hook_abs="$hook" ;;
    *)  hook_abs="$real_repo/$hook" ;;
  esac
  (
    cd "$run_dir"
    if [[ -n "$env_override" ]]; then
      # Split on first `=` to get VAR and VALUE.
      local var="${env_override%%=*}"
      local val="${env_override#*=}"
      export "$var"="$val"
    fi
    printf '%s' "$payload" | bash "$hook_abs" >/dev/null 2>&1
  ) || actual=$?
  if [[ "$actual" == "$expected" ]]; then
    log "✓" "$description"; pass=$((pass+1))
  else
    log "✗" "$description — expected exit $expected, got $actual"
    fail=$((fail+1))
  fi
}

# --- block-generated.sh ---
assert_exit "block-generated allows lib/feed.dart"           0 .claude/hooks/block-generated.sh \
  '{"tool_input":{"file_path":"lib/features/feed/data/feed.dart"}}'
assert_exit "block-generated blocks lib/feed.g.dart"         2 .claude/hooks/block-generated.sh \
  '{"tool_input":{"file_path":"lib/features/feed/data/feed.g.dart"}}'
assert_exit "block-generated blocks lib/x.freezed.dart"      2 .claude/hooks/block-generated.sh \
  '{"tool_input":{"file_path":"lib/x.freezed.dart"}}'
assert_exit "block-generated blocks lib/x.mocks.dart"        2 .claude/hooks/block-generated.sh \
  '{"tool_input":{"file_path":"test/x.mocks.dart"}}'
assert_exit "block-generated handles escaped quotes safely"  0 .claude/hooks/block-generated.sh \
  '{"tool_input":{"file_path":"lib/x\"y.dart"}}'
assert_exit "block-generated blocks absolute *.g.dart"       2 .claude/hooks/block-generated.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/lib/x.g.dart\"}}"

# --- require-test.sh ---
# Whitelisted paths — pass through even without matching tests.
assert_exit "require-test allows relative lib/config/foo.dart"    0 .claude/hooks/require-test.sh \
  '{"tool_input":{"file_path":"lib/config/foo.dart"}}'
assert_exit "require-test allows relative lib/shared/widget.dart" 0 .claude/hooks/require-test.sh \
  '{"tool_input":{"file_path":"lib/shared/widget.dart"}}'
assert_exit "require-test allows absolute lib/config/c.dart" 0 .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/lib/config/c.dart\"}}" \
  "$fixture_root"
# Existing file with no test — SOFT WARN, exits 0.
assert_exit "require-test soft-warns on existing untested file" 0 .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/lib/features/foo/domain/bar.dart\"}}" \
  "$fixture_root"
# Existing file WITH matching test — passes.
assert_exit "require-test passes when test peer exists" 0 .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/lib/features/foo/domain/foo.dart\"}}" \
  "$fixture_root"
# New file with no test — HARD BLOCK.
assert_exit "require-test blocks NEW untested lib file" 2 .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/lib/features/foo/domain/brand_new.dart\"}}" \
  "$fixture_root"

# --- require-test.sh whitelist over-match regression ---
# Bash `[[ x == pat ]]` used to treat `*` as "any chars including /",
# so `lib/config/*` swallowed deep paths and `modules/*/lib/*.dart`
# swallowed every module file. The hook now converts glob → anchored
# regex where `*` = `[^/]*` and `**` = `.*`. These asserts lock the
# fix.

# `lib/config/*` (single-star) should whitelist ONLY immediate
# children. `lib/config/**` (double-star) covers depth. The default
# WHITELIST includes both, so a deep new file under lib/config still
# passes with the default. To lock the single-star semantics we
# override WHITELIST to a single-star-only value.
mkdir -p "$fixture_root/lib/config"
echo 'class C {}' > "$fixture_root/lib/config/child.dart"
mkdir -p "$fixture_root/lib/config/deep/nested"
assert_exit "require-test single-star lib/config/* whitelists immediate child" 0 \
  .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/lib/config/child.dart\"}}" \
  "$fixture_root" \
  "REQUIRE_TEST_WHITELIST=lib/config/*"
# Deep new file with SINGLE-STAR ONLY whitelist — must BLOCK
# (the fix; the buggy behaviour was `*` matching across / and
# swallowing this).
assert_exit "require-test single-star lib/config/* does NOT cover deep" 2 \
  .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/lib/config/deep/nested/brand_new.dart\"}}" \
  "$fixture_root" \
  "REQUIRE_TEST_WHITELIST=lib/config/*"
# Double-star DOES cover deep — sanity.
assert_exit "require-test double-star lib/config/** covers deep files" 0 \
  .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/lib/config/deep/nested/brand_new.dart\"}}" \
  "$fixture_root" \
  "REQUIRE_TEST_WHITELIST=lib/config/**"

# Module barrel is whitelisted (matches `modules/*/lib/*.dart`).
mkdir -p "$fixture_root/modules/newsfeed/lib"
assert_exit "require-test whitelists module barrel modules/newsfeed/lib/newsfeed.dart" 0 \
  .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/modules/newsfeed/lib/newsfeed.dart\"}}" \
  "$fixture_root"
# BUT a NEW deep dart file under modules/*/lib/src/domain/ must BLOCK —
# the old glob would have matched `modules/*/lib/*.dart` greedily and let it through.
mkdir -p "$fixture_root/modules/newsfeed/lib/src/domain/entities"
assert_exit "require-test blocks NEW modules/*/lib/src/**/*.dart (over-match regression)" 2 \
  .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/modules/newsfeed/lib/src/domain/entities/brand_new.dart\"}}" \
  "$fixture_root"
# DI stub whitelisted via `modules/*/lib/src/di/**`.
mkdir -p "$fixture_root/modules/newsfeed/lib/src/di"
assert_exit "require-test whitelists modules/newsfeed/lib/src/di/newsfeed_injection.dart" 0 \
  .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/modules/newsfeed/lib/src/di/newsfeed_injection.dart\"}}" \
  "$fixture_root"
# Existing test peer under modules — passes.
mkdir -p "$fixture_root/modules/newsfeed/test/src/domain/entities"
echo 'class T {}' > "$fixture_root/modules/newsfeed/lib/src/domain/entities/foo.dart"
echo 'void main() {}' > "$fixture_root/modules/newsfeed/test/src/domain/entities/foo_test.dart"
assert_exit "require-test passes when module test peer exists" 0 \
  .claude/hooks/require-test.sh \
  "{\"tool_input\":{\"file_path\":\"$fixture_root/modules/newsfeed/lib/src/domain/entities/foo.dart\"}}" \
  "$fixture_root"

# --- format-dart.sh ---
assert_exit "format-dart no-ops on missing path"             0 .claude/hooks/format-dart.sh \
  '{"tool_input":{}}'
assert_exit "format-dart no-ops on non-dart file"            0 .claude/hooks/format-dart.sh \
  '{"tool_input":{"file_path":"README.md"}}'

# --- empty payload ---
for hook in block-generated.sh require-test.sh format-dart.sh; do
  assert_exit "empty payload — $hook passes through"         0 ".claude/hooks/$hook" '{}'
done

# --- multi file_path keys (sub-tool invocations) ---
# Verifies that jq picks the top-level tool_input.file_path, not the
# first arbitrary string match.
assert_exit "multi file_path picks tool_input.file_path"     2 .claude/hooks/block-generated.sh \
  '{"sub":{"file_path":"lib/ok.dart"},"tool_input":{"file_path":"lib/x.freezed.dart"}}'

# --- log-agent-usage.sh (dry: writes to a temp metrics dir) ---
tmp_metrics_dir="$(mktemp -d -t claudemetricsfx.XXXXXX)"
trap 'rm -rf "$fixture_root" "$tmp_metrics_dir"' EXIT
CLAUDE_METRICS_DIR="$tmp_metrics_dir" assert_exit "log-agent-usage accepts Task payload" 0 .claude/hooks/log-agent-usage.sh \
  '{"tool_name":"Task","tool_input":{"subagent_type":"reviewer","description":"self-test dispatch"},"tool_response":{"is_error":false,"usage":{"input_tokens":10,"output_tokens":20},"duration_ms":100}}'

printf '\n%d passed, %d failed.\n' "$pass" "$fail"
[[ "$fail" -eq 0 ]] || exit 1

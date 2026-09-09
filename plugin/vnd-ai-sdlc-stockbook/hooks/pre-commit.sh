#!/usr/bin/env bash
# Local pre-commit hook. Runs format check + analyze on the staged
# Dart files. Also fast-fails if analysis_options.yaml or
# pubspec.yaml is staged, since those affect the whole tree.
#
# Wired via `git config core.hooksPath .claude/hooks` (see
# .claude/hooks/install.sh).
#
# Notes 2026-07-30:
# - Bash-3 compatible array read (macOS default /bin/bash is 3.2 and
#   `mapfile` silently produces an empty array on older shells).
# - Full `flutter test` moved to pre-push — running it on every
#   commit turned every save into a 2–10 minute wait. Pre-commit
#   keeps the cheap gates only.
# - If the staged set changes analysis_options.yaml or pubspec.yaml,
#   we DO run `flutter analyze` over the whole tree because those
#   files have project-wide effect. Otherwise analyze is scoped to
#   the staged Dart files.
# - Self-test runs at the end so hook regressions never ship.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

# Collect staged files.
staged_all=()
while IFS= read -r line; do
  staged_all+=("$line")
done < <(git diff --cached --name-only --diff-filter=ACMR || true)

# Filter to dart files.
dart_files=()
for f in "${staged_all[@]:-}"; do
  [[ "$f" == *.dart ]] && dart_files+=("$f")
done

# Any project-wide config staged? If so, whole-tree analyze is
# warranted.
project_wide_change=0
for f in "${staged_all[@]:-}"; do
  case "$f" in
    analysis_options.yaml|pubspec.yaml|.gitignore)
      project_wide_change=1
      break ;;
  esac
done

if (( ${#dart_files[@]} > 0 )); then
  dart format --output=none --set-exit-if-changed "${dart_files[@]}"
fi

if (( ${#dart_files[@]} > 0 )) || (( project_wide_change == 1 )); then
  if (( project_wide_change == 1 )); then
    flutter analyze
  else
    flutter analyze "${dart_files[@]}"
  fi
fi

# Hook self-test — cheap and catches regressions before landing.
if [[ -x "$repo_root/.claude/hooks/_self_test.sh" ]]; then
  bash "$repo_root/.claude/hooks/_self_test.sh"
fi

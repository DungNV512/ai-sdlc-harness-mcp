#!/usr/bin/env bash
# Wire the in-repo hooks into git's hook dispatcher.
#
# Run from the repo root once per clone:
#   bash .claude/hooks/install.sh
#
# The recommended path is `git config core.hooksPath .claude/hooks`
# so the hooks live under version control and stay in sync with
# whatever branch you have checked out. This script sets that config
# and prints a summary.
#
# Alternate mode (per-hook symlink into .git/hooks/) is available via
# `install.sh --symlink` if a teammate needs to keep their existing
# .git/hooks/* alongside the shared ones.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

mode="${1:-corehookspath}"

case "$mode" in
  corehookspath)
    git config core.hooksPath .claude/hooks
    echo "✓ set core.hooksPath = .claude/hooks"
    echo "  pre-commit / pre-push / commit-msg (etc.) now resolve to .claude/hooks/*"
    ;;
  --symlink)
    for hook in pre-commit pre-push; do
      target=".git/hooks/$hook"
      source_path="../../.claude/hooks/$hook.sh"
      [[ -e "$target" && ! -L "$target" ]] && {
        mv "$target" "$target.bak.$(date +%s)"
      }
      ln -sfn "$source_path" "$target"
      chmod +x ".claude/hooks/$hook.sh"
      echo "✓ symlinked $target -> $source_path"
    done
    ;;
  *)
    echo "usage: install.sh [corehookspath|--symlink]" >&2
    exit 2
    ;;
esac

# Sanity: self-test, if one is present. Standard alone doesn't ship
# .claude/hooks/_self_test.sh -- some overlay plugins do (it tests their
# own hooks). Only run it, and only fail the install on it, when it
# actually exists.
if [[ -f .claude/hooks/_self_test.sh ]]; then
  if bash .claude/hooks/_self_test.sh >/dev/null 2>&1; then
    echo "✓ hook self-test passed"
  else
    echo "✗ hook self-test FAILED — run bash .claude/hooks/_self_test.sh for detail" >&2
    exit 1
  fi
else
  echo "  (no .claude/hooks/_self_test.sh present -- skipping self-test)"
fi

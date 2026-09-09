#!/usr/bin/env bash
# Block edits to generated Dart files. Re-run build_runner instead.
#
# Notes:
# - Accepts either absolute (Write/Edit tool convention) or repo-
#   relative paths — the case pattern uses `*` prefix wildcard so the
#   suffix suffices.
# - `*.mocks.dart` matched too — regenerate mocks via build_runner
#   (mockito / mocktail codegen) rather than hand-editing.
# - The historical slang branch (lib/i18n/i18n.g.dart) was removed
#   2026-07-30 because `slang` is not declared in pubspec.yaml — the
#   generic `*.g.dart` clause covers it if slang lands later, and the
#   error will (correctly) point at build_runner.
# - The historical Figma-tokens branch was removed 2026-07-30 because
#   the Figma-to-Dart pipeline was replaced with the vendored
#   `flutter_vnd_ui_component` package (commit 1b576e5). No
#   `/figma-sync` command exists.
set -euo pipefail

# shellcheck source=./_parse_payload.sh
source "$(dirname "$0")/_parse_payload.sh"

payload="$(cat -)"
path="$(printf '%s' "$payload" | hook_extract '.tool_input.file_path')"

[[ -z "$path" ]] && exit 0

case "$path" in
  # Codegen siblings — never hand-edit.
  *.g.dart|*.freezed.dart|*.gr.dart|*.config.dart|*.mocks.dart)
    echo "BLOCK: $path is generated. Run: dart run build_runner build --delete-conflicting-outputs" >&2
    exit 2 ;;
esac

exit 0

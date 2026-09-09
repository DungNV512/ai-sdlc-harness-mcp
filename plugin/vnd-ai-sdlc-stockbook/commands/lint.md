---
description: Format, analyze, regenerate code, ensure zero warnings.
argument-hint: (no args)
allowed-tools: Bash, Read, Edit
---

# /lint

Phase 8.

## Steps

1. `dart format .`
2. If any `*.dart` references generated files older than their
   source (`*.freezed.dart`, `*.g.dart`), run:
   `dart run build_runner build --delete-conflicting-outputs`
3. `flutter analyze` — exit non-zero must fail the run.
4. `dart format --output=none --set-exit-if-changed .` — verify
   idempotent.
5. Report counts: errors, warnings, infos. Goal: 0 / 0 / acceptable.

## Notes

Never silence a lint with `// ignore:` without a one-line reason on
the same line.

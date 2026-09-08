---
description: Generate Clean Architecture folders + stub files for a new feature (inside an existing module) or a new module (Flutter local package).
argument-hint: <feature-or-module-slug> [--module=<name>|--new-module]
allowed-tools: Read, Glob, Write, Edit, Bash
---

# /scaffold-feature $ARGUMENTS

Phase 4. Invoke the `flutter-feature-scaffold` skill
(`.claude/skills/flutter-feature-scaffold/SKILL.md`).

## Modes

- `/scaffold-feature <slug> --module=<name>` — small feature scaffolded
  under `modules/<name>/lib/src/<slug>/` (with mirrored tests under
  `modules/<name>/test/src/<slug>/`). Use this when the feature
  belongs inside an existing module (`auth`, `newsfeed`, …).
- `/scaffold-feature <name> --new-module` — a whole new Flutter
  local package under `modules/<name>/`, wired into the shell's
  `pubspec.yaml`, DI container, and router. Use this when the
  feature has its own release cadence or its own DI barrel.

If neither flag is passed, ASK which mode before scaffolding — do
not guess.

## Steps

Delegated to the skill. After the skill returns, verify:

1. `flutter analyze` (on the touched module path) exits 0.
2. `flutter test` runs (may be zero tests — that's fine; `/implement`
   lands the red suite next).
3. `git status` shows only newly scaffolded files (no accidental
   churn elsewhere).
4. If a new module was created, confirm the shell's `pubspec.yaml`,
   `lib/core/di/injection_container.dart`, and
   `lib/config/routes/app_router.dart` all reference it.

## Assumed pubspec state

- `flutter_bloc`, `go_router`, `get_it`, `dio`, `dartz` — present
  via `modules/core` (re-exported from `package:core/core.dart`).
- `freezed`, `retrofit`, `injectable`, `slang` — not present in
  any module's `pubspec.yaml` as of 2026-07-30. If a stub requires
  one, add it via a dedicated `chore: add <dep>` commit BEFORE
  scaffolding, or omit the annotation from the stub.

## Anti-patterns to refuse

- Scaffolding at `lib/features/<slug>/` (pre-modular layout;
  use `modules/<name>/lib/src/<slug>/` instead;
  superseded — see `docs/architecture/01-frontend-flutter.md`
  masthead).
- Using `@RoutePage` (`auto_route`) or `@module` (`injectable`)
  in stubs — neither is a dependency; use raw `go_router` and
  raw `get_it`.
- Skipping the AGENTS.md / README.md / docs/CONTEXT.md files when
  creating a new module. Future contributors need module-local
  context.

## DoD

`flutter analyze` clean on the touched module; `flutter run` still
boots the shell; no TODO without a ticket id.

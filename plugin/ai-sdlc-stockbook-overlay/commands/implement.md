---
description: Write the minimum code to turn the red test suite green.
argument-hint: <feature-slug> [<target>]
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# /implement $ARGUMENTS

Phases 5 + 6 (Test-first + Implement). Pre-conditions: skeleton
compiles.

## Steps

### Phase 5 — Test-first (do this before writing any production code)

1. Read `docs/specs/<slug>/traceability.yaml` and resolve its `module`.
   For each entity, usecase, and bloc in the spec, write failing tests under
   `modules/<module>/test/src/<slug>/` (or the new module test tree):
   - `bloc_test` for blocs / cubits.
   - Tabular tests for usecases.
   - `alchemist` goldens for widgets.
2. Run `flutter test modules/<module>/test/src/<slug>/ --reporter expanded` and
   confirm the suite is red for the *right* reason (assertion failure,
   not import error).
3. Capture the failing test names.

### Phase 6 — Turn the suite green

4. Apply prompt **P4** (minimal implementation). Touch only the module paths
   listed in the manifest: `modules/<module>/lib/src/<slug>/` and its matching
   test tree. Shell/route integration is allowed only at the paths declared
   in the manifest; cross-cutting changes require an ADR.
5. Implement the smallest possible code per failing test, in this
   order: entities -> failures -> repository impl -> usecases -> bloc
   -> widgets -> page -> route binding.
6. After each file, re-run the relevant test file; report which tests
   went green.
7. **Do not** add public APIs the tests do not exercise.
8. When suite is green, run `dart format .` and `flutter analyze`.
9. Stop. Next: `/review`.

## Anti-patterns to refuse

- Adding "useful" helpers not requested by a test.
- Refactoring outside `<slug>/` without an ADR.
- Touching `*.g.dart` by hand (re-run codegen instead).

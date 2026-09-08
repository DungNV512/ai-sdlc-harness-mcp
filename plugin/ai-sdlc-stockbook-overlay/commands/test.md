---
description: Run unit + widget + golden + integration suites with coverage gate.
argument-hint: [unit|widget|golden|integration|all]
allowed-tools: Bash, Read
---

# /test $ARGUMENTS

Phase 9. Default `$ARGUMENTS` = `all`.

## Steps

1. `unit`:        `flutter test test/ --exclude-tags golden`
2. `widget`:      included in unit run; filter by `*_widget_test.dart`
3. `golden`:      `flutter test --tags golden --update-goldens=false`
4. `integration`: `flutter test integration_test/`
5. Coverage:
   `flutter test --coverage && lcov --summary coverage/lcov.info`
6. Enforce: `lib/` + `modules/*/lib/` >= 80 %,
   `modules/*/lib/src/domain/` >= 90 %.
7. On golden diff: do **not** auto-`--update-goldens`. Print the diff
   path and require the user to attach screenshots and re-run with
   `/test golden -u` explicitly.

## Output

Single summary block:

```
unit:       N passed, M failed
widget:     ...
golden:     ...
integration:...
coverage:   lib XX%, domain YY%
gate:       PASS|FAIL
```

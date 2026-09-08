---
description: Run the self-review checklist against the working diff.
argument-hint: [<feature-slug>]
allowed-tools: Read, Grep, Glob, Bash, Edit
---

# /review $ARGUMENTS

Phase 7. Delegate to the `reviewer` subagent (never let the same
session that implemented also approve).

## Steps

1. Compute the diff:
   `git diff --name-only origin/dev...HEAD` (fallback to staged).
2. For each changed file, open it and apply prompt **P5**.
3. Walk every section of `docs/ai-sdlc/review-checklist.md`.
4. Produce a table:

   | file | line | finding | severity | action |

   Severity = `block | major | minor | nit`. Actions = `fix now`,
   `add // REVIEW: comment`, `waive (reason)`.
5. Apply the fixes. Re-run the project's lint and test commands (e.g.
   `flutter analyze`/`flutter test` for a Flutter project) after every
   batch.
6. Output a final review summary <= 200 words for the PR body.

## Refuse to advance if

- Any `block` or `major` finding is unresolved.
- Tests have been weakened or `// ignore: ...` added without reason.

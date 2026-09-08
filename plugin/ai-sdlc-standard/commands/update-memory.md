---
description: Append findings to docs/memory/ and prune CLAUDE.md if needed.
argument-hint: <topic-slug> "<short note>"
allowed-tools: Read, Glob, Write, Edit
---

# /update-memory $ARGUMENTS

Apply prompt **P10**.

## Steps

1. `$1` = topic slug (e.g. `auth`, `caching`, `i18n`, or, for a Flutter
   project via an overlay, `bloc`/`dio`/`goldens`...).
2. Ensure `docs/memory/<topic-slug>.md` exists; create with header
   if not:

   ```
   # Memory: <topic>

   Persistent learnings. Newest entries on top.
   ```

3. Prepend a dated bullet:

   ```
   ## 2026-MM-DD
   - <note> (context: <commit / PR / spec link>)
   ```

4. If the note represents a new project-wide rule, also update
   `CLAUDE.md` section 5 and reference the memory file.
5. Keep each memory file < 200 lines; archive overflow to
   `docs/memory/archive/<topic>-<year>.md`.

## Refuse

- Memory entries containing PII, secrets, or quotes from external
  copyrighted material.

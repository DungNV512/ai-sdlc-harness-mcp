---
description: Open a new Architecture Decision Record from the template.
argument-hint: <slug> [<title in quotes>]
allowed-tools: Read, Glob, Write, Bash
---

# /adr $ARGUMENTS

Phase 3. Use when a change affects public API, persistence shape,
security posture, or cross-feature boundaries.

## Steps

1. Read `docs/ai-sdlc/adr/template.md`.
2. Compute next number:
   `ls docs/ai-sdlc/adr/ | grep -E '^[0-9]{4}-' | sort | tail -1`.
3. **Duplicate-number guard** (added per audit-2026-07-20 finding).
   Before writing, verify no other ADR file already claims the number
   you computed. Tombstone files (whose title starts with `RENUMBERED`
   or `MOVED TO`) are excluded — that is the sanctioned pattern for
   preserving historical numbers.
   ```bash
   ls docs/ai-sdlc/adr/ \
     | grep -E '^[0-9]{4}-' \
     | while read -r f; do
         head -1 "docs/ai-sdlc/adr/$f" \
           | grep -qE 'RENUMBERED|MOVED TO' || echo "$f"
       done \
     | grep -oE '^[0-9]{4}' | sort | uniq -d
   ```
   The command must print nothing. If it prints a number, that number
   is already duplicated by two *live* ADRs — STOP. Fix the existing
   collision (renumber the newer file, tombstone the older, or delete
   the duplicate) BEFORE proceeding. Never create a file whose number
   would introduce or perpetuate a *live* collision.
4. Create `docs/ai-sdlc/adr/<NNNN>-<slug>.md` from the template.
5. Pre-fill: date = today, status = `Proposed`, deciders = caller +
   architect agent.
6. Apply prompt **P6**: at least two real options, explicit
   trade-offs, follow-ups.
7. Link the ADR from the relevant spec / plan.
8. Stop and ask the human deciders for approval before flipping
   status to `Accepted`.

## Anti-patterns to refuse

- Creating an ADR with a number that already exists on disk. Sequential
  numbering is the MADR contract; use tombstoning (see
  `docs/ai-sdlc/adr/0008-figma-source-of-truth.md` for the pattern) if a
  historical ADR was renumbered.
- Skipping the duplicate-number guard (step 3) because "the last ADR is
  clearly N-1". The guard costs one bash call; the audit-2026-07-20
  false-positive proved the value of an explicit check.

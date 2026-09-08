---
description: Intake a feature request and produce a structured plan + sub-tasks.
argument-hint: <feature-name> [<ticket-id-or-url>]
allowed-tools: Read, Grep, Glob, Write, Edit
---

# /plan-feature $ARGUMENTS

You are running **Phase 1 (Plan)** of the AI-SDLC. Do not implement
anything. Default agent: `architect`.

## Steps

1. Parse `$ARGUMENTS`:
   - First token = feature slug (`feed`, `post-composer`, ...).
   - Remaining = optional ticket id or URL.
2. Read `CLAUDE.md`, `docs/ai-sdlc/integration.md`, and
   `docs/ai-sdlc/phases.md` (Phase 0–1 only).
3. Require `docs/specs/<feature>/traceability.yaml`. If it is missing,
   stop and run the intake bridge first. Verify its sources are current and
   read the selected task files before planning.
4. Read any existing `docs/specs/<feature>/` or related code under
   `modules/` and `lib/`.
5. Apply prompt **P1** (restate-then-plan) then **P2** (layered
   design — high level only).
5. Write `docs/specs/<feature-slug>/plan.md` using this structure:

   ```
   # <Feature> — Plan

    ## Source
    - Ticket: <link>
    - Manifest: `docs/specs/<feature-slug>/traceability.yaml`
    - Sources: <source IDs and raw/wiki links>
    - Tasks: <task IDs and paths>
    - Requested by: <role>
   - Date: <YYYY-MM-DD>

   ## Summary (3 sentences)

   ## User stories
   - US-1 As a ..., I want ..., so that ...

   ## Affected layers
   - Presentation: ...
   - Domain: ...
   - Data / API: ...
   - Backend / infra: ...

   ## Sub-tasks
   - [ ] T-1 ...
   - [ ] T-2 ...

   ## Open questions
   - Q-1 ...

   ## Risks / unknowns
   - ...

   ## Next phase
   - /spec <feature-slug>
   ```

6. End with a one-line summary: "Plan filed at <path>. Open questions:
   N. Next: /spec <slug>."

## Stop conditions

- If the FR is too vague to plan, list the missing info as `Q:` items
  and stop. Do **not** invent requirements.
- If a source is stale or a task/source relationship is unresolved, stop and
  report the bridge blocker. Do not infer API or UI contract details.

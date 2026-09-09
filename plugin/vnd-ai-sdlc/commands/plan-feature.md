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
2. Read `docs/ai-sdlc/project.yml`, `docs/ai-sdlc/integration.md`, and
   `docs/ai-sdlc/phases.md` (Phase 0–1 only), plus `CLAUDE.md` if present.
   **If `docs/ai-sdlc/project.yml` is missing, this repo has not been
   initialised — stop and tell the user to run `/harness-init` first.** Do
   not scaffold those files from here and do not proceed without them.
3. Ensure `docs/specs/<feature>/traceability.yaml` exists, and **generate it
   when it does not** — do not stop and ask the user to hand-author one.
   (Earlier versions of this command stopped here and pointed at an "intake
   bridge" that does not exist, which left every team writing this file from
   scratch with no schema and guessing at key names later commands would
   read. That is the bug this step fixes.)

   - **It exists** → read it. Verify its `sources` are current (re-fetch and
     compare `retrieved` dates) and read the selected task files before
     planning.
   - **It does not exist** → create it from
     `docs/ai-sdlc/templates/traceability.yaml`
     (`vnd.ai-sdlc.traceability/v1`), filling only what you can actually
     determine:
     - `slug`, `title`, `created`, `status: draft`;
     - `sources` — from the ticket id/URL passed as the second argument
       (fetch it with `get_jira_issue` / `get_confluence_page` and record
       `id`, `title`, `url`, `retrieved`), or from the Stage A artefacts if
       `docs/specs/<feature>/idea-card.md` and friends are present, in which
       case also fill the `discovery` block and `gates.G1` from what is
       recorded there;
     - everything else stays `PENDING — <reason>`. Never invent a source,
       never write a plausible ticket key, and never leave a key out to make
       the file look complete.

   Then apply the one hard rule: **`sources` is never empty.** If no ticket
   was passed and no Stage A artefact exists, the manifest has been written
   with `sources: []` and a `PENDING` note — say so, ask the user for the
   ticket or document this came from, and stop before planning. The
   difference from the old behaviour is that they now fill in one field in a
   file that already exists and already has the right shape, instead of
   authoring a schema from scratch.

   Never silently rewrite a `traceability.yaml` that is already there. If it
   exists but is missing required keys, report exactly which ones and offer
   to add them — the file is a hand-editable manifest, not generated output.
4. Read any existing `docs/specs/<feature>/`, plus related code under the
   directories listed as `source_roots` in `docs/ai-sdlc/project.yml` — never
   a hardcoded layout, since that differs per project.
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

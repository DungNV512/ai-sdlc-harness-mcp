---
description: Drive a feature end-to-end through every AI-SDLC phase, halting at the human merge gate.
argument-hint: <ticket-id-or-slug> [--skip-adr] [--module=<name>|--new-module]
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /ship-feature $ARGUMENTS

The "one button" command. Walks the full AI-SDLC for the requested
feature: Intake → Plan → Spec → ADR (if architectural) → Skeleton → Implement
(test-first sub-step, then turn the suite green) → Self-review →
Lint/format → Test → Doc → Traceability → MR draft. Stops at **Phase 13 — Human
gate** (never merges, never force-pushes).

Use this when you want a feature delivered end-to-end without manually
sequencing the per-phase commands.

## Pre-flight

1. Resolve `$ARGUMENTS` to a slug or ticket ID. Accepted forms:
   - `STOCK-123` → GitLab issue / JIRA ticket ID; fetch details via
     `glab issue view STOCK-123` or the product wiki.
   - `feed-vote` → free-form slug.
   Also decide the target scope: `--module=<name>` picks an
   existing module; `--new-module` graduates the feature to its own
   Flutter local package under `modules/<slug>/`. See "Choosing
   `--module=<name>` vs `--new-module`" below. If neither flag is
   passed, ASK the user before phase 4 — do not guess.
2. Read context (mandatory — do not skip):
    - `CLAUDE.md` (especially §0 current-vs-target state)
    - `docs/ai-sdlc/integration.md`
   - `docs/architecture/00-overview.md`
   - `docs/architecture/01-frontend-flutter.md`
   - `docs/ai-sdlc/phases.md`
   - `docs/ai-sdlc/coding-standards.md`
   - `docs/ai-sdlc/definition-of-done.md`
    - the ticket in GitLab / JIRA and upstream product/API sources through
      `use-kb`/`query-wiki` (do not mirror them into `docs/memory/`).
   - Run the intake bridge: verify current sources, run
     `break-tasks --audit`, select executable task IDs, and create
     `docs/specs/<slug>/traceability.yaml` before Phase 1.
3. Confirm git working tree is clean (or only contains uncommitted
   work from a paused `/ship-feature` run for the same slug). If
   dirty with unrelated work, **stop and ask**.
4. Create a branch `feat/<slug>-<short-id>` (do not switch to dev).

## Phases

This orchestrator dispatches **delegating phases** via the `Task` tool
so each heavyweight phase runs in a fresh sub-agent context. This
prevents single-context-window exhaustion when writing tests +
production code + independent review would otherwise all compete for
the same token budget. The orchestrator itself stays light: it
sequences, verifies DoD, and writes progress notes.

**In-thread phases** (light: planning, doc work) — run directly:
0, 1, 2, 3, 4, 8, 10, 11, 12.

**Delegated phases** (heavyweight: writing tests + code + reviewing) —
dispatch via `Task` tool with the matching sub-agent:
5+6 (`flutter-engineer` — writes red tests then turns them green in
one delegation), 7 (`reviewer`), 9 (`qa`).

After every phase, write a one-line progress note (`✓ Phase N
(<name>) — <artefact path>`). If a phase fails its DoD, **stop**,
summarise blocker, leave clear recovery instructions, and exit
non-zero (do not advance).

| # | Phase | How | Sub-agent | DoD reference |
|---|-------|-----|-----------|---------------|
| 0 | Intake | bridge preflight + manifest | — | `phases.md §0` |
| 1 | Plan | in-thread `/plan-feature <slug>` | — | `phases.md §1` |
| 2 | Spec | in-thread `/spec <slug>` | — | `§2` |
| 3 | ADR (if architectural) | in-thread `/adr <slug>` | — | `§3` |
| 4 | Skeleton | in-thread `/scaffold-feature <slug> --module=<name>` (or `--new-module`) | — | `§4` |
| 5+6 | Test-first + Implement | **`Task` delegate** running `/implement <slug>` | `flutter-engineer` | `§5`, `§6` |
| 7 | Self-review | **`Task` delegate** | `reviewer` (MUST be a fresh agent that did not write the code) | `§7` |
| 8 | Lint / format | in-thread `/lint` | — | `§8` |
| 9 | Test | **`Task` delegate** | `qa` | `§9` |
| 10 | Doc / memory | in-thread `/update-memory <topic>` (only if a new pattern emerged) | — | `§10` |
| 11 | Traceability close | in-thread manifest + doc gates | — | `§11` |
| 12 | MR draft | in-thread `/pr <slug>` | — | `§12` |
| 13 | Human gate | **STOP** — print summary, hand off | — | `§13` |

### Delegation brief template

For each `Task` delegate, the orchestrator passes a self-contained
prompt (sub-agents see no prior conversation). The template:

```
You are <subagent>. Phase <N> of /ship-feature <slug>.

Context you must read first:
- docs/specs/<slug>/plan.md
- docs/specs/<slug>/spec.md
- docs/ai-sdlc/phases.md §<N>
- docs/ai-sdlc/definition-of-done.md (the rows for phase <N>)
- (phase-specific files: tests/, target widgets, ADRs touched)

Constraint: stay inside phase <N>. Do not advance phases. Report:
  ✓ on success: artefact paths + DoD self-check checklist.
  ✗ on blocker: the single failing DoD item + suggested next step.

Sub-agent contract (.claude/agents/<subagent>.md) defines what you
own and forbid. Do not override it.
```

Each delegate runs against the model declared in its agent frontmatter. If the
delegate's report shows ✗, the orchestrator stops and surfaces the
blocker without advancing.

### When to skip phases

- **`--skip-adr`** — set only when the diff is purely additive within
  an existing pattern with no new third-party dep. Record the
  justification in the MR description under "Why no ADR".
- **Backend contract** — this repo is Flutter-only; assume the backend
  contract exists in a separate repo. Add an MR checklist item asking
  the backend team to confirm the OpenAPI surface when the change
  requires new endpoints.

### Choosing `--module=<name>` vs `--new-module`

- **`--module=<name>`** (default when the ticket clearly belongs to
  an existing module) — the feature lands inside
  `modules/<name>/lib/src/<slug>/`; tests at
  `modules/<name>/test/src/<slug>/`.
- **`--new-module`** — the feature has its own DI barrel + release
  cadence and graduates to a fresh Flutter local package at
  `modules/<slug>/`. Wire the new module into the shell per
  `docs/architecture/00-overview.md` + `01-frontend-flutter.md`.

If neither is passed, `/scaffold-feature` (phase 4) will ask before
proceeding — this orchestrator inherits the same ask.

## Subagent usage

- For the combined Phase 5+6 (`/implement`) delegate to the
  `flutter-engineer` subagent with a self-contained prompt that
  includes:
  - The feature slug + the resolved target module
  - The spec section (input) — the agent will first write the red
    test suite (Phase 5 sub-step) and then turn it green (Phase 6)
  - A hard-coded reminder: "follow `docs/ai-sdlc/coding-standards.md`,
    never write outside `modules/<name>/lib/src/<slug>/` (small
    feature) or the newly scaffolded `modules/<slug>/` (new
    module), never edit generated files, run `dart format` and
    `flutter analyze` before reporting back."
- Always verify the subagent's output before marking the phase done
  (read the diff, not the agent's self-report).

## Quality gates baked in

- After Phase 6 and Phase 8, `flutter analyze` must exit 0.
- After Phase 9, coverage gate (80% aggregate across `lib/` +
  `modules/*/lib/**`, 90% across the domain layers at
  `modules/*/lib/src/domain/*`) must
  hold. **Note (2026-07-30)**: no `.gitlab-ci.yml` exists yet in
  this repo, so this gate is enforced locally only by
  `pre-push.sh` until CI lands. Do not treat "CI green" as
  satisfied by the local run.
- After Phase 12, the MR template must be fully filled and CI must
  be green (once CI exists). If CI fails, **do not** retry blindly
  — read the failure, fix the root cause, re-run the smallest
  possible phase.
- Before Phase 12, `traceability.yaml` must link source IDs, task IDs,
  plan/spec, code/tests, ADRs, and gate evidence. Run `okf-validate` and
  `doctor.sh` when the change includes documentation artefacts.

## On failure / interruption

If interrupted (context limit, tool failure, blocking question), leave
a `docs/specs/<slug>/_resume.md` with:

- Last completed phase
- Open question or failure
- Files modified since the last green test run
- Exact `/ship-feature <slug>` re-entry command

The next invocation reads `_resume.md` first and continues from the
recorded phase.

## Anti-patterns to refuse

- Editing files outside the target module —
  `modules/<name>/lib/src/<slug>/` (small feature) or
  `modules/<slug>/` (new module) — plus the matching
  `modules/<name>/test/src/<slug>/` (or `modules/<slug>/test/`)
  tree, the feature's i18n keys, and the route binding. Cross-
  cutting edits require an ADR.
- Scaffolding at `lib/features/<slug>/` — that layout has been
  superseded by the modular tree (see
  `docs/architecture/01-frontend-flutter.md` masthead).
- Skipping the Phase 5 test-first sub-step of `/implement` "because
  the change is small".
- Merging the MR. Phase 13 is human-only.
- Force-pushing without `--force-with-lease`, or rewriting shared
  history.

## Exit message template

```
✓ Feature <slug> shipped to MR !<#>.
   Branch: feat/<slug>-<short-id>
   Target: dev
   Phases completed: 0–12
   Tests: <N> passed, coverage <agg>% / <domain>%
   Artefacts:
     - docs/specs/<slug>/traceability.yaml
     - docs/specs/<slug>/plan.md
     - docs/specs/<slug>/spec.md
     - docs/ai-sdlc/adr/<NNNN>-<slug>.md (if filed)
     - modules/<name>/lib/src/<slug>/...   (or modules/<slug>/ for a new module)
     - modules/<name>/test/src/<slug>/...  (or modules/<slug>/test/)
   Awaiting human merge.
```

---
description: Stage C3 - wireframe to hi-fi in Figma with USn frame naming, exported design tokens, an interaction spec covering every screen state, and WCAG 2.1 AA verified on real values.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /ui-spec $ARGUMENTS

Stage C3. See `docs/ai-sdlc/stage-c-design.md`. Default agent: `px-designer`.

Produces `docs/specs/<slug>/ui-spec.md` against `vnd.ai-sdlc.ui-spec/v1`,
alongside the Figma frames themselves.

## Step 1 — Pre-conditions, and why this one is strict

Require `docs/specs/<slug>/srs.md` **complete**, plus the PRD's personas and
journeys.

The spec is explicit: **C3 cannot mock up screens while business rules are
undefined.** Designing around an undefined rule guarantees a redraw once it
exists, and the redraw always costs more than the wait. If the SRS has open
rules, list them and stop.

## Step 2 — Check the Figma file key before drawing anything

Get the file key. **A key of the form `unsaved-*` fails the DoD** — stop and
say the file must be published first.

This is not pedantry. When a file key changes, every `mcp_ref` pointing into
it dies at once, with no warning and no error: tasks simply reference frames
that are not there. This organisation has already been bitten — 61 task files
still carry a stale `unsaved-*` key beside the real URL.

Record the published key in the UI spec.

## Step 3 — Build the state matrix from the SRS, first

Before drawing: extract every state the SRS lists, per screen, into the
matrix — loading, empty, partial, error per failure mode, success, offline,
permission-denied, first-run, overflow.

**Draw the empty and error states first.** They are where most rework
originates, because a demo never shows them, and designing them early
surfaces missing requirements while they are still cheap to fix.

Errors get a row per failure mode **where recovery differs**. One generic
"something went wrong" standing in for four distinct failures is four missing
designs.

A blank cell is an unanswered question, not an omission — either a frame or
an explicit `n/a — reason`.

## Step 4 — Name frames after user stories

`US1-01 Portfolio / margin warning`. Downstream tasks cite frames by
`nodeId`, so the name is an interface, not housekeeping. Record every frame's
`nodeId` in the spec table.

## Step 5 — Interaction spec and tokens

Per interactive element: trigger, feedback, result, and behaviour on failure,
with timing where it matters and what the user can do while waiting.

Export **design tokens** — colour, type, spacing, radius, elevation, motion.
Handoff is tokens, never pixels measured from a screenshot; a measured value
is a copy that drifts from its source.

Use existing design-system components and tokens before inventing new ones,
and where you must invent, say why the existing set could not carry it.

## Step 6 — Accessibility, checked not estimated

WCAG 2.1 AA on **real token values**: contrast ≥ 4.5:1 body and 3:1 large,
touch targets ≥ 44pt, logical focus order, every control labelled, legible at
200% text scaling.

Compute contrast from the actual tokens and record the numbers. A contrast
failure found at E1 review costs a redesign; found here it costs changing a
token.

## Step 7 — One round with representative users

The DoD requires **≥ 1 round of feedback from representative users**. A round
with the team is not that round.

Record the date, who, and what changed. *"No changes"* after a real round is
a legitimate finding worth recording. *"No round held"* fails the DoD — say
so rather than marking C3 done.

## Step 8 — Write and update traceability

Write the spec. Update the manifest: `design.ui_spec`, `design.figma_file_key`
and the frame `nodeId`s per `USn`, so stage D tasks can reference them and so
a future key change has something to check against.

## Anti-patterns to refuse

- Starting before the SRS is complete.
- An `unsaved-*` key in anything a task will reference.
- Delivering only the happy path.
- One generic error state standing in for distinct failures.
- Pixel handoff instead of tokens.
- Estimating contrast rather than computing it.
- Marking C3 done with contrast failures noted as "fix later", or without a
  representative-user round.

---
description: Stage C2 - the Comm View. Function List and SRS, detailing every acceptance criterion into individually testable requirements with USn ids and a complete trace matrix.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /srs $ARGUMENTS

Stage C2. See `docs/ai-sdlc/stage-c-design.md`. Default agent: `architect`.

Produces `docs/specs/<slug>/function-list.md` and `docs/specs/<slug>/srs.md`
against `vnd.ai-sdlc.function-list/v1` and `vnd.ai-sdlc.srs/v1`.

This is what stage D builds from and what QA writes test cases against before
any code exists.

## Step 1 — Pre-conditions, all three

Require the **BRD**, the **PRD** (approved, `gates.G3`), and **C1's**
`package-design.md` + `integration-design.md`.

Missing C1 → stop. The spec is explicit: C2 needs both the BRD/PRD and the
Package Design, and lacking either produces a function list that is wrong or
cannot be built. Say which is missing rather than proceeding on the two you
have.

## Step 2 — Function List first

One row per function: description, trace up to `F-NNN`/`AC-NNN`, the user
stories that realise it, priority, and the SRS section specifying it.

Then the coverage table: every PRD feature and the functions covering it. A
Must-have feature with no function is a hole in the design. A function with
no feature is scope that entered at stage C — later and more expensive than
scope entering at B — so name it and remove it or trace it.

Scope needs **PM and C-level consensus** on this list. Record where that
happened.

## Step 3 — Assign `USn` ids carefully, once

`US1-02` is story 2 of epic 1. These ids travel into Figma frame names, task
filenames and test names.

**Assign them once and do not renumber.** A provisional id renumbered later
breaks references in four places and none of them error — the task simply
points at a frame that is not there. If the set needs restructuring, do it
before anything downstream cites them.

## Step 4 — Detail every AC into testable requirements

For each user story: the story sentence, its traces, then numbered
requirements (`US1-01.R1`) each with a **"Testable how"** column naming the
observation that proves it. "Verify it works" is not an observation.

Then, for each story, **every state**: loading, empty, partial, error per
failure mode, success, offline, permission-denied, first-run, overflow. C3
draws frames from this list. **A state missing here is a frame nobody designs
and a branch nobody codes** — which is where most late rework originates.

Also per story: data read and written with the system of record, the
`BR/DR/SR/IR` rules it must honour and how, and what is explicitly out of
scope for it (the adjacent thing a reader will assume).

## Step 5 — Non-functional requirements need numbers

Each with a threshold and a measurement method. "Fast" cannot be tested;
"interactive within 2.0s at p95 on the device matrix" can. Without a number
it is an aspiration, and it will be quietly dropped at E3.

## Step 6 — The trace matrix is the DoD

Every SRS item, linked to PRD, BRD, function, and (once C3 exists) Figma
frame. **Every row complete.** An SRS item with no link up to the PRD is a
requirement someone invented at stage C.

Print the incomplete rows explicitly rather than reporting a percentage.

## Step 7 — Write and update traceability

Write both files. Update the manifest: `design.function_list`, `design.srs`,
and the `USn` ids allocated, so C3 and stage D can reference them.

Next: `/ui-spec <slug>` and `/test-strategy <slug>`, which can run in
parallel.

## Anti-patterns to refuse

- Proceeding without C1.
- A requirement bundling three checks into one sentence — split it, each gets
  an id and a test.
- "The system should handle errors gracefully."
- Renumbering `USn` ids after anything references them.
- Listing only the happy-path state.
- A non-functional requirement without a number.
- Specifying implementation. The SRS says what must be true, not which class
  does it.

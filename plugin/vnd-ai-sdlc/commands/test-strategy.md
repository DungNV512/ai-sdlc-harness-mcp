---
description: Stage C4 - the Test Strategy. Fixes coverage thresholds as numbers with a named enforcer, and sketches a test case for every PRD acceptance criterion before code exists.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# /test-strategy $ARGUMENTS

Stage C4. See `docs/ai-sdlc/stage-c-design.md`. Owner: FS 22 Quality Engineering.

Produces `docs/specs/<slug>/test-strategy.md` against
`vnd.ai-sdlc.test-strategy/v1`.

## Step 1 — Pre-conditions

Require the **PRD** (for acceptance criteria) and the **SRS** (for
requirements and non-functional thresholds).

C4 can run in parallel with C3 — both depend on C2 and not on each other.

## Step 2 — Shift-left is the point

**QA writes test cases as soon as the SRS exists, not after code appears.**

That ordering carries the value. Cases written from the SRS find requirement
defects while they are cheap; cases written from code can only confirm the
code does what it does. If C4 runs after implementation has started, say so —
the strategy still helps, but it has lost its main function.

## Step 3 — The pyramid, with reasoning

State the intended shape: what each level covers, who writes it, when, and
where it runs.

A pyramid with a heavy top is a choice with consequences — slow feedback,
flaky signal — and if it is the right trade here, say why rather than drawing
the conventional triangle and moving on.

## Step 4 — Thresholds as numbers, per project

Coverage thresholds fixed as numbers, each with **the mechanism that enforces
it** named — a hook, a CI job. A threshold no job checks is a preference.

**Decide these for this project.** Do not inherit 80% overall / 90% domain
without deciding: those figures came from Stockbook and it is not established
that they are an organisational standard. Use the `project-toolchain` skill
to find what this project can actually measure before committing to a number
that will block merges.

If the team wants to adopt Stockbook's numbers, that is a decision — record
it as one, with who made it.

## Step 5 — Every acceptance criterion gets a sketched case

The DoD: **every AC in the PRD has at least one sketched test case.**

Sketched, not written — enough to show the AC is testable and how. Produce
the table with a row per AC, and mark the gaps explicitly:

| AC | Test case | Level | Sketched |
|---|---|---|---|
| AC-001 | | unit | yes |
| AC-002 | **none — gap** | | |

A gap here usually means the AC is **not actually testable**, which is a B2
defect found cheaply. Report it back rather than inventing a case that tests
something adjacent.

## Step 6 — Test data, and what is not tested

Fixtures and their owner. **Never real customer data** — say how it is
synthesised. Environments and what each is for.

Then name what is not being tested and why. An untested area everyone knows
about is a managed risk; one nobody has named is a surprise during E3.

## Step 7 — Entry and exit criteria

Entry: when testing can start on a slice. Exit: thresholds met, no open
critical defects, golden diffs reviewed.

## Step 8 — Write and update traceability

Write the file. Update the manifest: `design.test_strategy`, the thresholds
chosen, and the AC-coverage gaps so they are visible at G4.

## Anti-patterns to refuse

- Inheriting coverage numbers without deciding them.
- A threshold with no enforcing mechanism.
- Claiming full AC coverage without the table.
- Inventing a test case for an untestable AC instead of reporting it.
- Real customer data in fixtures.
- Leaving "what we are not testing" empty.

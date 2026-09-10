---
description: Stage B0 - scribe the Systems and Projects Context Doc while a PM and Architect fill it. Human-written by design; the harness checks completeness and never invents entries.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# /context-doc $ARGUMENTS

Stage B0. See `docs/ai-sdlc/stage-b.md`.

Produces `docs/specs/<slug>/systems-context.md` against
`vnd.ai-sdlc.systems-context/v1`.

## This phase is human, and that is the point

The spec marks B0 **"Human — no AI"**. Its entire value is in what a PM and
an Architect know and have never written down: which parallel project is
about to change the ground, which integration looked fine last time and was
not, which debt is load-bearing.

So you **scribe and check**. You do not generate entries, you do not suggest
systems that "might be relevant", and you do not fill a gap with something
plausible. An invented row here is worse than a blank one, because it will be
trusted at C1.

What you may do: read the repo and name systems you can find **evidence** for
(a client in the code, a URL in config, an existing integration), presented
as *"I found references to X — is it relevant?"*, never written straight into
the document.

## Step 1 — Pre-conditions

Require a `GO` at G1 in `docs/specs/<slug>/traceability.yaml`. Anything else
→ stop and say so. B0 spends two senior people's time; a feature that has not
passed G1 has not earned it.

Confirm both a PM and an Architect are present. If running with only one,
mark the document `INCOMPLETE — filled without <role>` at the top and say
which sections are unreliable.

## Step 2 — Work through the template together

`docs/ai-sdlc/templates/systems-context.md`, section by section.

Only list systems with a **plausible relationship**. A list of everything the
company runs is not context, it is noise that hides the two entries that
mattered.

Two sections are the **Architect's personally**, and you should say so when
you reach them: *technical debt in the path*, and *data and integration*. A
PM filling these produces a document that reads complete and is not.

## Step 3 — The legal dependency

If the domain is regulated, record the legal advice status, and state the
hard dependency in the document: **the BRD cannot be finalised until legal
has advised.** Not "should not" — B1's DoD fails without it and G2 cannot
pass.

Record the request date as soon as it is made, so the wait is visible now
rather than discovered at the gate.

## Step 4 — Completeness check, not content check

Report which sections are empty and which tables have rows with unanswered
columns. Ask; do not fill.

Ask specifically about the three that are usually forgotten: parallel
projects with a dependency in either direction, systems we integrated with
before and found harder than expected, and what was considered and
deliberately excluded.

## Step 5 — Write and update traceability

Write the file. Update `docs/specs/<slug>/traceability.yaml`:
`define.systems_context`, and `define.legal_status` when regulated.

Next command: `/brd <slug>`.

## Anti-patterns to refuse

- Generating any entry. If neither person knew it, it does not go in.
- Listing the whole estate.
- Letting the PM fill the technical debt or data/integration sections.
- Recording legal status as "probably fine".
- Proceeding without a G1 GO.

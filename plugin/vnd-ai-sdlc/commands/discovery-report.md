---
description: Stage A4 - synthesise the Discovery Report for the G1 feasibility gate, including the mandatory adversarial AI reviewer pass. Five sections, five pages, hard limits enforced.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /discovery-report $ARGUMENTS

Stage A4. See `docs/ai-sdlc/stage-a-discovery.md`. This is the only document that goes
into G1, so everything about it is shaped by a 60-minute meeting.

Produces `docs/specs/<slug>/discovery-report.md` against
`vnd.ai-sdlc.discovery-report/v1`.

## Step 1 — Pre-conditions, stated honestly

Require `docs/specs/<slug>/problem-statement-canvas.md` and the Company
Context Doc (`docs/ai-sdlc/company-context.md`, or the path in
`project.yml`). Without the Company Context Doc, sections that should read
as specific to this company (resourcing, existing systems, prior attempts)
degrade into generic text — note this in the report rather than writing
around it.

A3's outputs (`market-scan.md`, `feasibility-assessment.md`) are expected but
may not exist — A3 has no command yet. If either is missing, do **not**
substitute your own market research for it. Draft the report with those
sections marked `NOT DONE — A3 market scan has not been run`, and say in the
report header that the report is incomplete for gate purposes. A gate held on
a report with invented market data is worse than a gate postponed.

## Step 2 — Draft the five sections

Use the template. Sections 1–5, in order, each within its stated length.
Compress from the source documents; do not re-derive and do not add facts that
are in neither.

Two things carry through from A3 and must not be lost in compression:

- every unverified number keeps its `[ước tính]` / `[estimate]` label
  **inline, next to the number** — not moved to a footnote;
- the advantage in section 3 must be specific and defensible. If the source
  documents do not contain one, section 3 says so. "We will do it better" is
  rejected at the A3 DoD and does not become acceptable by being restated
  here.

Section 5 must name **what evidence would change the recommendation**. A
recommendation nothing could change is a position, not an analysis, and the
gate cannot interrogate it.

## Step 3 — The mandatory reviewer pass

A4 does not complete without this. Dispatch a **fresh** reviewer — a separate
`Task` agent that has not been part of drafting — and instruct it to be
adversarial, not helpful. It returns:

1. **Logical gaps** — every one it can find.
2. **Assumptions being treated as fact** — the claims stated with the
   confidence of evidence that have none, and what would be needed to
   establish each.
3. **The five hardest questions** a sceptical C-level would ask.

Then the PM (the user) resolves. Write into the report:

- gaps either fixed in sections 1–5, or listed as accepted, named risks —
  nothing quietly dropped;
- the assumptions, kept visible;
- the five questions **with honest answers**, including "we do not know";
- contradictions the AI flagged between A2 and A3, and how the PM settled
  them — resolved, not deleted.

If the PM cannot answer three of the five questions, say plainly that the
report is not ready for the gate, and stop. That judgement is the point of
this step.

## Step 4 — Hard checks before writing

Refuse to write a report that fails any of these, and name which one failed:

- five sections present, in order, none empty;
- the reviewer pass present with all four of its parts;
- five pages or fewer (roughly 2,500 words of body);
- every numeric claim either sourced or labelled `[ước tính]` / `[estimate]`;
- section 5 names what would change the recommendation.

On the page limit specifically: if it runs long, the fix is upstream in A2,
not compression here. Say that rather than trimming until it fits.

## Step 5 — Write and update traceability

Write the report. Update `docs/specs/<slug>/traceability.yaml`:
`discovery.discovery_report`, and set `gates.G1.decision: PENDING` if it is
not already set — the report existing is what makes G1 schedulable.

## Step 6 — Report, and hand over to humans

Print the section lengths, the check results, and the reviewer's five
questions. Then state clearly:

> G1 is a human gate. Claude does not attend, summarise, recommend or vote.
> After the meeting, record the decision with `/gate G1 <slug>`.

## Anti-patterns to refuse

- Running the reviewer pass with the same context that wrote the draft, or
  skipping it because the draft "looks solid".
- Filling A3's sections with your own research when A3 was never run.
- Dropping an `[ước tính]` label during compression.
- Trimming content to hit five pages instead of naming the upstream problem.
- Writing a recommendation with no falsifier.
- Offering an opinion on what G1 should decide.

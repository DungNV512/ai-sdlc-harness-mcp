---
description: Stage B2 - author the Product Requirements Document with MoSCoW priority set by the PM, and run the two-way BRD trace check that identifies scope creep mechanically.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /prd $ARGUMENTS

Stage B2. See `docs/ai-sdlc/stage-b.md`. Default agent: `pm-analyst`.

Produces `docs/specs/<slug>/prd.md` against `vnd.ai-sdlc.prd/v1`.

## Step 1 — Pre-conditions

Require `docs/specs/<slug>/brd.md` **approved** (`gates.G2` recorded), both
context docs, and the Discovery Report for the out-of-scope section.

User research: if none exists, do not invent it. Write *"No user research
conducted — personas derived from the ICP in the Company Context Doc"* and
mark every persona's source as **assumption**. That is a legitimate position
and a known risk; a fabricated research citation is neither.

## Step 2 — Two generator passes

**Pass 1 — Overview, Personas, Journeys.** Every persona states its source:
**validated** (with the research and its date) or **assumption**. A persona
from six interviews and one from a guess look identical on the page and lead
to different decisions.

**Pass 2 — Feature list with MoSCoW**, each feature carrying `F-NNN` and its
acceptance criteria `AC-NNN`. Every Must-have needs **at least two** testable
criteria — testable meaning QA can write a case from it without asking a
question.

## Step 3 — The two-way trace check

The highest-value mechanical check in the upstream half. Run it in both
directions and **put the table in the document**; do not claim it was done.

**Forward — is every rule covered?** For each `BR/DR/SR/IR` in the BRD, which
features implement it? A rule with no feature is either out of scope — say so
in section 6 — or an omission that will surface during build.

**Backward — does every feature trace?** For each `F-NNN`, which rule does it
serve? **A feature that traces to nothing is scope creep.** Use those words.
Then either find the rule it serves or cut it.

| Rule | Covered by | | Feature | Traces to |
|---|---|---|---|---|
| BR-001 | F-003, F-007 | | F-003 | BR-001 |
| BR-002 | **nothing** | | F-011 | **nothing — scope creep** |

Also check no feature **contradicts** a BRD rule. A feature that quietly
violates a rule is worse than one that traces to nothing, because it looks
justified.

## Step 4 — The PM sets priority

**Draft MoSCoW; do not decide it.** Present the draft with your reasoning,
and where the PM overrules you, record *their* reasoning in the document, not
yours. Same for the scope line and anything moved to Won't.

If you think a priority is wrong, say so once, plainly, under Risks, named as
your view. Then implement the decision as made.

## Step 5 — The reviewer pass, two angles

Mandatory before G3. A fresh `Task` agent reads it twice:

- **As a developer**: what would I have to guess to build this? Where are two
  readings possible? What happens in the failure case nobody described?
- **As a PM**: which feature does not earn its priority? What did we commit
  to that no metric will measure?

## Step 6 — The two readability DoDs are literal

*A developer can estimate from it* and *QA can write test cases from it* are
not rhetorical. Before declaring B2 done, give the PRD to an engineer and a
QE and ask for an estimate and a test case. **What they have to ask you is
the list of what is still missing.** Record those questions as `Q-NNN` with
an owner and a deadline.

## Step 7 — Write and update traceability

Write the file. Update the manifest: `define.prd`, the `F-NNN`/`AC-NNN`
ranges, and the trace-check result.

Next: `/gate G3 <slug>` after the team review and Sprint 0, then `/sa-view`.

## Anti-patterns to refuse

- Setting MoSCoW yourself, or presenting your recommendation as the team's.
- A Must-have with one acceptance criterion, or criteria that cannot become a
  test.
- Personas with no source column.
- Inventing user research.
- Claiming the trace check passed without showing the table.
- Carrying unanswered `Q-NNN` items into G3 — the gate exists partly to catch
  that.

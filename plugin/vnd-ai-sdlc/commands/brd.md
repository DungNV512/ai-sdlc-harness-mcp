---
description: Stage B1 - author the Business Requirements Document with uniquely-identified BR/DR/SR/IR rules, a mechanical contradiction check, and the mandatory five-angle reviewer pass before G2.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /brd $ARGUMENTS

Stage B1. See `docs/ai-sdlc/stage-b-definition.md`. Default agent: `pm-analyst`.

Produces `docs/specs/<slug>/brd.md` against `vnd.ai-sdlc.brd/v1`.

## Step 1 — Pre-conditions

Require, and stop naming whichever is missing:

- `docs/specs/<slug>/discovery-report.md`, and `gates.G1.decision: GO` in the
  manifest. A BRD for work that has not passed G1 is work nobody authorised.
- `docs/specs/<slug>/systems-context.md` (B0).
- The Company Context Doc — success metrics link to its OKRs.

Regulated domain with legal status not `received` → **stop**. The DoD cannot
be met, so drafting now produces a document that cannot be finalised.

## Step 2 — Two generator passes, in order

**Pass 1 — Business Context and Stakeholders.** Why this exists in the
business's own terms; who needs what from it; and success metrics linked
directly to a company OKR. Every metric needs **a number and a date** — one
without both can never be shown to have failed, so it can never be shown to
have been met.

**Pass 2 — Business Rules, in four families.** Draft each with an ID:

| Prefix | Family | Belongs here |
|---|---|---|
| `BR-NNN` | Business | eligibility, limits, entitlements, lifecycle |
| `DR-NNN` | Data | what is held, how long, how accurate, who owns the record |
| `SR-NNN` | Security | authn, authz, confidentiality, audit, segregation of duties |
| `IR-NNN` | Integration | interaction with **named** systems |

IDs are permanent. A withdrawn rule is marked withdrawn with a date and
reason — never deleted, never renumbered. Downstream documents cite these
numbers and a recycled ID silently repoints a trace.

Every rule carries its source: a Discovery Report section, a stakeholder, or
a regulation. A rule with no source is one you invented.

## Step 3 — The PM edits, then the checks run

Hand the draft to the PM. Then run these mechanically, and put the results in
the document rather than claiming they passed:

**Uniqueness** — no ID appears twice, including across withdrawn rules.

**Contradiction** — compare pairwise within each family and across families.
`SR` against `BR` is where they hide: a security rule forbidding what a
business rule requires. Report every pair you cannot prove compatible; a
false positive costs a sentence, a miss costs a rebuild.

**Named systems** — every `IR` names an actual system. "Must integrate with
the identity system" fails; "must obtain the verified identity from the iVND
identity service" passes. Cross-check the names against the Systems &
Projects Context Doc; a system named here and absent there is one of the two
documents being wrong.

**Falsifiable metrics** — every success metric has a number and a date.

## Step 4 — The reviewer pass, five angles

Mandatory. Dispatch a **fresh** `Task` agent that has not been part of
drafting, and require all five:

1. **Contradiction** — which two rules cannot both hold?
2. **Silence** — what does this not say that a builder will have to guess?
3. **Assumption as fact** — which statements carry the confidence of evidence
   without the evidence?
4. **Unfalsifiable metric** — which metric could never be shown to have
   failed?
5. **Vague integration** — which `IR` describes a system instead of naming it?

Write the findings in. Each is either fixed above or listed as an accepted,
named risk. Nothing quietly dropped.

## Step 5 — Two human confirmations, both required

The DoD needs both, and neither is a meeting attendance record:

- **C-level approval** of Business Context and Business Rules.
- **The Architect's written confirmation** — email or comment — that no
  technical constraint is missing. *In writing* is the requirement, because a
  walkthrough where everyone nodded is exactly how a missing constraint
  reaches production.

Do not mark the BRD approved without both. Record where each is recorded.

## Step 6 — Write and update traceability

Write the file. Update the manifest: `define.brd`, and the rule ID ranges
allocated so `/prd` can check coverage against them.

Next: `/gate G2 <slug>` after the sign-off meeting, then `/prd <slug>`.

## Anti-patterns to refuse

- A rule with no source.
- Deleting a withdrawn rule, or reusing an ID.
- "Improve customer satisfaction" as a success metric.
- An `IR` that describes rather than names.
- Running the reviewer pass in the same context that wrote the draft.
- Recording the Architect's confirmation as attendance.
- Finalising in a regulated domain before legal has advised.

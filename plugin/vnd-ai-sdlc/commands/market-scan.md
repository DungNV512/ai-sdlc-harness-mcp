---
description: Stage A3 - competitor scan, bottom-up market sizing and internal feasibility, run as three parallel streams. Produces the Market Scan Report and Feasibility Assessment that G1 rules on.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, WebSearch, WebFetch, Task
---

# /market-scan $ARGUMENTS

Stage A3. See `docs/ai-sdlc/stage-a.md`. Default agent: `pm-analyst`.

Produces two artefacts against `vnd.ai-sdlc.market-scan/v1` and
`vnd.ai-sdlc.feasibility-assessment/v1`:

- `docs/specs/<slug>/market-scan.md`
- `docs/specs/<slug>/feasibility-assessment.md`

## Step 1 — Pre-conditions

Require `docs/specs/<slug>/problem-statement-canvas.md`. Missing → stop and
say to run `/problem-canvas <slug>` first. You cannot scan a market for a
problem that has not been framed.

Read the Company Context Doc (`docs/ai-sdlc/company-context.md`, or the path
in `project.yml`). **If it does not exist, say so prominently and continue
with reduced confidence** — feasibility without it is generic feasibility,
which is worth very little. Note its absence in both outputs.

## Step 2 — Three streams, run in parallel

Dispatch these as concurrent `Task` agents; they do not depend on each other.

**Stream 1 — competitor scan.** Five to eight. Search for real products, and
**include the manual alternative**: the spreadsheet, the email thread, the
person who does it by hand. That is usually the actual incumbent, it is free,
it already has every user, and it is much harder to displace than a
competitor with a pricing page. For each: what they do well, where the gap
is, and the evidence. If fewer than five exist, report fewer and say how you
searched — do not pad.

**Stream 2 — market sizing.** Bottom-up only. Low / Mid / High range, never a
single number. Show the arithmetic in one line so a reader can argue with the
method. Anything not verified against a source carries `[ước tính]` inline,
beside the number.

**Stream 3 — internal feasibility.** From the Company Context Doc's real
capacity, stack, debt and constraints. What would have to be true; which of
those we already know; the biggest technical risk named plainly; and what
this work would displace. Feasibility with no opportunity cost is a wish.

## Step 3 — The advantage test

The scan is not finished until it produces **at least one advantage that is
specific and defensible**, or an explicit finding that none was found.

- **Specific** names a mechanism, not a quality: "we already hold the
  client's verified identity, so onboarding is one screen instead of six".
- **Defensible** says why it cannot be copied next quarter. A feature rarely
  is. Data, distribution, an integration nobody else has, a regulatory
  position or switching cost usually are.

**"We do it better" is rejected here.** If no defensible advantage exists,
report that as the finding. A No-go at G1 on honest evidence is worth far
more than a Go on a sentence nobody believed.

## Step 4 — Hand the numbers to a human

The DoD requires a human to **verify** the figures — against the source, not
by reading them over. Print the numbers with their sources as a checklist and
ask for confirmation. Record who verified and when.

Anything still unverified after that keeps its `[ước tính]` label. Do not
promote a number to verified because it seemed reasonable.

## Step 5 — Write and update traceability

Write both files. Update `docs/specs/<slug>/traceability.yaml`:
`discovery.market_scan` and `discovery.feasibility_assessment`.

Report which advantage the scan found, the biggest technical risk, and the
next command (`/discovery-report <slug>`).

## Anti-patterns to refuse

- Padding the competitor table to reach five.
- Omitting the manual/spreadsheet incumbent because it is not a product.
- Top-down sizing ("1% of a $2bn market").
- A single-point market size with no range.
- Dropping an `[ước tính]` label because the number "looks about right".
- Reporting an advantage that is a feature and calling it defensible.
- Marking figures verified without a person having checked the source.

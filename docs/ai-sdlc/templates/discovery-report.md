# Discovery Report template

`schema: vnd.ai-sdlc.discovery-report/v1`

The A4 artefact and the only document that goes into G1. Five sections, five
pages maximum. Both limits are load-bearing: the gate is 60 minutes, and a
C-level who has to mine a long report for the decision will make the decision
on whatever they happened to read.

If it does not fit in five pages, the problem statement is not sharp enough.
Fix A2; do not extend the report.

```markdown
# Discovery Report — <short handle>

- **Date**: <YYYY-MM-DD>   **PM**: <name>   **For gate**: G1
- **Sources**: Problem Statement Canvas <link> · Market Scan <link> ·
  Feasibility Assessment <link>

## 1. The problem

<From the canvas, compressed. Whose problem, what happens, what it costs.
Half a page.>

## 2. What exists today

<Competitors and incumbents, including the spreadsheet-and-manual-process
one. What each does well and where each leaves a gap. Half to one page.>

## 3. The opportunity

<Market size as a Low / Mid / High range, bottom-up, with the method shown in
one line so the range can be argued with. Then the advantage: at least one
that is specific and defensible. Every unverified figure carries `[ước tính]`
inline. One page.>

## 4. Feasibility

<Can this team, this stack, this quarter. The three or four things that would
have to be true, and which of them we already know are. Name the biggest
technical risk plainly. One page.>

## 5. Recommendation and what would change it

<The PM's recommendation, the reasoning in a few lines, and — this part is not
optional — what evidence would flip it. A recommendation that nothing could
change is a position, not an analysis. One page.>

---

## Reviewer pass (mandatory — A4 does not complete without it)

### Logical gaps

<Every gap the adversarial reviewer found. Each one either fixed above, or
listed here as an accepted, named risk. Nothing quietly dropped.>

### Assumptions currently being treated as fact

<The dangerous ones: things stated in sections 1–5 with the confidence of
evidence that do not have evidence behind them. For each, say what would be
needed to actually establish it.>

### The five hardest questions

<The five questions a sceptical C-level will ask, with the honest answer to
each — including "we do not know" where that is the honest answer. If the PM
cannot answer three of the five, the report is not ready for the gate.>

### Contradictions resolved by the PM

<Anything the AI flagged as inconsistent between A2 and A3, and how it was
settled. Resolved, not deleted.>
```

## DoD

A C-level who reads this arrives at G1 asking the **right** question. If they
have to ask "so whose problem is this?", section 1 failed and the gate is
being spent on work that belonged in A2.

Hard checks `/discovery-report` applies:

- five sections present, in order, none empty;
- the reviewer pass present, with all four of its parts;
- five pages or fewer;
- every numeric claim either sourced or carrying `[ước tính]` / `[estimate]`;
- section 5 names what evidence would change the recommendation.

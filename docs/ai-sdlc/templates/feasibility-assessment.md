# Feasibility Assessment template

`schema: vnd.ai-sdlc.feasibility-assessment/v1`

The second half of A3, and the internal counterpart to the market scan: can
**this** team, with **this** stack, inside **this** quarter. Generic
feasibility is worthless; this document is only useful to the degree it draws
on the Company Context Doc's real capacity, real debt and real constraints.

```markdown
# Feasibility Assessment — <short handle>

- **From**: Problem Statement Canvas <link> · Company Context Doc <link>
- **Date**: <YYYY-MM-DD>   **Assessed with**: <Architect / Tech Lead name>

## Verdict

<Feasible this quarter | Feasible with named trade-offs | Not feasible —
reason>. One line, at the top, before the reasoning. A reader who stops here
should not be misled.

## What would have to be true

| # | Must be true | Do we know it is? | How we would find out |
|---|---|---|---|
| 1 | | Yes / No / Partly | |

The rows answered "No" or "Partly" are the real content of this document.

## Technical fit

- **Stack**: <does this sit inside what we already run, or does it introduce
  something new? New is not disqualifying — unacknowledged new is.>
- **Systems it must talk to**: <named, from the Company Context Doc. For each,
  does an API exist, is it documented, have we used it before?>
- **Technical debt in the path**: <the specific pieces, not "we have some
  debt">
- **Biggest technical risk**: <one, named plainly, with what it would cost if
  it lands>

## Capacity

- **Disciplines needed**: <and whether we have them>
- **What this would displace**: <the committed work that moves — feasibility
  without an opportunity cost is a wish>
- **Rough size**: <based on how long comparable work actually took here,
  citing the comparison. `[ước tính]` if there is no comparable.>

## Constraints and compliance

- **Regulatory**: <applicable regimes. If regulated, state the hard
  dependency: the BRD cannot be finalised until legal has advised.>
- **Security / data**: <classification, residency, retention implications>
- **Contractual**: <partner or vendor terms that bind the design>

## Cheapest way to reduce the biggest unknown

<What a week of work could settle before committing a quarter. Often the most
valuable line in the document.>
```

## DoD

- A verdict in one line at the top.
- Every "must be true" row has an answer, including "we do not know".
- The biggest technical risk is named, not averaged into a list.
- Opportunity cost stated — what moves if this proceeds.
- Regulated domains carry the legal dependency explicitly.

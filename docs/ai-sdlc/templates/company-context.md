# Company Context Doc template

`schema: vnd.ai-sdlc.company-context/v1`

The standing document every Stage A and Stage B prompt reads. It is not
produced by a phase and has no gate — it is the background the whole upstream
half assumes, and until it exists, A1 through B2 are all guessing about the
company they are supposedly analysing for.

**Standing, not per-feature.** One per organisation or business unit. Owned
by a named person, reviewed on a fixed cadence. A stale context doc is worse
than none, because it is trusted.

## Why it comes first

Ask an AI to assess feasibility without this, and it will assess feasibility
for a generic company: a team that might know any stack, a budget that might
be anything, a compliance posture it invented. Every answer will look
reasonable and none will be about you. This document is what makes the
difference between "this seems technically achievable" and "two of our four
Flutter engineers are on the KRX migration until March".

```markdown
# Company Context

- **Owner**: <name, role — one person, not a team>
- **Last reviewed**: <YYYY-MM-DD>
- **Review cadence**: <quarterly | per project | on material change>

## Business

- **What we sell, to whom**: <one paragraph, plain language>
- **Current strategic priorities**: <the 3-5 that would actually stop other
  work. If everything is a priority, nothing here is useful.>
- **Current OKRs**: <with numbers and dates — B1 links success metrics
  straight to these>
- **Revenue model**: <how money actually arrives>
- **Who decides**: <the C-level roles that sit at G1 and G2, by role>

## Customers

- **Segments**: <named, with rough size>
- **ICP**: <the ideal customer profile used when real research is absent —
  and A-stage documents must say when they are leaning on this rather than
  on validated research>
- **What we know is validated**: <research that actually happened, with dates>
- **What we are assuming**: <listed explicitly, so nobody promotes an
  assumption to a fact by repetition>

## Technology

- **Stacks in production**: <language, framework, per surface>
- **Platforms we ship on**: <web, iOS, Android, internal tooling>
- **Systems of record**: <the ones an integration would have to talk to,
  by name — IR rules in the BRD reference these>
- **Known technical debt**: <the pieces that materially constrain what can be
  built next quarter>
- **What we deliberately do not do**: <e.g. "no backend or database work in
  MVP scope" — a boundary stated once here saves it being re-litigated in
  every feasibility assessment>

## Resources

- **Engineering capacity**: <teams, headcount by discipline>
- **What is already committed**: <the work that would have to be displaced>
- **Typical delivery cadence**: <how long a feature of this size actually
  takes here, historically — not the aspiration>
- **Budget envelope for new work**: <or the approval threshold above which
  it becomes a different conversation>

## Constraints

- **Regulatory**: <the regimes that apply. If the domain is regulated, note
  that BRD finalisation has a hard dependency on legal sign-off.>
- **Security and data**: <classification rules, residency, retention>
- **Contractual**: <partner or vendor commitments that bind design>
- **Organisational**: <the constraints everyone knows and nobody writes down>

## Competitors and market position

- **Who we lose deals to**: <named>
- **Where we are genuinely stronger**: <with evidence — this is what A3's
  "specific and defensible advantage" test draws on>
- **Where we are behind**: <honestly; a context doc that only lists strengths
  produces feasibility assessments that only find opportunities>
```

## DoD

- Every section filled or explicitly marked `Not applicable — <reason>`.
- Assumptions separated from validated facts, visibly.
- The named owner has reviewed it within the stated cadence.
- Someone who joined last month could read it and understand what the company
  is trying to do this year, and what it cannot do.

## Anti-patterns

- A committee as the owner. Nobody reviews it.
- Aspirational capacity ("we could move four engineers if needed"). Write
  what is true today; A3 feasibility depends on it.
- Listing every system rather than the ones an integration would touch.
- Leaving the assumptions section empty. Every organisation runs on
  assumptions; the ones that hurt are the invisible ones.

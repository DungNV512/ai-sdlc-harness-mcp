# Market Scan Report template

`schema: vnd.ai-sdlc.market-scan/v1`

The first half of A3. Its job is to answer one question honestly: is there an
advantage here that is both specific and defensible, or are we about to build
something that already exists and is already better?

```markdown
# Market Scan — <short handle>

- **From**: Problem Statement Canvas <link>
- **Date**: <YYYY-MM-DD>   **Analyst**: <name>   **Verified by**: <human name>

## Competitors

Five to eight. **Include the ones that are a spreadsheet and a manual
process** — that is usually the real incumbent, it is free, it already has
every user, and it is far harder to displace than a funded startup.

| # | Who | What they do well | Where they leave a gap | Evidence |
|---|---|---|---|---|
| 1 | | | | <link or "observed directly"> |

If the search found fewer than five, say the search was exhausted and how you
searched. Do not pad the table.

## Market size

Bottom-up, never top-down. Show the arithmetic in one line so a reader can
argue with the method rather than the conclusion.

| | Low | Mid | High |
|---|---|---|---|
| TAM | | | |
| SAM | | | |

**Method**: <e.g. "4,200 brokerage accounts in segment x average 3.1 trades
per month x fee — account count from [source], trade rate [ước tính]">

Every figure that could not be verified against a source carries
`[ước tính]` / `[estimate]` **inline, beside the number**.

## Our advantage

At least one, and it must be **specific** and **defensible**:

- **Specific** — names a mechanism, not a quality. "We already hold the
  client's verified identity, so onboarding is one screen instead of six" is
  specific. "Better UX" is not.
- **Defensible** — says why a competitor cannot simply copy it next quarter.
  A feature is rarely defensible. Data, distribution, an integration nobody
  else has, a regulatory position, or switching cost usually are.

| Advantage | Why it is ours specifically | How long before it can be copied |
|---|---|---|

**"We will do it better" is rejected at this DoD.** If the scan cannot
produce a defensible advantage, that is the finding — report it. A No-go at
G1 on honest evidence is worth more than a Go on a sentence nobody believed.

## What would change this analysis

<What we would have to learn for the conclusion to flip.>
```

## DoD

- At least one advantage that is specific and defensible, or an explicit
  finding that none was found.
- No unevidenced comparative claims.
- Every unverified number labelled `[ước tính]` inline.
- A human has verified the figures against their sources — verified, not
  reviewed.

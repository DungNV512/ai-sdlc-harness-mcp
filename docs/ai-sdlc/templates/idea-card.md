# Idea Card template

`schema: vnd.ai-sdlc.idea-card/v1`

The A1 artefact. It takes a raw signal — an email, a chat message, a line in
meeting notes — and separates what was *observed* from what was *inferred*
from what was *proposed*. Those three collapse into one another constantly,
and once they have, no later stage can pull them apart.

Fill it using **only** what the input actually contains. An Idea Card that
knows more than its source is not a normalised signal; it is a new idea
wearing the source's name.

```markdown
# Idea Card — <short handle>

- **Source**: <email / chat / meeting notes / Issue Report id> — <date>
- **Raised by**: <name, role>
- **Recorded by**: <name>
- **Date**: <YYYY-MM-DD>

## Observed problem

<What actually happens, in behaviour a third party could go and watch. No
solution, no remedy, no feature. This field is checked mechanically: it must
not contain cần / nên / tính năng / build / làm / tạo, nor need / should /
feature / build / make / create.>

## Interpretation

<Why we think it happens. Clearly separated because this is ours, not the
submitter's — and it is the part most likely to be wrong.>

## Proposed solution (as given)

<Only if the submitter offered one, quoted rather than improved. "None
offered" is a normal and useful value. This field exists so a proposed
solution does not have to be smuggled into the observation to be recorded.>

## Frequency and scope

- **How often**: <daily / weekly / a handful of times a quarter — with the
  evidence, or `[ước tính]` if it is a guess>
- **Who it touches**: <which roles or teams, how many people>
- **Since when**: <if known>

## Related signals

<Other Idea Cards or Issue Reports pointing at the same area. Cluster here
rather than opening a second card for the same underlying thing.>

## What is not known

<The questions that could not be answered from the input. Never empty on a
first pass — if it is, the card was filled in from assumption.>
```

## DoD

The **Observed problem** field contains none of these words:

`cần` · `nên` · `tính năng` · `build` · `làm` · `tạo`
`need` · `should` · `feature` · `build` · `make` · `create`

`/idea-card` enforces this and will not write a card that fails it. The rule
looks pedantic and is not: each of those words replaces an observation with a
solution, and a solution recorded as a problem is never re-examined.

**Bad** — "Users need a bulk export button."
**Good** — "Ops staff re-key 40–60 rows into Excel every morning; it takes
about an hour and errors surface in the afternoon reconciliation."

The second one leaves room for an answer that is not a button.

# Systems & Projects Context Doc template

`schema: vnd.ai-sdlc.systems-context/v1`

The B0 artefact. **Human-written, no AI generation.** A PM and an Architect
sit together and fill it; the harness scribes and checks completeness, it
does not invent entries. The reason is simple: this document's value is
entirely in what people know and have not written down anywhere an AI could
read.

Its job is to stop B1 from producing a BRD that ignores a system it should
have integrated with, or a project that is about to change the ground
underneath it.

```markdown
# Systems & Projects Context — <initiative>

- **Filled by**: <PM name> + <Architect name>, together, on <YYYY-MM-DD>
- **From**: G1 Go decision <link to minutes>

## Systems that could plausibly be involved

Only the ones with a plausible relationship. A list of everything the company
runs is not context, it is noise.

| System | What it owns | Why it might be involved | API? | Have we integrated before? |
|---|---|---|---|---|

## Projects running in parallel

The ones that could collide — same surface, same team, same data, or a
dependency either way.

| Project | Owner | Overlap risk | When it lands |
|---|---|---|---|

## Technical debt in the path

**Architect fills this section.** Not a general debt register — the specific
pieces this initiative would have to touch, work around, or fix first.

| Debt | Where | Effect on this work | Fix now, work around, or accept |
|---|---|---|---|

## Data and integration

**Architect fills this section.**

- **Systems of record** for the entities involved: <which system owns which>
- **Data that would have to move**: <and in which direction>
- **Existing contracts**: <APIs already available, with links to their docs>
- **Contracts that would have to be created**: <and who owns the other side>

## Regulatory and legal

- **Applicable regimes**: <or "none identified">
- **Legal advice status**: <not needed | requested <date> | received <date>>

> **Hard dependency.** In a regulated domain, the BRD **cannot be finalised**
> until legal has advised. Not "should not" — the B1 DoD fails without it,
> and G2 cannot pass. Record the request date here as soon as it is made, so
> the wait is visible rather than discovered at the gate.

## What we deliberately did not list

<Systems considered and excluded, with the reason. Cheap to write, and it
stops the same question being reopened at C1.>
```

## DoD

- The Architect has reviewed it and filled the technical debt and
  data/integration sections personally.
- Every listed system says whether an API exists and whether we have used it.
- Regulated domain → legal status recorded, and the BRD dependency stated.
- Exclusions recorded with reasons.

## Anti-patterns

- AI-generated entries. If neither person knew it, it does not belong here.
- Listing every system in the estate.
- Leaving the technical debt section to the PM.
- Recording "legal: probably fine".

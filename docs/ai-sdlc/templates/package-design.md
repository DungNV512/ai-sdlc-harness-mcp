# Package Design template

`schema: vnd.ai-sdlc.package-design/v1`

Half of C1, the client-side architecture. Its companion is the Integration
Design; together they are the SA View, and C2 cannot start without both.

**DB schema is out of MVP scope.** This describes client architecture only.
API contracts are read read-only from existing API documentation — see the
Integration Design.

```markdown
# Package Design — <initiative>

- **Architect**: <name>   **Date**: <YYYY-MM-DD>   **Version**: 1.0
- **Sources**: BRD <link> · Systems & Projects Context <link>

## Module structure

<The packages or modules this introduces or changes, and what each owns. One
sentence of responsibility per module; if it needs two, it is doing two
things.>

| Module | Owns | Depends on | Must not depend on |
|---|---|---|---|

## Layer boundaries

<Where the lines are and what may cross them. State the direction of
dependency explicitly — "presentation may call domain; domain may not know
presentation exists" — because this is the rule that erodes first.>

## State and data flow

<How state enters, where it lives, who may mutate it, how it leaves. Draw the
path for one representative user action end to end.>

## Cross-cutting concerns

| Concern | Approach | Which BRD rule drives it |
|---|---|---|
| Error handling | | |
| Logging and observability | | SR-NNN |
| Caching and offline | | DR-NNN |
| Feature flagging | | |
| Localisation | | |

## Scalability review

<What happens at 10x the expected load or data volume. Name the first thing
that breaks — every design has one, and knowing which it is beats claiming
there isn't one.>

## Security review

<Trust boundaries, where untrusted input enters, what is stored and where.
Feeds C5's threat model; cite the `SR-NNN` rules this satisfies.>

## Rules this design satisfies, and rules it strains

| Rule | How the design satisfies it | Tension, if any |
|---|---|---|

**No rule in the BRD may be violated.** If the design cannot satisfy one, the
design is wrong or the rule is wrong — resolve it before C2, not during D.
```

## DoD

- Scalability reviewed, with the first breaking point named.
- Security reviewed, with trust boundaries drawn.
- **No BRD rule violated** — and the table shows the check was made.
- Module responsibilities are single sentences.

# ADR-NNNN — <the decision, as a statement not a question>

- **Status**: Proposed | Accepted | Superseded by ADR-NNNN | Deprecated
- **Date**: YYYY-MM-DD
- **Deciders**: <named people — an ADR decided by nobody is a note>
- **Supersedes**: ADR-NNNN, or `Không có`

> `/adr` creates a file from this template and pre-fills Status, Date and
> Deciders. It stops at `Proposed`; **a human flips it to `Accepted`.**
> An ADR is a format, not a gate-signed phase artefact, so the C-1 identity
> block and the C-2 version history do not apply — supersession replaces
> revision here. Changing a decision means a new ADR pointing back, never an
> edit that leaves no trace of what was decided before.

## Context

What forced a decision. The constraint, the deadline, the incompatibility —
whatever made "leave it as it is" stop being available. Enough that a reader
in a year understands the pressure without having been there.

State the facts that were true **at the time**. If a figure is an estimate,
mark it `[ước tính]`; if a claim is unverified, mark it `[chưa xác nhận]`.

## Options considered

**At least two real options.** One option written up as a decision is a
rationalisation. If the second option is obviously worse, either it is not the
real alternative or the decision did not need an ADR.

### Option A — <name>

| | |
|---|---|
| What it is | <one or two sentences> |
| For | <the genuine case in its favour> |
| Against | <the genuine cost> |
| Cost to reverse | <hours, days, or "not reversible"> |

### Option B — <name>

| | |
|---|---|
| What it is | |
| For | |
| Against | |
| Cost to reverse | |

Describe the rejected option well enough that a reader can tell it was
actually considered. A straw man is worse than no ADR: it records a decision
as examined when it was not.

## Decision

<The option chosen, stated plainly and in the active voice.>

**Why this one, over the others specifically.** Not "it is simpler" — simpler
than what, and at what cost.

## Consequences

**What becomes easier.**

**What becomes harder.** This section is the one people leave empty, and it is
the one a future reader needs most. A decision with no downside was not a
decision.

**What this commits us to.** Anything that now cannot change without revisiting
this ADR — a dependency, a data shape, a boundary.

## Follow-ups

| What | Owner | By when |
|---|---|---|
| | | |

`Không có` if the decision leaves no loose ends.

## Links

- Requirements this serves: `BR-NNN` / `FR-NNN`, or `Không có`
- Specs affected: `docs/specs/<slug>/spec.md`
- Superseded ADRs, discussion threads, external references

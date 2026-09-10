---
description: Stage C1 - the SA View. Package Design (client architecture) and Integration Design (consumed API contracts), reviewed for scalability and security, checked against every BRD rule.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /sa-view $ARGUMENTS

Stage C1. See `docs/ai-sdlc/stage-c.md`. Default agent: `architect`.

Produces two files against `vnd.ai-sdlc.package-design/v1` and
`vnd.ai-sdlc.integration-design/v1`:

- `docs/specs/<slug>/package-design.md`
- `docs/specs/<slug>/integration-design.md`

**C1 must finish before C2.** The Function List needs both the BRD/PRD and
the Package Design; missing either produces a function list that is wrong or
unbuildable.

## Step 1 — Pre-conditions

Require `brd.md` (approved, `gates.G2`) and `systems-context.md`. The PRD is
useful context but C1's contract is with the BRD.

## Step 2 — Scope boundary, stated once

**DB schema is out of MVP scope.** This is client architecture. API contracts
are read **read-only** from existing API documentation.

Where a contract this work needs does not exist, that is a finding and a
dependency on another team — not licence to design the shape you would
prefer. Put it in the *Contracts needed but absent* table with the owning
team and what it blocks.

## Step 3 — Package Design

Modules and what each owns, one sentence of responsibility each; if it takes
two, the module is doing two things.

Layer boundaries with the **direction** of dependency stated explicitly —
"presentation may call domain; domain may not know presentation exists" —
because that is the rule that erodes first and silently.

State and data flow: trace one representative user action end to end.

Cross-cutting concerns, each tied to the rule that drives it: error handling,
logging and observability (`SR-NNN`), caching and offline (`DR-NNN`), feature
flagging, localisation.

## Step 4 — Integration Design

For every `IR-NNN` in the BRD, a concrete contract or an explicit statement
that none exists.

Per contract: request shape, **response shape including errors** (the ones
nobody reads until production), auth and where the credential comes from,
rate limits, idempotency — *what happens if the client retries after a
timeout with no response* — and how the other side signals a breaking change.

Then failure modes: what the client does when each integration is down, and
what the user sees. **Every integration fails eventually.** A design that has
not said what happens when the identity service is unavailable has deferred
that decision to whoever is on call.

## Step 5 — Confirm the contracts with people

The DoD says **every API contract confirmed with the relevant party**. A link
to documentation is not confirmation — documentation goes stale silently.

For each contract, record a person on the owning side, and the date they
agreed it is current and will not change underneath us. Unconfirmed contracts
stay listed as unconfirmed; do not quietly treat the docs as authority.

## Step 6 — Two reviews and the rule check

**Scalability** — what happens at 10x load or data volume. Name the first
thing that breaks. Every design has one; knowing which beats claiming there
isn't one.

**Security** — trust boundaries, where untrusted input enters, what is stored
where. This feeds C5; cite the `SR-NNN` rules it satisfies.

**Rule check** — a table of every BRD rule this design touches, how it
satisfies it, and any tension. **No rule may be violated.** If the design
cannot satisfy one, either the design is wrong or the rule is — resolve it
now, not during D.

## Step 7 — Write and update traceability

Write both files. Update the manifest: `design.package_design`,
`design.integration_design`, and any blocked contracts under
`design.blocked_contracts` so they are visible at G4.

Next: `/srs <slug>`.

## Anti-patterns to refuse

- Designing an API contract that does not exist.
- Documenting success responses only.
- Recording a documentation link as confirmation.
- A module whose responsibility needs two sentences.
- Claiming no BRD rule is violated without the table.
- Leaving the failure-mode table empty because the integrations "should be
  reliable".

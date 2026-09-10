# Stage C — Design, and the G4 sign-off gate

Stage B settled what must be true and what we will build. Stage C decides how
it will be structured, specified, drawn and tested — before anyone writes
code. It ends with a per-output sign-off that also switches on mandatory
version control for everything upstream.

Owners: **FS 20 Architect** · **FS 19 PX** · **FS 22 QE** · **FS 14 AppSec**.

## The ordering is a hard dependency, not a preference

```
C1 ──▶ C2 ──▶ C3
        └───▶ C4        C5 draws on C1 + C2
```

- **C1 before C2.** The Function List needs both the BRD/PRD *and* the
  Package Design. Missing either produces a list that is wrong or
  unbuildable.
- **C2 before C3.** You cannot mock up a screen whose business rules are
  undefined. Designing around an undefined rule guarantees a redraw, and the
  redraw always costs more than the wait.
- **C3 and C4 can run in parallel** — both depend on C2, neither on the other.

---

## Ownership

| Phase | Produces | Owner | Command |
|---|---|---|---|
| C1 | Package Design + Integration Design | FS 20 Architect | `/sa-view` |
| C2 | Function List + SRS | FS 20 Architect | `/srs` |
| C3 | Figma frames + design tokens | FS 19 PX | `/ui-spec` |
| C4 | Test Strategy | FS 22 QE | `/test-strategy` |
| C5 | Threat Model | FS 14 AppSec | `/security-review` + `threat-modeling` |
| G4 | Design sign-off | all stage C owners | `/gate G4` |

---

## C1 · SA View — architecture and integration

**In** — BRD, Systems & Projects Context Doc.

**Do** — Package Design (client architecture) and Integration Design (the
contracts this client consumes).

> **DB schema is out of MVP scope.** API contracts are read **read-only**
> from existing API documentation. Where a needed contract does not exist,
> that is a finding and a dependency on another team — not licence to design
> the shape you would prefer.

**Out** — `PACKAGE DESIGN` + `INTEGRATION DESIGN` → Confluence.
Templates: `vnd.ai-sdlc.package-design/v1`, `vnd.ai-sdlc.integration-design/v1`.

**Done when** — scalability and security risk reviewed, **every API contract
confirmed with the relevant party**, and no BRD rule violated.

"Confirmed" means a person on the owning side agreed the contract is current
and will not change underneath us. A link to documentation is not
confirmation; documentation goes stale silently.

---

## C2 · Comm View — Function List and SRS

**In** — BRD + PRD + C1.

**Do** — detail every acceptance criterion into individually testable
requirements; assign `USn` ids per user story; trace each item back to
`F-NNN` / `AC-NNN`.

**Out** — `FUNCTION LIST` + `SRS` → Confluence.
Templates: `vnd.ai-sdlc.function-list/v1`, `vnd.ai-sdlc.srs/v1`.

**Done when** — scope agreed by PM and C-level, **every requirement
testable**, and every SRS item carrying a trace link up to the PRD.

### `USn` ids travel further than they look

`US1-02` ends up in Figma frame names, task filenames and test names. Assign
them once. A provisional id renumbered later breaks references in four places
and **none of them error** — the task simply points at a frame that is not
there.

### Every state, listed here

Each story lists loading, empty, partial, error *per failure mode*, success,
offline, permission-denied, first-run and overflow. C3 draws frames from this
list. **A state missing here is a frame nobody designs and a branch nobody
codes**, which is where most late rework originates.

---

## C3 · UI/UX and design tokens

**In** — PRD (personas, journeys) and the SRS.

**Do** — wireframe → hi-fi in Figma; name frames by `USn`; export design
tokens; write an interaction spec for every state.

**Out** — `FIGMA FRAMES` (**published file key, never `unsaved-*`**) +
`DESIGN TOKENS`. Template: `vnd.ai-sdlc.ui-spec/v1`.

**Done when** — ≥ 1 round of feedback from representative users, WCAG 2.1 AA,
Figma is the source of truth (ADR-0010), and every frame has a stable
`nodeId` a task can reference.

> **The file key is a hard DoD.** When a Figma file key changes, every
> `mcp_ref` pointing into it dies at once — no warning, no error, just tasks
> referencing frames that are not there. This organisation has been bitten:
> 61 task files still carry a stale `unsaved-*` key beside the real URL.

A round of feedback with the team is not a round with representative users.

---

## C4 · Test strategy

**In** — PRD, SRS.

**Do** — define the test pyramid and coverage thresholds, and commit to
shift-left: **QA writes test cases as soon as the SRS exists, not after code
appears.** Cases written from the SRS find requirement defects while they are
cheap; cases written from code can only confirm the code does what it does.

**Out** — `TEST STRATEGY` → Confluence. Template:
`vnd.ai-sdlc.test-strategy/v1`.

**Done when** — coverage thresholds **fixed as numbers** with the enforcing
mechanism named, and **every PRD acceptance criterion has at least one
sketched test case**.

> **Set the thresholds per project.** The 80% overall / 90% domain figures
> come from Stockbook, and it is not established that they are an
> organisational standard. Inheriting them without deciding is how a number
> nobody chose ends up blocking a merge nobody can justify.

An AC with no possible test case is usually a B2 defect found cheaply —
report it back rather than inventing a case that tests something adjacent.

---

## C5 · Threat model

**In** — C1 + C2.

**Do** — STRIDE per feature: actor, attack, mitigation, residual risk. The
`threat-modeling` skill already exists.

**Out** — `THREAT MODEL` → `docs/specs/<slug>/threat-model.md` in the repo
(not Confluence — this one lives on the repo plane). Template:
`vnd.ai-sdlc.threat-model/v1`.

**Done when** — a security requirement per component, findings carry
severity, and **risk acceptance is signed**.

---

## G4 · Design sign-off — HARD GATE

**Every stage C owner signs, per output.** Each output must meet its own DoD,
listed above. **Any output short of its DoD → stage P does not start.**

| Decision | Meaning |
|---|---|
| `SIGNED-OFF` | every output meets its DoD, every owner has signed |
| `DOD-NOT-MET` | at least one output falls short — named |
| `ANOTHER-ROUND` | signed in principle, one more revision agreed |

Recorded as `verified` on each artefact plus `gates[G4]` in the manifest.

### G4 turns on mandatory version control

From this point, **any change to a signed-off artefact requires** a new
version number, a stated reason, and notification of everyone who read the
previous version.

The spec is blunt about why: *an architect designing against BRD v1.0 that
the PM quietly edited to v1.1 is the most expensive source of rework in the
entire process.* Nothing in the pipeline detects that drift on its own —
which is why the discipline is a gate obligation rather than a convention.

---

## What Stage C hands to Stage P

A signed-off design set — Package and Integration Design, Function List and
SRS with complete traces, Figma frames on a stable key, a Test Strategy with
real numbers, and a threat model with signed risk acceptance. Stage P mirrors
these into the repo plane and breaks the SRS into executable tasks; it can
only do that faithfully if the `USn` ids and the Figma `nodeId`s are stable,
which is what C2 and C3's DoDs protect.

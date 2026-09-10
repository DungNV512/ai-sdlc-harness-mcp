# Stage B — Define, and the G2 / G3 sign-off gates

Stage A decided the problem is worth solving. Stage B decides precisely what
must be true of any solution (the BRD) and which of those things we will
build (the PRD). It ends with two gates that are each two-part, and that is
where teams most often cut corners.

Owner: **FS 18 PM**, co-owner **FS 20 Architect**.

The traceability spine starts here and runs the length of the process:

```
BR-001  →  F-012  →  AC-034  →  US1-02  →  code  →  test  →  MR
 BRD        PRD       PRD        SRS       D        E        F
```

Every id in that chain is permanent. Deleting one, or reusing a number,
silently repoints a trace that four other documents depend on.

---

## Ownership

| Phase | Produces | Who drives | Command |
|---|---|---|---|
| B0 | Systems & Projects Context Doc | **Humans only** — PM + Architect | `/context-doc` (scribe) |
| B1 | BRD | AI generator ×2 + AI reviewer | `/brd` |
| G2 | BRD sign-off | C-level **and** Architect | `/gate G2` |
| B2 | PRD | AI generator ×2 + AI reviewer | `/prd` |
| G3 | PRD sign-off | PM and team | `/gate G3` |

---

## B0 · Prepare system context

**In** — the G1 Go decision, plus internal knowledge of running systems,
parallel projects, technical debt and regulatory position.

**Do** — PM and Architect **sit together and fill it**. List only systems with
a plausible relationship. The Architect personally fills the technical debt
and data/integration sections.

**Out** — `SYSTEMS & PROJECTS CONTEXT DOC` → Confluence.
Template: `vnd.ai-sdlc.systems-context/v1`.

**Done when** — the Architect has reviewed it and added the technical
sections.

> **Hard dependency.** In a regulated domain, the BRD **cannot be finalised**
> until legal has advised. Record the request date here so the wait is
> visible now rather than discovered at G2.

**Why no AI generation.** This phase's entire value is what two experienced
people know and have never written down. An invented row here is worse than a
blank one, because it will be trusted at C1. The harness scribes, checks
completeness, and may surface systems it found *evidence* for in the repo —
as a question, never as an entry.

---

## B1 · BRD — Business Requirements

**In** — the approved Discovery Report, Company Context Doc, Systems &
Projects Context Doc, and a description of how the business works today.

**Do** — draft Business Context and Stakeholders, with success metrics linked
to a company OKR. Then draft business rules in four families with ids. The PM
edits. An AI reviewer checks five angles. C-level approves.

**Out** — `BRD`, five sections, rules carrying `BR / DR / SR / IR-NNN` →
Confluence. Template: `vnd.ai-sdlc.brd/v1`.

### The four rule families

| Prefix | Family | Belongs here |
|---|---|---|
| `BR` | Business | eligibility, limits, entitlements, lifecycle |
| `DR` | Data | what is held, how long, how accurate, who owns the record |
| `SR` | Security | authn, authz, confidentiality, audit, segregation of duties |
| `IR` | Integration | interaction with **named** systems |

### Done when — all seven

1. Every rule has a **unique id**.
2. **No rule contradicts another.** `SR` against `BR` is where they hide.
3. Integration rules **name a specific system**. "Must integrate with the
   identity system" fails; "must obtain the verified identity from the iVND
   identity service" passes.
4. Every success metric has **a number and a deadline**. A metric that could
   never be shown to have failed cannot be shown to have been met.
5. **C-level has approved** Business Context and Business Rules.
6. **The Architect has confirmed in writing** that no technical constraint is
   missing.
7. **Regulated domain: legal has confirmed** before finalisation.

### The reviewer pass — five angles

Contradiction · silence · assumption-as-fact · unfalsifiable metric · vague
integration. Dispatch a fresh agent; one that helped write the draft
rediscovers its own assumptions and finds them sound.

---

## G2 · BRD sign-off — HARD GATE, two parts

Both are required. Neither substitutes for the other.

**1. C-level approval** (1 hour) of Business Context and Business Rules → the
BRD's status becomes `Approved`.

**2. BRD walkthrough with the Architect** — **≥ 60 minutes, sitting
together**, not a file sent and a reply awaited. The required output is a
**written** confirmation (email or comment) that they read the whole
document, no rule is misunderstood, and no technical constraint is missing.

**No written confirmation → not done.**

| Decision | Meaning |
|---|---|
| `APPROVED` | both parts complete |
| `IN-REVIEW` | one part outstanding |
| `BLOCKED` | waiting on legal in a regulated domain |

Recorded as `verified` on the BRD artefact plus `gates[G2]` in the manifest.

**This is the step most often quietly cut** — C-level signs, the walkthrough
is replaced by "I've sent it to the architect", and the missing constraint
surfaces in stage D. `/gate` refuses a G2 record with only one part for
exactly that reason.

---

## B2 · PRD — Product Requirements

**In** — the approved BRD, both context docs, user research (or an explicit
"none yet — using ICP"), and the Discovery Report for out-of-scope.

**Do** — draft Overview, Personas and Journeys. Then the Feature List with
MoSCoW **and the two-way check**. The PM decides priority — not the AI. An AI
reviewer reads it from two angles.

**Out** — `PRD`, seven sections, ids `F-NNN · AC-NNN · Q-NNN` → Confluence.
Template: `vnd.ai-sdlc.prd/v1`.

### The two-way trace check

**Forward** — for each BRD rule, which features implement it? A rule with no
feature is either out of scope (say so) or an omission awaiting discovery
during build.

**Backward** — for each feature, which rule does it serve? **A feature that
traces to nothing is scope creep.** Find its rule or cut it.

This is the most valuable mechanical check in the upstream half, because it
catches in an afternoon what otherwise surfaces as an argument in sprint
three.

### Done when — all eight

1. Every Must-have feature has **≥ 2 testable acceptance criteria**.
2. No feature contradicts a BRD rule.
3. Every feature traces to **≥ 1 rule**.
4. Out of scope agreed by PM **and** C-level.
5. **A developer can estimate from it** without asking a basic question.
6. **QA can write test cases from it** without asking a basic question.
7. Personas state their source: **validated or assumption**.
8. Every open question has **a named owner and a deadline**.

Items 5 and 6 are literal. Give the PRD to an engineer and a QE; what they
have to ask you is the list of what is missing.

---

## G3 · PRD sign-off — HARD GATE, two parts

**1. Team review** (1 hour): Dev, QA, Designer, PM.

**2. Sprint 0 kick-off** (**90 minutes**): walk through the entire PRD. Every
question raised goes into Open Questions with an owner and a deadline.

> This is **not a presentation meeting**. It is a meeting for the team to ask
> and the PM to listen. A Sprint 0 where the PM talks for 80 minutes has not
> happened.

| Decision | Meaning |
|---|---|
| `APPROVED` | both meetings held, open questions closed or owned |
| `FIX-TOP-3` | approved subject to three named fixes |
| `NOT-RIPE` | too many open questions — **stage C must not start** |

Many unanswered open questions means the PRD is not ripe. Record `NOT-RIPE`
rather than `APPROVED` with a caveat; a caveat is not a gate.

---

## What Stage B hands to Stage C

An approved BRD whose rules are uniquely identified and mutually consistent,
and an approved PRD whose every feature traces to one of those rules. C1
designs against the BRD; C2 details the PRD's acceptance criteria into
testable requirements. Neither can start from a document still carrying
unresolved contradictions — which is what G2 and G3 exist to prevent.

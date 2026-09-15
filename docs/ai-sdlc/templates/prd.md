# PRD template — Product Requirements Document

`schema: vnd.ai-sdlc.prd/v2`

The B2 artefact. Where the BRD says what must be true, the PRD picks what we
will build — and the check that makes it trustworthy is bidirectional
coverage against the BRD.

Conventions: `docs/ai-sdlc/document-conventions.md`.

**Why v2 carries more than the real examples do.** The organisation's
strongest real documents are its SRSs; its weakest is the PRD — the one read
for this revision (`DCHAT ADMIN`, space SC) is a link list and a topology
diagram, with its own PRD and SRS links empty. The result downstream is
visible in the Omnichannel SRS, which had to note *"PRD thiếu persona
TEAM_LEAD, PLATFORM_ADMIN và UNIT_ADMIN — PO cần backfill"*: three roles that
reached the design stage undefined because the PRD never named them. Sections
2, 4 and 8 below exist to make that specific failure impossible.

```markdown
# PRD — <initiative>

- **Version**: 1.0   **Status**: Draft | In review | Approved
- **PM**: <name>   **Date**: <YYYY-MM-DD>
- **Sources**: BRD <link> (approved) · Company Context <link> ·
  Systems & Projects Context <link> · Discovery Report <link> ·
  IPAM Way canvas <link>

**Id formats used in this document**: `F-NNN` (feature) · `AC-NNN` ·
`Q-NNN` · `C00N` (feature category) · `A-nn` (decision register). Ids are
permanent; a cut feature keeps its number and is marked `Won't` (C-3).

## 1. Overview

<What we are building and for whom, in one paragraph. A developer who reads
only this should know what the thing is.>

## 2. Personas

| Persona | Who they are | What they are trying to do | Data scope | Source |
|---|---|---|---|---|
| | | | OWN / TEAM / UNIT / ALL | **validated** (research, <date>) or **assumption** (ICP) |

**Every role the system will have gets a row — including administrative and
operational roles nobody demos.** The Data scope column is what stage C turns
into a permissions matrix; a role that first appears at C2 arrives with no
scope, no persona and no acceptance criteria.

The Source column is a DoD item, not decoration. A persona built from six
interviews and one built from a guess look identical on the page and lead to
very different decisions.

Where there is no research at all, say so plainly here: *"No user research
conducted — personas derived from the ICP in the Company Context Doc."* That
is a legitimate position and a known risk. A fabricated research citation is
neither.

## 3. User journeys

<The paths through the product, per persona. Name the steps; C3 will build
frames against them.>

## 4. Feature list

MoSCoW. **The PM sets priority — not the AI, and not the loudest
stakeholder.**

Group features under a category id (`C00N`); stage C2 reuses those same
categories to group its requirements.

| ID | Category | Feature | Priority | Traces to | Acceptance criteria |
|---|---|---|---|---|---|
| F-001 | C001 | | Must / Should / Could / Won't | BR-003, SR-002 | AC-001, AC-002 |

## 5. Acceptance criteria

Every Must-have feature needs **at least two**, and each must be testable —
QA should be able to write a test case from it without asking a question.

| ID | Feature | Given / When / Then |
|---|---|---|
| AC-001 | F-001 | |

## 6. Out of scope

<Agreed by PM **and** C-level. Each line says why, briefly — an out-of-scope
list without reasons gets re-litigated every sprint.>

## 7. Open questions

| ID | Question | Owner | Needed by | Blocks |
|---|---|---|---|---|
| Q-001 | | <a person, by name> | <date> | <what cannot start> |

## 8. Coverage check

The output of the two-way trace check, recorded rather than described.

| Direction | Result |
|---|---|
| Rules with no feature | <ids, or `Không có`> |
| Features tracing to no rule | <ids, or `Không có`> |

## 9. Version history

| Version | Date | Change | Author |
|---|---|---|---|
```

## The two-way trace check

This is the highest-value mechanical check in the entire upstream half, and
it runs in both directions:

**Forward — is every rule covered?**
For each `BR/DR/SR/IR` in the BRD, which features implement it? A rule with
no feature is either out of scope (say so, in section 6) or an omission
about to be discovered during build.

**Backward — does every feature trace?**
For each `F-NNN`, which rule does it serve? **A feature that traces to
nothing is scope creep.** Not "possibly gold-plating", not "worth a
conversation" — the spec names it, so name it too, and either find the rule
it serves or cut it.

Produce the check as a table in the review, not as a claim that it was done:

| Rule | Covered by | | Feature | Traces to |
|---|---|---|---|---|
| BR-001 | F-003, F-007 | | F-003 | BR-001 |
| BR-002 | **nothing** | | F-011 | **nothing — scope creep** |

## DoD — all eleven

1. Every Must-have feature has **≥ 2 testable acceptance criteria**.
2. **No feature contradicts a BRD business rule.**
3. **Every feature traces to ≥ 1 rule** — untraceable is scope creep.
4. **Out of scope agreed** by PM and C-level.
5. **A developer can estimate from it** without asking a basic question.
6. **QA can write test cases from it** without asking a basic question.
7. **Personas state their source** — validated or assumption.
8. **Every open question has a named owner and a deadline.**
9. **Every role the system will have has a persona row with a data scope** —
   including administrative and operational roles. This is the one that stops
   a role reaching C2 undefined.
10. **The coverage check is recorded in section 8**, both directions, with
    `Không có` where a direction is clean (C-4).
11. **Version history has a row per change** since 1.0 (C-2).

Items 5 and 6 are not rhetorical. Before declaring B2 done, give the PRD to
an engineer and a QE and ask them for an estimate and a test case. What they
have to ask you is the list of what is still missing.

## The reviewer pass — two angles

Mandatory before G3. A fresh reviewer reads it twice:

- **As a developer**: what would I have to guess to build this? Where are two
  readings possible? What happens in the failure case nobody described?
- **As a PM**: which feature does not earn its priority? What did we commit
  to that no metric will measure?

## Anti-patterns

- Letting the AI set MoSCoW.
- A Must-have with one acceptance criterion, or with criteria that cannot be
  turned into a test.
- Personas with no source column.
- Carrying an unanswered `Q-NNN` into G3 — the gate exists partly to catch
  exactly that, and a PRD with many open questions is not ripe for stage C.
- Quietly widening scope in the feature list without a matching BRD rule.

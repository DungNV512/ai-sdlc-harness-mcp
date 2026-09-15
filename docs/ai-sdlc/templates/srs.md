# SRS template — Software Requirements Specification

`schema: vnd.ai-sdlc.srs/v2`

The C2 artefact stage D builds from, and the one QA writes test cases against
before code exists. Every acceptance criterion in the PRD is detailed here
into requirements that are individually testable.

**v2 is derived from two real, shipped SRSs** — `SRS Omnichannel Phase 1`
(MID) and `SRS: Stockbook` (SN). Where they agreed, v2 adopts the shared
shape. Where they diverged, v2 takes the stronger side and says why:

| Divergence | Omnichannel | Stockbook | v2 takes |
|---|---|---|---|
| Requirement ids | `FR-<AREA>-NNN` | `FR-###` flat | **`FR-<AREA>-NNN`** — the area segment survives renumbering pressure and makes an orphan obvious |
| Traceability | explicit FR↔US table | prose changelog only | **explicit table** — a trace a script cannot read is not a trace |
| Diagrams | mermaid flow/state/sitemap | none | **mermaid, inline** (C-8) |
| Permissions | full RBAC matrix + scope | narrative in two FRs | **matrix** where more than one role exists |
| Data | — | entity register with PII/retention/volume | **entity register** — it doubles as the data-governance record |
| Glossary | inline in §1.3 | dedicated §8 | **dedicated section** |

Conventions: `docs/ai-sdlc/document-conventions.md`.

**`USn` ids travel** — `US1-02` is story 2 of epic 1, and that id reaches
Figma frame names, task filenames and test names. Renaming one later breaks
four references silently (C-3).

---

```markdown
# SRS — <initiative>

- **Version**: 1.0   **Status**: Draft | In review | Approved
- **Owner**: <Architect / BA, by name>   **Date**: <YYYY-MM-DD>
- **Sources**: BRD <link> · PRD <link> · C1 SA View <link>

**Id formats used in this document**: `FR-<AREA>-NNN` · `NFR-NNN` ·
`USn-NN` · `C00N` (feature category) · `BR-NNN` (rules, from the BRD) ·
`A-nn` (decision register). Withdrawn ids keep their number (C-3).

## 1. Overview and scope

### 1.1 Purpose and context

<What this system does and the business outcome it serves. One paragraph.
Cite the PRD's OKR rather than restating it.>

### 1.2 Scope

**In scope**, by feature category:

| Category | Capability | Source |
|---|---|---|
| C001 | | US.01–03 / F-001 |

**Out of scope**, with the phase that will carry it:

| Capability | Why not now | Where instead |
|---|---|---|

### 1.3 Assumptions, constraints and dependencies

| Type | Statement |
|---|---|
| Assumption | <and what would invalidate it> |
| Constraint | <technical, regulatory, contractual> |
| Dependency | <the named system or team, and what we need from it> |

## 2. Actors and roles

| Role | Description | Primary goal | Data scope |
|---|---|---|---|

## 3. Flows

Mermaid, inline (C-8). At minimum: the end-to-end happy path, and a state
machine for any entity with more than two states.

```mermaid
stateDiagram-v2
  [*] --> new
```

## 4. Functional requirements

Grouped by category. One block per requirement.

### C001 — <category name>

#### FR-<AREA>-001 — <requirement title>

**User story**: As a <persona>, I want <capability>, so that <outcome>.
**Traces to**: F-003 · AC-007, AC-008 · BR-001
**Story id**: US1-01

**Behaviour** — numbered steps where order matters:

- **B1** <first step, with its threshold if it has one>
- **B2** <next>

**Acceptance criteria** — Given / When / Then, one per line, each testable
without asking a question:

| ID | Given | When | Then |
|---|---|---|---|
| AC-007 | | | |

**States** — every state this requirement can be in, and the behaviour in
each: loading · empty · error *per failure mode* · success · offline ·
permission-denied · first-run · overflow. C3 draws one frame per state; a
state missing here is a frame nobody designs and a branch nobody codes.

**Rules applied**: <the `BR/DR/SR/IR` ids this honours, and how>
**Out of scope for this requirement**: <the adjacent thing a reader assumes>

## 5. Non-functional requirements

Grouped, each with a number, a measurement point and a percentile where one
applies (C-9).

| ID | Group | Requirement | Threshold | Measured at |
|---|---|---|---|---|
| NFR-001 | Performance | | <e.g. <500ms p95> | <e.g. inbound gateway> |
| NFR-002 | Load | | | |
| NFR-003 | Availability | | | |
| NFR-004 | Security | | | |
| NFR-005 | Compliance | | | |
| NFR-006 | Usability | | | |

## 6. Permissions matrix

Required whenever more than one role exists. Deny-by-default; the matrix is
the whole authority.

| # | Function | <ROLE A> | <ROLE B> | Scope | FR |
|---|---|---|---|---|---|
| P01 | | ✅ | ❌ | OWN / TEAM / UNIT / ALL | FR-SEC-001 |

Scope definitions: `OWN` ⊂ `TEAM` ⊂ `UNIT` ⊂ `ALL`, each stated as the
predicate it compiles to (`assignee_id = user_id`, `unit_id = token.unit_id`).

## 7. Entity register

Doubles as the data-governance record.

| Entity | Description | PII | Retention | Volume (Y1) | Growth |
|---|---|---|---|---|---|

## 8. Integration points

| System | Direction | Purpose | Data exchanged | Owner |
|---|---|---|---|---|

## 9. Traceability

Every row complete. An SRS item with no link up to the PRD is a requirement
someone invented at stage C (C-7).

| SRS item | PRD (F / AC) | BRD rule | Figma frame | Test case |
|---|---|---|---|---|
| FR-CV-001 | F-003 / AC-007 | BR-001 | US1-01 Portfolio / default | TC-014 |

## 10. Glossary

| Term | Definition |
|---|---|

## 11. Open questions

| ID | Question | Owner | Needed by | Blocks |
|---|---|---|---|---|
| Q-001 | | <a person> | <date> | |

## 12. Version history

| Version | Date | Change | Author |
|---|---|---|---|
```

---

## DoD — all nine must hold

1. **Every requirement is individually testable** — each AC is a
   Given/When/Then a QA can write a case from without asking a question.
2. **Every SRS item traces up to the PRD** in section 9, with no blank cells.
3. **Every requirement lists all of its states**, not only the happy path.
4. **Every NFR carries a number, a measurement point and a percentile** where
   one applies. No number, no requirement.
5. **`USn` ids are assigned and stable**, and withdrawn ids keep their number.
6. **A permissions matrix exists** wherever more than one role exists, with a
   scope per cell.
7. **Every entity in the register states PII and retention** — both, for every
   row, because that pair is what a compliance review asks for first.
8. **Every integration point names the system and its owner** — "the identity
   service" fails, "iVND identity service, owned by <team>" passes.
9. **Flows are mermaid and inline**, not a link to a board.

## The reviewer pass

Dispatch a fresh agent before G4 and require all four:

1. **Untestable AC** — which criterion cannot be turned into a test case?
2. **Missing state** — which requirement handles success and one error, and
   nothing else?
3. **Orphan** — which requirement traces to nothing in the PRD?
4. **Aspirational NFR** — which threshold has no number, or no measurement
   point to read it at?

## Anti-patterns

- A requirement bundling three checks into one sentence. Split it; each gets
  its own id and its own test.
- "The system should handle errors gracefully."
- Provisional `USn` ids, renumbered later — four downstream references break
  and none of them error.
- Specifying implementation. The SRS says what must be true, not which class
  does it.
- A trace that lives only in the version-history prose. It is unreadable to
  every check that matters and it is the one thing an SRS is uniquely able to
  give the phases after it.

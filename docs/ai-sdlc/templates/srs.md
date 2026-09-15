# SRS template — Software Requirements Specification

`schema: vnd.ai-sdlc.srs/v1`

The C2 artefact that stage D actually builds from, and the one QA writes test
cases against before code exists. Every acceptance criterion in the PRD is
detailed here into requirements that are individually testable.

**User stories carry `USn` ids** — `US1-02` is story 2 of epic 1 — and those
ids travel all the way into Figma frame names, task filenames and test names.
Renaming one later breaks references in four places silently, so name them
once, carefully.

```markdown
# SRS — <initiative>

- **Author**: <Architect / BA>   **Date**: <YYYY-MM-DD>   **Version**: 1.0
- **Sources**: BRD <link> · PRD <link> · C1 SA View <link>

## 1. Scope

<What this specifies, and the boundary with what it does not.>

## 2. User stories and requirements

### US1-01 — <story title>

> As a <persona>, I want <capability>, so that <outcome>.

**Traces to**: F-003 · AC-007, AC-008 · BR-001

| Req | Requirement | Testable how |
|---|---|---|
| US1-01.R1 | <a single, checkable statement> | <the observation that proves it> |

**States**: <every state this story can be in — loading, empty, error per
failure mode, success, offline, permission-denied — and the required
behaviour in each. C3 draws frames from this list; a state missing here is a
frame nobody designs and a branch nobody codes.>

**Data**: <what is read, what is written, from which system of record>

**Rules applied**: <the `BR/DR/SR/IR` ids this story must honour, and how>

**Out of scope for this story**: <the adjacent thing a reader will assume>

---

### US1-02 — <next story>
...

## 3. Non-functional requirements

| ID | Requirement | Threshold | How measured |
|---|---|---|---|
| NFR-01 | <e.g. portfolio screen interactive after cold start> | <a number> | <the measurement> |

<A non-functional requirement without a number is an aspiration. "Fast"
cannot be tested; "interactive within 2.0s at p95 on the device matrix" can.>

## 4. Trace matrix

| SRS item | PRD | BRD | Function | Figma frame |
|---|---|---|---|---|
| US1-01.R1 | AC-007 | BR-001 | FN-001 | US1-01 Portfolio / default |

<This table is the DoD. Every row must be complete; an SRS item with no link
up to the PRD is a requirement someone invented at stage C.>
```

## DoD

- **Every requirement is testable** — the "Testable how" column is filled with
  an observation, not "verify it works".
- **Every SRS item has a trace link up to the PRD.**
- Every user story lists all of its states, not only the happy path.
- Non-functional requirements carry numbers and a measurement method.
- `USn` ids assigned and stable.

## Anti-patterns

- A requirement that bundles three checks into one sentence. Split it; each
  gets its own id and its own test.
- "The system should handle errors gracefully."
- Assigning `USn` ids provisionally and renumbering later — four downstream
  references break and none of them error.
- Specifying implementation. The SRS says what must be true, not which class
  does it.

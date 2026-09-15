# Definition of Done — every phase, one table

`/ship-feature` reads **the rows for the phase it is running**; `/audit` reads
the whole file. This is the index, not the authority: each stage document owns
its own DoD in full, and where this file and a stage document disagree, **the
stage document wins** and this file is the thing to fix.

| Authority | Covers |
|---|---|
| `stage-a-discovery.md` | A0–A5, G1 |
| `stage-b-definition.md` | B0–B2, G2, G3 |
| `stage-c-design.md` | C1–C5, G4 |
| `delivery-phases.md` | Phases 0–8, G5 |

Three rules hold across every row and are not repeated in each one:

1. **Evidence over assertion.** A claim about code cites `file:line`; a claim
   about a check cites the command and its output.
2. **A check that did not run is reported as "did not run"** — never as
   passed, and never as failed on its merits.
3. **Stop at the first phase whose exit condition fails**, and say which one.
   A phase does not proceed degraded.

---

## Upstream — Stages A, B, C

| Phase | Artefact | Done when | Count |
|---|---|---|---|
| A1 | Idea Card | Observation, interpretation and proposed solution are in separate fields; the observed-problem field contains no solution verb | 1 |
| A2 | Problem Canvas | One A4 page; a single root problem, not parallel symptoms; a fresh reader can answer whose problem, when, how much it hurts | 3 |
| A3 | Market Scan + Feasibility | Every figure verified against a named source by a human; the advantage claimed is specific **and** defensible | 2 |
| A4 | Discovery Report | Five sections, five pages; adversarial reviewer pass done and its five hardest questions answered | 2 |
| A5 | IPAM Way + OMVP | Every stakeholder function has a row (`Không có` where unrepresented); all eight Insight cells filled; the Problem is one sentence; **every Mobilise row has a named person and a date** | 4 |
| **G1** | Feasibility decision | Minutes URL recorded; `GO` requires `ipam_way` and `omvp` filled; `NO-GO` requires `submitter_notified`; `NEED-DATA` requires all three of its fields | — |
| B0 | Systems Context | Architect personally filled the technical-debt and data/integration sections; regulatory wait recorded with its request date | 7 |
| B1 | BRD | Unique ids; no contradiction; `IR` rules name a real system; every metric has a number **and** a date; C-level approved; architect confirmed in writing; legal cleared if regulated; every stakeholder function has a row; version history per change | 9 |
| **G2** | BRD sign-off | **Both** parts: C-level approval **and** a ≥60-minute architect walkthrough confirmed in writing. One part alone is refused | — |
| B2 | PRD | Every Must-have has ≥2 testable ACs; no contradiction of the BRD; every feature traces to ≥1 rule; out-of-scope agreed by PM and C-level; a developer can estimate and QA can write cases without asking; personas state validated-or-assumption; every open question owned with a date; **every role has a persona row with a data scope**; two-way coverage recorded both directions; version history per change | 11 |
| **G3** | PRD sign-off | **Both** meetings: 1h team review **and** 90-minute Sprint 0. More than **2** open questions with no named owner → `NOT-RIPE`, Stage C does not start | — |
| C1 | Package + Integration Design | Scalability and security reviewed; **every API contract confirmed by a person**, not by a link to documentation; no BRD rule violated | 3 |
| C2 | Function List + SRS | Scope agreed; every requirement individually testable; every item traces up with no blank cells; every state listed, not just the happy path; every NFR carries a number, a measurement point and its business goal; permissions matrix wherever roles > 1, with a data scope per cell; every entity states **PII and retention**; every integration names system and owner; flows are inline mermaid | 9 |
| C3 | Figma frames + tokens | ≥1 round of feedback from **representative users**, not the team; WCAG 2.1 AA on real values; **a published file key, never `unsaved-*`**; every frame has a stable `nodeId` | 4 |
| C4 | Test Strategy | Coverage thresholds fixed **as numbers** with the enforcing mechanism named, decided for this project; every PRD acceptance criterion has at least one sketched test case | 2 |
| C5 | Threat Model | A security requirement per component; every finding carries a severity; **risk acceptance signed** | 3 |
| **G4** | Design sign-off | Every output meets its own DoD and every owner has signed, per output. Any output short → `DOD-NOT-MET`, stage P does not start. **Turns on mandatory version control** for every signed artefact | — |

---

## Delivery — Phases 0–8

| Phase | Artefact | Done when | Count |
|---|---|---|---|
| 0 | `traceability.yaml` | Every source named **and dated**; scope written including what is out; upstream blocks present if the work came that way and **omitted entirely** if it did not; ticket key or `Không có` | 4 |
| 1 | `plan.md` | Sub-tasks listed with ids; every open question explicit and owned; no sub-task depends on an answer that does not exist | 3 |
| 2 | `spec.md` | **A failing test can be written from it** by someone who was not in the conversation; every requirement has an id tracing up to an `FR-###` or the ticket; error and edge behaviour specified | 3 |
| 3 | ADR (if architectural) | ≥2 real options compared; decision and consequences recorded; the rejected option described well enough to show it was considered | 3 |
| 4 | code + tests | The **project's own** test command passes, resolved not assumed; every task id moved to `done` or `dropped` with a reason; new behaviour has a test that **fails without the change**; nothing outside the declared paths changed | 4 |
| 5 | review findings | `review-checklist.md` walked section by section; **no `block` or `major` unresolved**; every finding cites `file:line`; the reviewing agent did not write the code | 4 |
| 6 | STRIDE table | `security-checklist.md` walked end to end; **no high residual risk without a named follow-up owner**; secrets scanned over the diff **and its history**; every new external input names where it is validated | 4 |
| 7 | PR / MR | Every template section filled or `Không có`; **CI green where CI exists**, reported as missing where it does not; PR body cites task ids and ticket key; a named reviewer requested | 4 |
| 7.5 | trace closed, reader copy published | **NOT BUILT** — no command, no template. The trace ends at the manifest and the wiki is updated by hand | 0 |
| **G5** | Human merge | `mr_url` recorded; `approved_by` is **a named human**, never the harness or a bot; `minutes` present. Manifest moves to `shipped` and `/notify-merge` has run | — |

---

## Rows a project adds for itself

Coverage thresholds, platform release checks, and anything else specific to
one repository belong here rather than in the tables above.

| Phase | Extra condition | Set by |
|---|---|---|
| — | `Không có` | — |

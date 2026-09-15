# Cookbook — running the harness on real work

`stage-*.md` says what each phase is. `document-conventions.md` says how the
documents are written. This file says **what you actually type**, in what
order, and what stops you.

Every recipe below is a sequence of commands that exist today. Where a step
is human-only, it says so — those are not gaps, they are the gates.

---

## 0 · First run in a repo

```
/harness-init
```

Detects your real toolchain and layout (never assumes), then scaffolds
`docs/ai-sdlc/`: `project.yml`, `phases.md`, `integration.md`,
`document-conventions.md`, `check-conventions.py`, the three stage specs and
all 23 templates.

**Then do these two things by hand**, because nothing downstream is honest
until they are done:

1. Fill `docs/ai-sdlc/company-context.md`. `/harness-init` seeds it with
   every field marked `NEEDS OWNER — not yet filled`. Every Stage A and B
   prompt reads it; unfilled, your analysis is about a generic company.
2. Assign it an owner and a review cadence. It is standing background, not
   a per-feature artefact, and it goes stale silently.

Check the scaffold landed correctly:

```
python3 docs/ai-sdlc/check-conventions.py
```

---

## 1 · A new idea, all the way to a design sign-off

The long path. Use it when nobody has decided yet whether this should exist.

| Step | Command | Who decides | Blocks on |
|---|---|---|---|
| A1 | `/idea-card <slug>` | AI drafts | the observed-problem field containing `cần` · `nên` · `tính năng` · `build` · `làm` · `tạo` |
| A2 | `/problem-canvas <slug>` | **a 30–45 min session with the person who raised it** | one A4 page; symptoms with no single root → split the slug |
| A3 | `/market-scan <slug>` | AI drafts, **a human verifies every figure against its source** | an advantage that is specific *and* defensible; "we will do it better" is rejected |
| A4 | `/discovery-report <slug>` | AI drafts + **mandatory adversarial reviewer pass** | five sections, five pages, the reviewer's five hardest questions answered honestly |
| A5 | `/ipam-way <slug>` | **the working team fills it; the AI scribes** | every stakeholder function has a row · all eight Insight cells · P is one sentence · **every Mobilise row has a named person and a date** |
| G1 | *60-minute meeting. No AI in the room.* | C-level | — |
| — | `/gate G1 <slug>` | records what people decided | minutes URL; `GO` needs `ipam_way` and `omvp` filled |
| B0 | `/context-doc <slug>` | **PM + Architect sit together**; AI scribes only | the Architect personally filling the technical-debt and integration sections |
| B1 | `/brd <slug>` | AI ×2 + reviewer; C-level approves | 9 DoD items — unique ids, no contradictions, `IR` rules naming a real system, metrics with a number *and* a date |
| G2 | *C-level approval **and** a ≥60-min walkthrough with the Architect* | both, in writing | `/gate` refuses a record with only one of the two |
| B2 | `/prd <slug>` | **the PM sets priority, not the AI** | 11 DoD items — including the two-way trace check and a persona row for **every** role |
| G3 | *1h team review **and** a 90-min Sprint 0* | PM + team | more than 2 unowned open questions → `NOT-RIPE`, stage C does not start |
| C1 | `/sa-view <slug>` | Architect | **every API contract confirmed by a person**, not by a docs link |
| C2 | `/srs <slug>` | Architect | 9 DoD items — testable ACs, every state, numeric NFRs, trace table complete |
| C3 | `/ui-spec <slug>` | PX designer | a **published** Figma key, never `unsaved-*` |
| C4 | `/test-strategy <slug>` | QE | coverage thresholds as numbers, decided for *this* project |
| C5 | `/security-review <slug>` | AppSec | a security requirement per component; risk acceptance signed |
| G4 | *every stage C owner signs, per output* | all of them | any output short of its DoD → `DOD-NOT-MET`, stage P does not start |

C3 and C4 run in parallel; both need C2 first. C1 → C2 → C3 is a hard
ordering, not a preference.

---

## 2 · A bug fix or a small change

Do **not** run Stage A. Work may legitimately enter at Phase 0:

```
/plan-feature <slug> <TICKET-KEY>
/spec <slug>
… implement …
/review <slug>
/security-review <slug>
/pr <slug>
```

`/plan-feature` generates `docs/specs/<slug>/traceability.yaml` and **omits
the `discovery`, `define` and `design` blocks entirely** — an omitted block
means "not applicable", a present-but-`PENDING` block means "applicable, not
done yet". Collapsing that distinction is the bug the v3 schema exists to
prevent.

The one rule that still applies: **`sources` is never empty.** No ticket and
no Stage A artefact → `/plan-feature` writes the manifest, says so, and stops
before planning.

---

## 3 · The gate came back NEED-DATA

```
/gate G1 <slug> NEED-DATA
```

It will demand three fields and refuse without all of them: `needed_data`,
`data_owner`, `return_by`. That refusal is the feature — a NEED-DATA with no
owner and no date is an abandoned idea nobody has admitted to abandoning.

When the data arrives, re-run the gate. `/gate` will **not** overwrite a
recorded decision; it stops and shows you what is already there, and a human
decides how to represent the second decision.

---

## 4 · A rule changed after G2

You are past a sign-off, so version control is now an obligation, not a
convention:

1. Bump the artefact's version.
2. Add a **version-history row saying what changed** — not "updated" (C-2).
3. Notify everyone who read the previous version.
4. Re-run the two-way trace check in `/prd` — a changed `BR` may orphan a
   feature or leave a rule uncovered.

The spec is blunt about why: an architect designing against BRD v1.0 that the
PM quietly edited to v1.1 is the most expensive rework in the whole process,
and nothing in the pipeline detects it on its own.

---

## 5 · A role turned up that the PRD never named

This is common and it is a PRD defect, not an SRS one. The symptom: you reach
C2 and need a permissions matrix for a role with no persona and no acceptance
criteria.

Do not invent the persona in the SRS. Go back:

```
/prd <slug>          # add the role's persona row + data scope, bump version
/srs <slug>          # now the matrix has something to reference
```

Then set `define.roles_defined` in the manifest. `/gate G4` refuses a
sign-off where `roles_defined` has more than one entry and
`design.permissions_matrix` is still `false`.

---

## 6 · Two source documents disagree

Stockbook's document is the house form (C-0). But check which case you are in
first, because they resolve differently:

| | Resolution |
|---|---|
| Both documents do X, differently | Stockbook wins |
| Only one does X at all | Not a conflict — it is an addition. Keep it, name its source. |
| Neither does X, but a `stage-*.md` or `traceability.yaml` needs it | The spec wins |

The third row is not theoretical: Stockbook's SRS keeps its trace in a prose
changelog, which no check can read, so the SRS template keeps a trace **table**
and labels it as the exception.

---

## 7 · Before you commit anything under `docs/ai-sdlc/`

```
python3 docs/ai-sdlc/check-conventions.py
```

Checks C-1 identity blocks, C-2 version histories, schema-version consistency
between templates and the commands that produce them, and that every schema
id referenced has a template and vice versa. Exit 1 on any failure.

Run it. It exists because a command once declared `vnd.ai-sdlc.srs/v2` in its
header while every one of its steps still described v1's shape — a drift
invisible to `plugin validate`, to the JSON parsers, and to a person reading
quickly.

---

## 8 · Publishing a skill so the team gets it

```
/skill-new <name>       # scaffolds it on its own branch
/skill-submit           # validates, bumps the plugin version, opens Jira + PR
… a maintainer runs /skill-approve, a human merges …
/skill-sync             # on each consumer's machine
```

**The version bump is what actually ships it.** `claude plugin update` reads
the version, not the commit — so a merged PR whose bump was cancelled out by
a parallel merge reaches nobody, and `/skill-sync` reports "already at the
latest version" forever. `/skill-approve` compares the branch's version
against **`main` as it stands now**, not against the PR's base, precisely
because of that failure.

---

## What still needs a human, always

- **G1** — the AI does not attend, summarise, recommend or vote.
- **B0** — an invented system in the context doc is worse than a blank row,
  because C1 will trust it.
- **A5's Interbeing, Mobilise and Budget blocks** — names, owners, dates and
  money. An invented owner reads as agreed at G2.
- **Priority in the PRD** — the PM decides, not the AI and not the loudest
  stakeholder.
- **The merge at G5.** The harness never merges its own work.

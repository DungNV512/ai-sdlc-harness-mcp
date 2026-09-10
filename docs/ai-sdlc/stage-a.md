# Stage A — Discovery, and the G1 feasibility gate

Phases 0–8 in `phases.md` describe delivery: they start from a task that
someone has already decided is worth doing. Stage A is what happens before
that decision. It turns an unstructured signal from anywhere in the company
into a Discovery Report a C-level can rule on, and G1 is where that ruling
happens.

Stage A exists because the expensive mistake is not building a feature badly.
It is building the right-looking feature for a problem nobody actually has.
Every DoD below is written to catch that failure early, while it still costs a
working session instead of a quarter.

**Where the rest of the framework lives.** Stage B (Define) is specified in
`stage-b.md` and Stage C (Design) in `stage-c.md`, each with its own gates.
Stages P, D, E, F and O are the delivery half — see `phases.md`.

**The Company Context Doc is a prerequisite for all of Stage A.** Every
prompt from A1 onward reads it, and without it the analysis is about a
generic company rather than yours. Template:
`docs/ai-sdlc/templates/company-context.md`. It is standing, not
per-feature — one owner, a fixed review cadence, no gate.

---

## Ownership and what "AI tool" means per stage

| Stage | What it produces | Who drives | Build status |
|---|---|---|---|
| A0 Issue intake | Issue Report | AI tool | `vnd.ai-sdlc.issue-report/v1`; the channel itself is infrastructure, not a command |
| A1 Signal normalisation | Idea Card | AI tool | `/idea-card` |
| A2 Problem framing | Problem Statement Canvas | AI generator + a human working session | `/problem-canvas` |
| A3 Market & feasibility scan | Market Scan Report, Feasibility Assessment | AI generator + tools, human verifies figures | `/market-scan` |
| A4 Discovery synthesis | Discovery Report | AI generator + mandatory AI reviewer | `/discovery-report` |
| G1 Feasibility gate | Decision + minutes | **Humans only** | `/gate G1` records the outcome |

At G1 the AI does not participate. It does not attend, summarise, recommend,
or cast an opinion. `/gate` writes down what people decided; it never decides.

---

## A0 · Issue intake channel

**In** — raw issues from anyone in the company, in no particular format.

**Do** — stand up one submission point, with a five-field Issue Template. The
proposed-solution field is **separate and optional**: a submitter who has a
solution in mind should be able to say so without that solution contaminating
the problem statement. Commit publicly to a response time.

**Out** — `ISSUE REPORT` → Confluence, plus a continuously maintained backlog.
Template: `vnd.ai-sdlc.issue-report/v1`.

**Done when** — within 3–5 working days the submitter has received exactly one
of three answers: taken into the cycle; deferred, with the reason; or merged
into an issue already being tracked. Silence is a failure of this stage, not a
neutral outcome.

---

## A1 · Signal normalisation

**In** — the raw idea verbatim (email, chat, meeting notes), the Issue Report,
and the Company Context Doc.

**Do** — fill the Idea Card using **only** what is present in the input.
Separate observation from interpretation from proposed solution. Record how
often it happens and how many people it touches. Cluster related issues when
several point at the same area.

**Out** — `IDEA CARD` → Confluence. Template: `vnd.ai-sdlc.idea-card/v1`.

**Done when** — the *observed problem* field contains none of these words:

> `cần` · `nên` · `tính năng` · `build` · `làm` · `tạo`
> (and their English equivalents: `need`, `should`, `feature`, `build`,
> `make`, `create`)

This is a mechanical check and `/idea-card` enforces it. The reason it is a
hard rule and not a style note: every one of those words smuggles a solution
into the slot reserved for the observation. "Users need a bulk export button"
is a solution wearing a problem's clothes. "Ops staff re-key 40–60 rows into
Excel each morning, taking about an hour" is an observation, and it leaves
room for an answer nobody has thought of yet.

---

## A2 · Problem framing

**In** — Idea Card, Company Context Doc, and a hypothesis about the root
problem.

**Do** — a 30–45 minute working session with the person who raised it. Draft a
canvas with four parts: **WHO** / **WHAT** / **WHY IT MATTERS** / **WHY NOW**.
Write it for the *root* problem, not for each symptom separately.

**Out** — `PROBLEM STATEMENT CANVAS`, one A4 page maximum → Confluence.
Template: `vnd.ai-sdlc.problem-statement-canvas/v1`.

**Done when** — someone with no involvement in the project can read it and
answer: *whose problem is this, when does it happen, and how much does it
hurt?* If they cannot, the canvas is not finished, however complete it looks.

---

## A3 · Market and feasibility scan

**In** — Problem Statement Canvas, Company Context Doc (technology and
resources sections).

**Do** — three streams, in parallel:

1. **Competitor scan**, 5–8 of them — including the ones that are a
   spreadsheet and a manual process, because that is usually the real
   incumbent and the hardest to displace.
2. **Market sizing**, TAM/SAM bottom-up, expressed as a Low / Mid / High
   range rather than a single number.
3. **Internal feasibility** — can this team, with this stack, in this
   quarter.

A human verifies the figures. Not reviews them: verifies them, against the
source.

**Out** — `MARKET SCAN REPORT` and `FEASIBILITY ASSESSMENT` → Confluence.
Templates: `vnd.ai-sdlc.market-scan/v1`, `vnd.ai-sdlc.feasibility-assessment/v1`.

**Done when** — there is at least one advantage that is both **specific** and
**defensible**. "We will do it better" is not an advantage and is rejected at
this DoD. Any number that could not be verified against a source carries the
label `[ước tính]` / `[estimate]` inline, next to the number — not in a
footnote, not in a caveat paragraph at the end.

---

## A4 · Discovery synthesis

**In** — the outputs of A2 and A3, plus the Company Context Doc.

**Do** — draft the five sections. The PM resolves every contradiction the AI
flagged rather than leaving it in. Then run the **mandatory** AI reviewer pass,
which is adversarial by design and must produce three things:

- every logical gap it can find,
- every assumption currently being treated as an established fact,
- the five hardest questions a sceptical C-level would ask.

Only after that does the PM settle on a recommendation.

**Out** — `DISCOVERY REPORT`, five sections, five pages maximum → Confluence.
Template: `vnd.ai-sdlc.discovery-report/v1`.

**Done when** — a C-level who reads it arrives at the gate asking the *right*
question. If they have to ask "so whose problem is this again?", the report
failed. If it needs more than five pages, the problem statement was never
sharp enough — the fix is upstream in A2, not a longer document.

---

## G1 · Feasibility gate — HARD GATE

**No AI participation.** A 60-minute meeting, and not a minute longer.

**In the room** — C-level (decides), PM (presents), Tech Lead (only if there
is real technical risk to weigh).

**Three questions, in this order:**

1. Is this worth building compared with everything already in the backlog?
2. Is this the right moment?
3. What exactly is our advantage, and will it last?

**Outcomes**

| Decision | What it obliges | Recorded as |
|---|---|---|
| **GO** | Proceed to Stage B; resources allocated | `gates.G1.decision: GO` |
| **NO-GO** | Idea Card archived with the reason, **and the submitter told** | `decision: NO-GO` + `reason` + `submitter_notified` |
| **NEED-DATA** | Name the data, name who fetches it, name the date the gate reconvenes | `decision: NEED-DATA` + `needed_data` + `data_owner` + `return_by` |

NEED-DATA is not a polite no. A NEED-DATA with no owner and no return date is
an abandoned idea that nobody has admitted to abandoning, so `/gate` refuses
to record one without all three fields.

**The record** — minutes in Confluence, and `gates.G1` in the feature's
`docs/specs/<slug>/traceability.yaml`. Both. The minutes are what a person
reads later; the traceability entry is what the harness reads.

---

## What Stage A hands to delivery

A GO at G1 produces a `docs/specs/<slug>/traceability.yaml` whose `discovery`
block links every Stage A artefact and whose `gates.G1` records the decision.
That file is the input to Stage B, which turns the approved Discovery Report
into a BRD and a PRD — see `stage-b.md`. Work that skips discovery entirely
(a bug fix, a small change) enters at Phase 0 instead, and `/plan-feature`
reads the same manifest, refusing to plan anything whose `sources` block is
empty — the same rule A1 enforces, applied later.

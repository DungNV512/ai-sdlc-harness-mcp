---
description: Record a human gate decision (G1 feasibility, G2 BRD sign-off, G3 PRD sign-off, G4 design sign-off, G5 human merge) into the feature's traceability.yaml. Writes down what people decided; never decides, recommends or summarises the meeting.
argument-hint: <gate-id> <slug> [decision]
allowed-tools: Read, Write, Edit, Bash
---

# /gate $ARGUMENTS

Records the outcome of a human gate. See `docs/ai-sdlc/stage-a-discovery.md` (G1),
`stage-b-definition.md` (G2, G3) and `stage-c-design.md` (G4).

**What this command is not.** It does not decide, recommend, weigh options,
or summarise the discussion. This is a scribe with a schema: it writes down
what humans decided, and refuses to write a decision that is missing the
obligations that decision carries.

At G1 in particular the AI does not participate at all — not attending, not
summarising, not offering a view.

## The five gates

| Gate | After | Who decides | Outcomes |
|---|---|---|---|
| `G1` | A4 | C-level | `GO` · `NO-GO` · `NEED-DATA` |
| `G2` | B1 | C-level **and** Architect | `APPROVED` · `IN-REVIEW` · `BLOCKED` |
| `G3` | B2 | PM and team | `APPROVED` · `FIX-TOP-3` · `NOT-RIPE` |
| `G4` | C1–C5 | every stage C owner | `SIGNED-OFF` · `DOD-NOT-MET` · `ANOTHER-ROUND` |
| `G5` | F3 | a human reviewer | `MERGED` · `CHANGES-REQUESTED` · `CLOSED` |

## Step 1 — Locate the feature

Require `docs/specs/<slug>/traceability.yaml`. Missing → stop: a gate decision
with nothing to attach to is a decision that will be lost. Say to run the
stage commands, or `/harness-init` if the repo has no harness.

## Step 2 — Collect what the gate requires

Ask for whatever was not passed as an argument. **Never infer any of it.**

Common to every gate: `decision`, `date`, `decided_by` (a person, by name or
role — not "the committee"; someone decided), and `minutes` (the Confluence
URL of the record).

Then the per-gate obligations:

### G1 — Feasibility
- `NO-GO` → `reason`, and `submitter_notified` (the date the person who
  raised it was told).
- `NEED-DATA` → `needed_data`, `data_owner`, `return_by`. All three.

### G2 — BRD sign-off, **two parts, both required**
1. `c_level_approved` — the one-hour approval of Business Context and
   Business Rules, with who and when.
2. `architect_confirmation` — a link to the **written** confirmation (email
   or comment) that the Architect read the whole BRD, no rule is
   misunderstood, and no technical constraint is missing. The walkthrough is
   ≥ 60 minutes **sitting together**, not a file sent and a reply awaited.

**C-level approval alone does not pass G2.** The spec names this as the step
most often quietly cut, so refuse a G2 record with only one of the two.

`BLOCKED` → `blocked_on` (typically legal advice in a regulated domain).

### G3 — PRD sign-off, **two parts, both required**
1. `team_review` — one hour with Dev, QA, Designer and PM.
2. `sprint0_kickoff` — 90 minutes walking through the whole PRD. Not a
   presentation: a meeting for the team to ask and the PM to listen.

Also `open_questions_closed` — every `Q-NNN` answered, or listed with an
owner and a deadline. **The threshold is fixed, not felt: more than 2 open
questions with no named owner and deadline means the PRD is not ripe and
stage C must not start.** Record `NOT-RIPE` rather than `APPROVED` with a
caveat. (A project may tighten this number in `project.yml`, never loosen
it — check there before applying the default of 2.)

### G4 — Design sign-off, **per output**
Every stage C owner signs, and **each output must meet its own DoD**. Record
a row per output — Package Design, Integration Design, Function List, SRS,
UI Spec, Test Strategy, Threat Model — with its owner, whether its DoD is
met, and the sign-off date.

**Any output short of its DoD → the gate is `DOD-NOT-MET` and stage P must
not start.** Do not record a partial sign-off as approved with notes.

G4 also **turns on mandatory version control**: from here, any change to a
signed-off artefact needs a new version, a stated reason, and notification of
everyone who read the old one. Record `version_control_active: true`. The
spec is blunt about why — an architect designing against BRD v1.0 that the PM
quietly edited to v1.1 is the most expensive source of rework in the whole
process.

### G5 — Human merge
`MERGED` → `mr_url`, `approved_by`. The harness never merges; this records
that a person did.

## Step 3 — Refuse an incomplete record

Stop, explain, write nothing when:

- **`minutes` is absent.** A gate decision with no record is hearsay. Offer
  to create the Confluence page with `create_confluence_page` instead of
  recording without one.
- **G1 `NO-GO` has no `submitter_notified`.** A0 promised the submitter an
  answer within 3–5 working days; a NO-GO that never reaches them breaks the
  intake channel's only promise, and the next person does not bother filing.
- **G1 `NEED-DATA`** missing any of its three fields. That is an abandoned
  idea nobody has admitted to abandoning.
- **G2 has only one of its two parts.**
- **G3 has only one of its two meetings.**
- **G4 is missing any stage C output**, or records one as signed without its
  DoD met.

These are refusals, not warnings. Do not write a partial record with a `TODO`.

## Step 4 — Write the record

Update `gates.<gate-id>` in `docs/specs/<slug>/traceability.yaml`, preserving
everything else. Set the top-level `status`:

| Decision | `status` |
|---|---|
| G1 `GO`, G2 `APPROVED`, G3 `APPROVED`, G4 `SIGNED-OFF` | `active` |
| G1 `NO-GO` | `abandoned` |
| G5 `MERGED` | `shipped` |
| anything else | unchanged — still in flight |

**Never overwrite a recorded decision.** If `gates.<gate-id>.decision` is
already something other than `PENDING`, stop and show what is there. A
re-run gate needs a new dated entry and a human deciding how to represent
that — not a silent replacement of the first decision.

## Step 5 — Notify

If `notifications.teams` is configured and `TEAMS_WEBHOOK_URL` is set, post
one card with `send_teams_message`:

| Decision class | Severity |
|---|---|
| `GO` / `APPROVED` / `SIGNED-OFF` / `MERGED` | `success` |
| `NO-GO` / `DOD-NOT-MET` / `CLOSED` | `warning` |
| `NEED-DATA` / `IN-REVIEW` / `FIX-TOP-3` / `NOT-RIPE` / `ANOTHER-ROUND` | `info` |

Facts: gate id, feature, decision, decided by, and any return date. One
button to the minutes.

**Teams is a loudspeaker, not the record.** The card carries links only —
never an approve button. If Teams is down the process continues; the
authoritative record is Confluence plus the manifest.

Webhook not configured → say the decision was recorded and no notification
was configured. Not a failure.

## Step 6 — Report

Print what was written and the next step: `/context-doc` after G1 GO, `/prd`
after G2, `/sa-view` after G3, stage P after G4, `/notify-merge` after G5.

## Anti-patterns to refuse

- Offering an opinion on whether the decision was right.
- Recording any decision with no minutes URL.
- Passing G2 on C-level approval alone, or G3 on one meeting.
- Recording G4 as signed when an output has not met its DoD.
- Writing a NO-GO without confirming the submitter was told.
- A NEED-DATA with an open-ended return date.
- Overwriting a decision already recorded.
- Summarising a transcript and calling it the minutes — the minutes are a
  human record; this command links to them.

---
description: Record a human gate decision (G1 feasibility gate) into the feature's traceability.yaml. Writes down what people decided; never decides, recommends or summarises the meeting.
argument-hint: <gate-id> <slug> [GO|NO-GO|NEED-DATA]
allowed-tools: Read, Write, Edit, Bash
---

# /gate $ARGUMENTS

Records the outcome of a human gate. See `docs/ai-sdlc/stage-a.md` for G1.

**What this command is not.** It does not decide, recommend, weigh options,
or summarise the discussion. At G1 the AI does not participate at all. This
command is a scribe with a schema: it writes down what humans decided, and it
refuses to write down a decision that is missing the obligations the decision
carries.

## Step 1 — Locate the feature

Require `docs/specs/<slug>/traceability.yaml`. If it is missing, stop — a gate
decision with nothing to attach to is a decision that will be lost. Say to run
the Stage A commands, or `/harness-init` if the repo has no harness at all.

## Step 2 — Collect the decision

Ask for whatever was not passed as an argument. Never infer any of it:

- **decision** — `GO`, `NO-GO` or `NEED-DATA`
- **date** — when the meeting happened
- **decided_by** — the person who actually decided, by name or role. Not
  "the committee". Someone decided.
- **minutes** — the Confluence URL of the meeting record

Then the obligations the decision carries:

| Decision | Also required |
|---|---|
| `GO` | nothing further — proceed to Stage B, resources allocated |
| `NO-GO` | `reason`, and `submitter_notified` (the date the person who raised it was told) |
| `NEED-DATA` | `needed_data`, `data_owner`, `return_by` — all three |

## Step 3 — Refuse an incomplete record

Stop, explain, and write nothing if:

- **minutes** is absent. A gate decision with no minutes is hearsay. Offer to
  create the Confluence page with `create_confluence_page` instead of
  recording the decision without one.
- **NO-GO** has no `submitter_notified`. The A0 contract promised the
  submitter an answer within 3–5 working days; a NO-GO that never reaches them
  breaks the intake channel's only promise, and the next person does not
  bother submitting.
- **NEED-DATA** is missing any of `needed_data`, `data_owner`, `return_by`.
  A NEED-DATA without all three is an abandoned idea nobody has admitted to
  abandoning. Say exactly that, and ask for the missing field.

These are refusals, not warnings. Do not write a partial record with a
`TODO` in it.

## Step 4 — Write the record

Update `gates.<gate-id>` in `docs/specs/<slug>/traceability.yaml`, preserving
everything else in the file. Set `status` at the top of the file:

- `GO` → `status: active`
- `NO-GO` → `status: abandoned`
- `NEED-DATA` → leave `status` unchanged; the feature is still in discovery

Never overwrite an existing recorded decision. If `gates.<gate-id>.decision`
is already something other than `PENDING`, stop and show what is there — a
gate that was re-run needs a new dated entry and a human deciding how to
represent that, not a silent overwrite of the first decision.

## Step 5 — Notify

If `notifications.teams` is configured in `docs/ai-sdlc/project.yml` and
`TEAMS_WEBHOOK_URL` is set, post one card with `send_teams_message`:

- `GO` → severity `success`
- `NO-GO` → severity `warning`
- `NEED-DATA` → severity `info`

Facts: gate id, feature, decision, decided by, and for NEED-DATA the return
date. One action button to the minutes. Nothing else — the card announces the
decision, it does not editorialise about it.

If the webhook is not configured, that is not a failure: say the decision was
recorded and no notification was configured, and move on.

## Step 6 — Report

Print what was written, and the next step: `/plan-feature <slug>` on a GO, the
archive note on a NO-GO, or the `return_by` date on a NEED-DATA.

## Anti-patterns to refuse

- Offering an opinion on whether the decision was right.
- Recording a decision with no minutes URL.
- Writing a NO-GO without confirming the submitter was told.
- Writing a NEED-DATA with an open-ended return date.
- Overwriting a gate decision that is already recorded.
- Summarising the meeting from a transcript and calling that the minutes —
  the minutes are a human record; this command links to them.

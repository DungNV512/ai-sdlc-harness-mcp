---
description: Stage A1 - turn a raw signal (email, chat, meeting note, issue report) into a normalised Idea Card, separating observation from interpretation from proposed solution. Enforces the A1 DoD mechanically.
argument-hint: <slug> [--source=<path-or-url>]
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# /idea-card $ARGUMENTS

Stage A1. See `docs/ai-sdlc/stage-a.md` for where this sits.

Takes a raw signal and produces `docs/specs/<slug>/idea-card.md` against
`vnd.ai-sdlc.idea-card/v1`. The whole job is separating three things that
arrive fused together: what was **observed**, what we **infer**, and what the
submitter **proposed**.

## Step 1 — Get the raw input, verbatim

From `--source` (a file path, a Confluence page id, or a Jira key), or from
what the user pastes. Read it whole before writing anything.

If the source is a Confluence page or Jira issue, fetch it with
`get_confluence_page` / `get_jira_issue` rather than asking the user to
copy-paste — and record the id and retrieval date; a stale source that looks
current is worse than an absent one.

## Step 2 — Fill the card from the input and nothing else

Use the template at `docs/ai-sdlc/templates/idea-card.md`. The one rule that
governs every field: **only what the input contains**. Where the input is
silent, the field says so.

- **Observed problem** — behaviour a third party could go and watch.
- **Interpretation** — ours, and labelled as ours.
- **Proposed solution (as given)** — quoted, not improved. "None offered" is
  a good value.
- **Frequency and scope** — with evidence, or `[ước tính]` on the guesses.
- **What is not known** — never empty on a first pass. If you cannot think of
  anything unknown, you filled the card from assumption rather than input.

## Step 3 — Run the DoD check before writing the file

The **Observed problem** field must contain none of:

`cần` · `nên` · `tính năng` · `build` · `làm` · `tạo`
`need` · `should` · `feature` · `build` · `make` · `create`

Check it as a word match (case-insensitive, word-boundary — so "building" in
"the building's ground floor" is not a hit, but "build a dashboard" is).

If it fails: **do not write the file and do not quietly reword it into
compliance**. Show the offending sentence, explain which word triggered it,
and rewrite the observation with the user — the words are a symptom of a
solution having replaced an observation, and silently deleting the word
leaves the solution in place. Then re-check.

## Step 4 — Cluster, do not duplicate

Before writing, `grep` existing `docs/specs/*/idea-card.md` for the same area.
If one is clearly about the same underlying thing, add this signal to that
card's **Related signals** and its frequency evidence instead of opening a
second card. Two cards for one problem is how a real pattern gets split into
two dismissible anecdotes.

## Step 5 — Write, and seed traceability

Write `docs/specs/<slug>/idea-card.md`.

Create or update `docs/specs/<slug>/traceability.yaml` from
`docs/ai-sdlc/templates/traceability.yaml`: fill `slug`, `title`, `created`,
`sources` (the raw signal — this is the entry that stops the feature being an
orphan later), and `discovery.idea_card`. Leave the rest at `PENDING — <reason>`.

If `notifications.teams` is configured and a webhook is set, do **not** notify
here. A1 is not a decision; the notification points are the ones in
`/skill-submit` and `/gate`.

## Step 6 — Report

Print the card, the DoD check result, whether it clustered into an existing
card, and the next command (`/problem-canvas <slug>`).

## Anti-patterns to refuse

- Writing an observation that contains a solution, however lightly disguised.
- Reworking the submitter's proposed solution into a better one. Quote it.
- Filling **What is not known** with "nothing" to make the card look finished.
- Inventing frequency or scope numbers. `[ước tính]` or leave it open.
- Opening a second card for a problem an existing card already covers.

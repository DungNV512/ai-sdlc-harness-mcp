---
description: Stage A2 - frame the root problem on a one-page canvas (WHO / WHAT / WHY IT MATTERS / WHY NOW) from an Idea Card, ready for the market and feasibility scan.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# /problem-canvas $ARGUMENTS

Stage A2. See `docs/ai-sdlc/stage-a.md`.

Produces `docs/specs/<slug>/problem-statement-canvas.md` against
`vnd.ai-sdlc.problem-statement-canvas/v1`. One A4 page, written for the
**root** problem.

## Step 1 — Pre-conditions

Require `docs/specs/<slug>/idea-card.md`. If it is missing, stop and say to
run `/idea-card <slug>` first — A2 cannot frame a signal that was never
normalised.

Read the Idea Card and the Company Context Doc if the project has one
(`docs/ai-sdlc/company-context.md`, or the path in `project.yml`).

## Step 2 — This stage has a human in it

A2 is a 30–45 minute working session with the person who raised the issue.
Claude drafts; the session is where the root problem actually gets found.

Run it as a conversation, not a form: ask about the last time it happened,
what they did instead, what they tried already, and what would have to be true
for the problem to disappear. Then write.

If the user is running this non-interactively, draft the canvas from the Idea
Card alone and mark it `DRAFT — not yet worked through with <person>` at the
top. Do not present an unvalidated canvas as a finished one.

## Step 3 — Find the root, not the symptoms

Before writing: list the symptoms the Idea Card records, then ask what single
thing would explain all of them. If nothing explains all of them, you have two
problems — say so and split the slug rather than writing one canvas that
covers neither well.

A canvas that lists five parallel symptoms is A2 unfinished.

## Step 4 — Write the four parts

Use the template. Each part earns its space:

- **WHO** — a role and a rough number. If it spreads evenly across four
  audiences, the root problem has probably not been found yet.
- **WHAT** — behaviour and consequence, still no solution. `[ước tính]` on
  unverified numbers.
- **WHY IT MATTERS** — tied to something the business already measures.
  "It is inefficient" is not a consequence.
- **WHY NOW** — and if the honest answer is "nothing in particular", write
  that. G1 needs to hear it; it is a legitimate finding, not a failure.

Then the root problem hypothesis in one sentence, and what is out of scope.

## Step 5 — Enforce the page limit

One A4 page. Roughly 500–600 words of body text. If the draft is longer, cut —
do not shrink the font of the argument by moving things to a footnote. The
limit is what forces the framing to be sharp.

## Step 6 — DoD check

State it plainly to the user: *someone outside the project should be able to
read this and answer whose problem it is, when it happens, and how much it
hurts.* Recommend actually testing it on a person before A3, and say that
hesitation on any of the three means cutting, not adding.

## Step 7 — Write and update traceability

Write the canvas. Update `docs/specs/<slug>/traceability.yaml`:
`discovery.problem_statement_canvas`, and refine `title` if the root problem
turned out to be different from what the Idea Card called it.

Report the next command: A3's market and feasibility scan.

## Anti-patterns to refuse

- A canvas longer than one page.
- Listing symptoms in parallel instead of finding what they are symptoms of.
- Writing a WHY NOW that is really a WHY (no time element) — or inventing
  urgency that the input does not support.
- Slipping a solution into WHAT.
- Presenting a desk-drafted canvas as one that came out of the working
  session.

---
description: Stage A5 - scribe the IPAM Way alignment canvas and the OMVP charter while the working team fills them. Enforces the two checks that matter - every stakeholder function has a row, and every workstream has a named owner and a date.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /ipam-way $ARGUMENTS

Stage A5. See `docs/ai-sdlc/stage-a-discovery.md`. Produces
`docs/specs/<slug>/ipam-way.md` against `vnd.ai-sdlc.ipam-way/v1`, and
`docs/specs/<slug>/omvp.md` against `vnd.ai-sdlc.omvp/v1`.

**Conventions**: `docs/ai-sdlc/document-conventions.md` — the identity block,
version history, declared permanent ids, explicit absence (`Không có`), inline
markers for unconfirmed claims, and the mapping table up to the artefact above.
Where two of the organisation's real documents disagree, Stockbook's form wins (C-0).

IPAM Way is the organisation's own method, not an import: **I**nterbeing ·
**I**ntention · **I**nsight · **I**nnovation · **I**ntegrity, then **P**roblem,
**A**pproach, **M**obilise. This command scribes it. It does not invent its
content — see step 2.

## Step 1 — Pre-conditions

Require `docs/specs/<slug>/discovery-report.md`. Missing → stop and say to run
`/discovery-report <slug>` first: the Insight block is a compression of the
Discovery Report, and compressing a document that does not exist means
inventing one.

Read the Company Context Doc (`docs/ai-sdlc/company-context.md`) for the
organisation's own function names — GTM, OEC/VCO, CDS, CXM or whatever this
company actually calls them. Do not use the example names from the template.

## Step 2 — This is a scribe, not a generator

Three blocks are **human-only**. Draft nothing in them from your own
reasoning:

- **Interbeing** — names. You cannot know who the Biz sponsor is. Ask.
- **M — Mobilise** — the accountable person and the date per workstream. An
  invented owner is worse than a blank one, because at G2 it reads as agreed.
- **Budget** (in the OMVP) — same reason.

You *may* compress the Discovery Report into the Insight block, and you *may*
propose the Approach, clearly marked as a proposal for the team to accept or
replace.

Where the team cannot answer, write `PENDING — <reason>`, never a plausible
fill. Where the answer is genuinely "none", write `Không có` — the template's
explicit-absence rule (C-4) exists because an omitted row reads as
"not yet asked" and a `Không có` row reads as "asked, and there is none".

## Step 3 — The P block gets one sentence

Both real IPAM Way boards leave P empty, and both jump from an Insight block
listing eleven problems to an Approach naming one solution. That gap is an
unstated selection step.

Ask the team directly: *of everything in Insight, which single problem is this
initiative solving?* Write the answer as one sentence. If the answer needs
two sentences, say plainly that this looks like two initiatives and ask which
one this canvas is for.

## Step 4 — Fill the four Insight lenses, all of them

Current state and problems each have four lenses — commercial, operations,
business process, financial; and legal, product, governance, UX. **Eight cells,
none blank.** A lens that genuinely does not apply says so and why.

Numbers that could not be verified against a source carry `[ước tính]` inline,
next to the number (C-5).

## Step 5 — Hard checks before writing

Refuse to write, and name which check failed:

- Any stakeholder **function** missing from the table (not: any function with
  no representative — that is fine if it says `Không có`).
- Biz sponsor or Biz owner recorded as a team rather than a person.
- Intention with no explicit out-of-scope list.
- Any of the eight Insight cells blank.
- P longer than one sentence, or empty.
- **Any M row without both a named person and a date.** `?` is not a date.
- An Approach item that introduces scope the Intention block never listed —
  report it as scope creep found early, and ask whether Intention changes or
  the Approach item goes.

## Step 6 — The OMVP charter

One block per flow. A flow whose objective is the same as another flow's is
not a separate flow; merge them and say so.

Each phase (Discovery / Design / Development / Deployment) needs a date that
is either absolute or relative **to a named precondition**. `+1.5 months` from
nothing is not a date; `+2 weeks from PPC availability` is.

Each phase names the artefact it produces, not the phase name again.

RACI: exactly one `A` per activity. Two accountable people is none.

## Step 7 — Write and update traceability

Write both files. Update `docs/specs/<slug>/traceability.yaml`:
`discovery.ipam_way` and `discovery.omvp`.

## Step 8 — Report

Print: the count of stakeholder functions (and how many read `Không có`), the
eight Insight cells with their fill status, the P sentence, and — most
importantly — **the list of M rows still missing an owner or a date**. That
list is the actual output of this phase. Everything else can be revised at
G2; an unowned workstream cannot, because nobody is watching it.

## Anti-patterns to refuse

- Inventing a stakeholder name, an owner, a date or a budget figure.
- Copying the previous initiative's Insight block with the partner name
  changed. The two real boards share long passages verbatim while their volume
  figures differ by two orders of magnitude (2.5M/month vs 30K/day) — the
  analysis around a number has to change when the number does.
- Filling a blank Insight lens with a generic sentence so the table looks
  complete.
- Accepting `?` in the timeline column.
- Writing the Approach before the team has settled P.

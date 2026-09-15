# IPAM Way template — working-team alignment canvas

`schema: vnd.ai-sdlc.ipam-way/v1`

IPAM Way is the organisation's own method for getting a working team aligned
before design starts: who is involved, what we intend, what is actually true
today, what is new, what must not break — then the approach, then the work
broken down with a named owner and a date per workstream.

It is **not** a replacement for the Discovery Report or the BRD. It sits
across the A→B boundary and answers the question those two do not: *who is
doing what, by when, and what have we agreed not to disturb.* Everything
downstream of G1 reads it.

This template generalises two real, completed IPAM Way boards — *Bảo an bưu
gửi — VNPost* and *Bảo an bưu gửi — EMS* — and keeps their structure, their
four analytical lenses and their explicit-absence convention.

Conventions: see `docs/ai-sdlc/document-conventions.md`. C-4 (absence is
written down) is load-bearing here: the real boards write `Không có` under a
stakeholder group with no representative, and that is the point.

---

## The letters

| Letter | Block | What it settles |
|---|---|---|
| **I** | Interbeing · Intention · Insight · Innovation · Integrity | Who, what for, what is true, what is new, what must not break |
| **P** | Problem statement | The single problem, stated once |
| **A** | Approach | How we will solve it, including operational design |
| **M** | Mobilise | Who builds what, by when, producing what |

> **On the P block.** Both real boards leave **P empty**. That is a finding,
> not a template defect: the teams jumped from Insight straight to Approach.
> This template keeps P and makes it one sentence, because a board whose
> Insight lists eleven problems and whose Approach names one solution has an
> unstated selection step in the middle — and that step is where scope creep
> is born.

---

```markdown
# IPAM Way — <initiative>

- **Version**: 1.0   **Status**: Draft | In review | Approved
- **Owner**: <a person>   **Date**: <YYYY-MM-DD>
- **Sources**: Discovery Report <link> · G1 decision <link>

## I — Interbeing (who)

| Role | Name | Accountable for | Sign-off? |
|---|---|---|---|
| Biz sponsor | | the outcome and the budget | Yes |
| Biz owner | | the business decision | Yes |

**Stakeholders by function** — every function is listed, including the ones
with no representative. `Không có` is a valid and required answer.

| Function | Representative | What they need from this |
|---|---|---|
| <e.g. GTM — PM> | | |
| <e.g. GTM — PS> | | |
| <e.g. OEC / VCO> | | |
| <e.g. CDS> | | |
| <e.g. CXM> | `Không có` | |

## I — Intention (what for)

<One paragraph: what this initiative is for, in the business's words.>

| | |
|---|---|
| **In scope** | <listed explicitly, one per line> |
| **Out of scope** | <listed explicitly — the adjacent thing people will assume> |

## I — Insight (what is true today)

### Current state — four lenses, all four answered

| Lens | Current state |
|---|---|
| Kinh doanh / Commercial | <channel, product, volume, revenue — with numbers> |
| Vận hành / Operations | <how it is done today, including "not at all"> |
| Nghiệp vụ / Business process | <the user- and process-level reality> |
| Tài chính / Financial | <the money position for each party> |

Numbers carry `[ước tính]` inline where unverified (C-5).

### Problems and challenges — four lenses

| Lens | Problem / challenge |
|---|---|
| Pháp lý / Legal & regulatory | |
| Sản phẩm / Product | |
| Quản trị / Governance & scale | |
| Trải nghiệm người dùng / UX | |

### Opportunity and risk — stated per party

| Party | Opportunity | Risk |
|---|---|---|
| <us> | | |
| <partner> | | |

## I — Innovation (what is new)

<What is genuinely new here — a new architecture, a first partner, a
capability the organisation has not had. If nothing is new, write that; a
board with an empty Innovation block and a 6-month timeline is worth a
conversation before G2, not after.>

## I — Integrity (what must not break)

| Area | Constraint |
|---|---|
| Pháp lý / Legal | |
| Hệ thống / Systems | <e.g. partner must not edit insurance data directly> |
| Nghiệp vụ khác / Other processes | <e.g. no impact on the existing flow> |

## P — Problem

<One sentence. The single problem this initiative solves, selected from the
Insight block. If two sentences are needed, there are two initiatives.>

## A — Approach

<How the problem gets solved. Name the system boundary: which side initiates,
which side is the system of record, where money and documents flow.>

### Operational design

Each line is in scope or out, explicitly — never omitted.

| Aspect | Design | In scope? |
|---|---|---|
| Data landing in core | <what the core receives, keyed by what> | |
| Accounting / settlement | <cycle, automation level> | |
| Document issue | <what is issued, when, by whom> | |
| Reporting | | |
| Renewal | | `Không có` / out of scope |
| Amendment | | |
| Claim | | |

## M — Mobilise

One row per workstream. **A row with no named person and no date is not a
plan** — it is a wish, and `/gate` refuses it at G2.

| Domain | Workstream | Accountable (A) | Timeline | Output | Status |
|---|---|---|---|---|---|
| <e.g. BIS> | Codebook | | | | Ready / In progress / Blocked |
| <e.g. BIS> | Product master (PPM/PPC) | | | | |
| <e.g. BIS> | Business rules | | | | |
| <e.g. CDS> | API list + specs | | | | |
| <e.g. CDS> | Presentation layer | | | | |
| <e.g. BAS> | Core | | | | |
| <e.g. BAS> | Shared services (<name each>) | | | | |

### Open items

| ID | Item | Owner | Needed by | Blocks |
|---|---|---|---|---|
| Q-001 | | <a person> | <date> | <what cannot start> |

## Version history

| Version | Date | Change | Author |
|---|---|---|---|
```

---

## DoD — all six must hold

1. **Every stakeholder function has a row**, and a function with no
   representative says `Không có` rather than being absent from the table.
2. **Biz sponsor and Biz owner are named individuals**, not teams.
3. **Intention states both in scope and out of scope**, each as an explicit
   list.
4. **All four Insight lenses are answered** in both the current-state and the
   problem tables — eight cells, none blank. A lens that genuinely does not
   apply says so.
5. **The P block is one sentence.**
6. **Every M row has a named accountable person and a date.** This is the
   mechanical check that matters most: the real boards carry `?` in the
   timeline column for half their rows, and every one of those rows is work
   nobody has committed to.

## Anti-patterns

- A stakeholder table that omits functions rather than marking them
  `Không có` — an omission reads as "not yet asked", which is the state the
  table exists to eliminate.
- `?` as a timeline. It is not an estimate; it is an unowned row.
- An Approach block that introduces a scope item the Intention block never
  listed. That is scope creep with a head start, and the PRD's two-way trace
  check will find it two weeks later at a worse price.
- Copying the previous initiative's Insight block and changing the partner
  name. Both real boards share long passages verbatim — defensible where the
  situation genuinely repeats, and a problem when the volume figure
  (2.5M/month vs 30K/day) has changed and the analysis around it has not.

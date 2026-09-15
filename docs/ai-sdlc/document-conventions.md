# Document conventions — the rules every phase output obeys

`schema: vnd.ai-sdlc.document-conventions/v1`

Every template in `docs/ai-sdlc/templates/` inherits this file. It exists
because the organisation's real documents already converge on most of these
rules — and diverge on exactly the ones that cost the most when they differ.

These conventions were derived by reading real, shipped documents rather than
from first principles:

| Source read | What it contributed |
|---|---|
| `SRS Omnichannel Phase 1 — Agent Workspace MVP` (MID) | FR↔source mapping table · RBAC matrix with data scope · decision refs `[A-nn]` · mermaid flow/state/sitemap · deleted-id preservation note — all **additions**, none of them a conflict with Stockbook (C-0) |
| `SRS: Stockbook` (SN) | **The house form** (C-0): section skeleton, flat `FR-NNN` ids, Given/When/Then ACs in Vietnamese, NFR grouped by named category. Plus category ids `C00N` · in-document format declaration · version-history changelog · entity register with PII/retention/volume · glossary |
| `Web cấp đơn iPTI`, `Product Listing — Phúc An Sinh` (PMAP) | Overview block (Nhiệm vụ/Phạm vi/Biz document/Design) · screen table · API environment table (UAT / PROD per domain) · notification spec with field length limits |
| `DCHAT ADMIN` (SC) | The counter-example — a "PRD" that is a link list and a diagram. Convention C-1 exists because of it. |
| IPAM Way mindmaps (Bảo an bưu gửi — VNPost / EMS) | Explicit absence (`Không có`) · accountable-per-workstream · in/out scope stated at intent level |

---

## C-0 · Source precedence — Stockbook wins a conflict

When two real documents show different ways of doing the same thing, **the
Stockbook project's document is the house form.** Stockbook is this
framework's reference implementation — the harness was built against it — so
its conventions are the ones the organisation already has muscle memory for.

**A conflict is not the same as a silence**, and the two are resolved
differently:

| Situation | Resolution |
|---|---|
| Both documents do X, differently | **Stockbook's form wins.** |
| Only one document does X at all | Not a conflict. The section is an *addition*: keep it, and name the source it came from so the team can judge it on its merits. |
| Neither does X, but the framework spec requires it | The spec wins. A convention neither team happens to practise yet is still a requirement if `stage-*.md` or `traceability.yaml` depends on it. |

The third row matters more than it looks. Stockbook's SRS has no traceability
table — its trace lives in a prose changelog. That is a silence, not a
preference, and the framework's own spine (`BR-001 → F-012 → AC-034 →
US1-02 → code → test → MR`) cannot be read out of prose by any check that
runs. So the table stays, marked as what it is.

Where a template takes Stockbook's form over another document's, it says so
inline. Where it keeps an addition the Stockbook document does not have, it
says that too. No convention in this framework should require trusting
whoever wrote it.

---

## C-1 · Every artefact declares its own identity

The first block of every document, before any content:

```
- **Version**: <n.n>   **Status**: Draft | In review | Approved | Superseded
- **Owner**: <a person, by name — not a team>
- **Date**: <YYYY-MM-DD>
- **Sources**: <every upstream artefact this was derived from, linked>
```

A document with no owner and no source is not a phase output; it is a note.
`DCHAT ADMIN` is what happens without this rule: a page labelled PRD whose
own PRD and SRS links are empty.

## C-2 · Version history is a table, and it is a changelog

Last section of every artefact. Not a field — a table, one row per change:

| Version | Date | Change | Author |
|---|---|---|---|

The real SRSs carry 20+ rows of this and it is the single most consulted part
of the document after the requirements themselves. Write what changed, not
"updated". `Stockbook` goes further and annotates the change at the heading
it affected — `#### FR-022: Sửa bình luận *(v1.1.16 — bỏ giới hạn 30 phút)*` —
which is worth copying for any requirement that changed after sign-off.

## C-3 · IDs are permanent, and the document says so

Every artefact that issues ids declares its format before first use, the way
`Stockbook`'s SRS does — `**Định dạng**: FR-###`.

The id families across the whole framework:

| Family | Issued by | Example |
|---|---|---|
| `BR/DR/SR/IR-NNN` | BRD (B1) | `BR-001`, `IR-004` |
| `F-NNN` · `AC-NNN` · `Q-NNN` | PRD (B2) | `F-012`, `AC-034` |
| `C00N` | PRD/SRS feature category | `C003 — Profile` |
| `FR-NNN` | SRS (C2) | `FR-009`, `FR-061` — flat, Stockbook's form (C-0) |
| `NFR-NNN` | SRS (C2) | `NFR-015` |
| `USn-NN` | SRS (C2) | `US1-02` |
| `A-nn` | Decision register | `A-20` |
| `EC-nn` | Edge case | `EC-04` |
| `TM-nn` | Threat model finding | `TM-03` |

**A withdrawn item keeps its number.** Mark it withdrawn with a date and a
reason; never delete, never renumber, never reuse. The Omnichannel SRS states
this inside the document — *"giữ nguyên đánh số P08+ để không phá truy vết"* —
and that sentence belongs in any artefact where an item is removed after
sign-off.

`USn` ids are the worst case: they travel into Figma frame names, task
filenames and test names, and a renumber breaks all four **without erroring**.

## C-4 · Absence is written down

An empty section and a section that does not apply look identical on the page
and mean opposite things. The IPAM Way boards write `Không có` explicitly —
under a stakeholder group with no representative, under a renewal flow that
does not exist.

Every artefact does the same. Use one of:

- `Không có` / `None` — considered, and there genuinely is none.
- `PENDING — <reason>` — applies, not done yet, with why.
- `Out of scope — <where it is handled instead>`

Silence is none of these and is always a defect.

## C-5 · Unconfirmed content is marked inline, at the claim

Both real SRSs mark unconfirmed items where the claim sits, not in a footnote:
`Uptime ≥99.5% giờ HC *(cần xác nhận stakeholder)*`, `(Q6b — chờ xác nhận)`.

Two markers, used at the point of the claim:

- `*(cần xác nhận — <who>)*` / `*(unconfirmed — <who>)*` — someone must confirm.
- `[ước tính]` / `[estimate]` — a number not verified against a source.

An unverified number that reaches a gate without its marker is the defect,
not the number.

## C-6 · Decisions are referenced, not re-argued

When a decision has been taken, downstream text cites it rather than
restating the reasoning. The Omnichannel SRS threads `[A-05]`, `[A-13]`,
`[A-19]` … through its business-rule table, so every rule's authority is one
hop away.

Maintain the register in `docs/specs/<slug>/decisions.md`:

| ID | Decision | Date | Decided by | Supersedes |
|---|---|---|---|---|
| A-01 | | | <a person> | |

An ADR is the long form of the same thing; `A-nn` is the short form for
decisions that do not warrant a full ADR.

## C-7 · Every document that receives requirements carries a mapping table

The Omnichannel SRS has one (§3.4, FR ↔ US) and it is the reason a reader can
tell what a requirement is *for*. The Stockbook SRS does not, and its trace
lives scattered through a prose changelog — recoverable by a human, not by a
script.

Downstream artefacts (PRD, SRS, Test Strategy, UI Spec) each end with a table
mapping their own ids up to the artefact above. This is what `/gate` and the
two-way trace check read.

## C-8 · Diagrams are mermaid, in the document

Flows, state machines and sitemaps go in as mermaid — not as a screenshot,
not as a link to a drawing tool. The Omnichannel SRS renders its state machine
inline and it stays correct through edits; the PMAP pages link out to XMind
boards that a reader without access cannot open.

Link out only for artefacts that genuinely live elsewhere: Figma frames
(with a **published** file key, never `unsaved-*`) and data catalogues.

## C-9 · Non-functional requirements carry numbers or do not exist

Grouped by category — performance, load, availability, security, compliance,
usability — each with a threshold, a measurement point and a percentile where
one applies. `API <500ms p95 đo tại Inbound Gateway` is a requirement.
`Fast` is not.

## C-10 · One artefact, one written side

A document is written on exactly one plane and rendered read-only on the
other. Confluence-written artefacts (BRD, PRD, SRS, Discovery) are authored by
people and ingested into the repo; repo-written artefacts (spec, ADR, task,
traceability, threat model) are authored in git and published to Confluence
with a `do-not-edit` banner. A read-only render edited by hand raises
`drift: upstream_edited` and blocks.

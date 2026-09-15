---
description: Stage C2 - the Comm View. Function List and SRS, detailing every acceptance criterion into individually testable requirements with USn ids and a complete trace matrix.
argument-hint: <slug>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task
---

# /srs $ARGUMENTS

Stage C2. See `docs/ai-sdlc/stage-c-design.md`. Default agent: `architect`.

Produces `docs/specs/<slug>/function-list.md` and `docs/specs/<slug>/srs.md`
against `vnd.ai-sdlc.function-list/v1` and `vnd.ai-sdlc.srs/v2`.

This is what stage D builds from and what QA writes test cases against before
any code exists.

**Follow `docs/ai-sdlc/document-conventions.md` and the template's own shape.**
The SRS shape is **Stockbook's**, per the source-precedence rule (C-0): where
the organisation's two real SRSs disagree, Stockbook's form wins. Concretely
that means flat `FR-###` ids, its numbered section skeleton, Given/When/Then
acceptance criteria written as prose, and NFRs in five named groups. Do not
carry over the older `US1-01.R1` / "Testable how" table shape — that was
v1.

## Step 1 — Pre-conditions, all three

Require the **BRD**, the **PRD** (approved, `gates.G3`), and **C1's**
`package-design.md` + `integration-design.md`.

Missing C1 → stop. The spec is explicit: C2 needs both the BRD/PRD and the
Package Design, and lacking either produces a function list that is wrong or
cannot be built. Say which is missing rather than proceeding on the two you
have.

## Step 2 — Function List first

One row per function: description, trace up to `F-NNN`/`AC-NNN`, the user
stories that realise it, priority, and the SRS section specifying it.

Then the coverage table: every PRD feature and the functions covering it. A
Must-have feature with no function is a hole in the design. A function with
no feature is scope that entered at stage C — later and more expensive than
scope entering at B — so name it and remove it or trace it.

Scope needs **PM and C-level consensus** on this list. Record where that
happened.

## Step 3 — Assign `USn` ids carefully, once

`US1-02` is story 2 of epic 1. These ids travel into Figma frame names, task
filenames and test names.

**Assign them once and do not renumber.** A provisional id renumbered later
breaks references in four places and none of them error — the task simply
points at a frame that is not there. If the set needs restructuring, do it
before anything downstream cites them.

## Step 4 — Write the requirements in Stockbook's form

State the id format in the document before the first requirement —
`**Định dạng**: FR-###` — the way the reference SRS does.

`FR-###` is **flat across the whole document**, not restarted per category. A
new requirement takes the next free number wherever it sits; a withdrawn one
keeps its number. Do not renumber to make a category contiguous — the
reference SRS records a renumbering event (`FR-030 → FR-031`) precisely
because it was expensive.

Group requirements under the category ids (`C001`, `C002`, …) that the PRD
already assigned, reusing them verbatim as headings.

Each requirement is a block, not a table row:

- **User Story** — `Là <persona>, tôi muốn <capability>, để <outcome>.`
- **Nguồn** — `F-NNN · AC-NNN · BR-NNN · USn-NN`
- **Acceptance Criteria** — each written as prose:
  `Cho <điều kiện>, khi <hành động>, thì <kết quả quan sát được>.`
  A criterion a QA cannot write a case from without asking a question is not
  finished.
- **Trạng thái màn hình** — **every state**: loading, empty, partial, error
  per failure mode, success, offline, permission-denied, first-run, overflow.
  C3 draws frames from this list. **A state missing here is a frame nobody
  designs and a branch nobody codes** — where most late rework originates.
- **Quy tắc áp dụng** — the `BR/DR/SR/IR` ids honoured, and how.
- **Ngoài phạm vi của yêu cầu này** — the adjacent thing a reader assumes.

Where a requirement changed after sign-off, annotate at the heading itself —
`#### FR-022: <tên> *(v1.1.16 — bỏ giới hạn 30 phút)*` — so the diff is
visible where the requirement is read.

## Step 5 — Non-functional requirements, five named groups

`Hiệu suất` · `Bảo mật` · `Khả năng mở rộng` · `Khả dụng` · `Tuân thủ`. Each
row carries an id, a threshold **with a number**, the measurement point, and
the business goal it serves. "Fast" cannot be tested; "≤200ms p95 đo tại API
gateway" can. Without a number it is an aspiration and it will be quietly
dropped at E3.

## Step 6 — The four sections people forget

These are what separate a usable SRS from a requirements list. Write all four:

1. **Danh mục thực thể** — entity, description, **PII**, retention, volume,
   growth. PII and retention are both mandatory on every row; that pair is
   the first thing a compliance review asks for.
2. **Điểm tích hợp** — system, direction, purpose, data exchanged, and the
   **owning team**. "The identity service" fails; "iVND identity service,
   owned by <team>" passes.
3. **Ma trận phân quyền** — required whenever section 3 lists more than one
   role. Deny-by-default, one row per function, a data scope per cell, and
   the scope stated as the predicate it compiles to. Set
   `design.permissions_matrix: true` in the manifest once written.
4. **Bảng thuật ngữ** — every term a new reader would have to look up.

## Step 7 — Traceability, and why it is a table

Every SRS item linked to PRD (`F` / `AC`), BRD rule, Figma frame and test
case. **Every row complete.** An SRS item with no link up to the PRD is a
requirement someone invented at stage C.

The reference SRS keeps its trace in the version-history prose instead. That
is the one place this command does **not** follow it (C-0's third row): a
trace no check can read cannot serve `/gate` or the two-way trace check.
Write the table.

Print the incomplete rows explicitly rather than reporting a percentage.

## Step 8 — Close the document properly

**Câu hỏi mở** with a named owner and a date each, then **Lịch sử phiên bản**
— a row per change saying what changed, not "updated" (C-2).

## Step 9 — Write and update traceability

Write both files. Update the manifest: `design.function_list`, `design.srs`,
the `USn` ids allocated, and `design.permissions_matrix` if one was written.

Next: `/ui-spec <slug>` and `/test-strategy <slug>`, which can run in
parallel.

## Anti-patterns to refuse

- Proceeding without C1.
- A requirement bundling three checks into one sentence — split it, each gets
  an id and a test.
- "The system should handle errors gracefully."
- Renumbering `USn` ids after anything references them.
- Listing only the happy-path state.
- A non-functional requirement without a number.
- Specifying implementation. The SRS says what must be true, not which class
  does it.
- Renumbering `FR-###` to tidy a category. The next free number is always
  cheaper than a broken reference.
- Skipping the entity register or the integration table because the feature
  "does not really have data" — if that is true, both say so explicitly
  (`Không có`), which is a statement a reviewer can check (C-4).
- Leaving the trace in the version-history prose because the reference
  document does. That section is for people; the trace table is for the
  checks.

# SRS template — Software Requirements Specification

`schema: vnd.ai-sdlc.srs/v2`

The C2 artefact stage D builds from, and the one QA writes test cases against
before code exists. Every acceptance criterion in the PRD is detailed here
into requirements that are individually testable.

**The shape of this template is Stockbook's.** Two real, shipped SRSs were
read — `SRS: Stockbook` (SN) and `SRS Omnichannel Phase 1` (MID). Per the
precedence rule in `docs/ai-sdlc/document-conventions.md` (C-0), where the two
do the same thing differently, **Stockbook's form is the house form**:

| Conflict | Stockbook (house form) | Omnichannel | This template |
|---|---|---|---|
| Section skeleton | numbered `1.`–`9.`, version history last | `PHẦN 1 / 3 / 4 / 5` | **Stockbook's 1–9**, additions appended before version history |
| Requirement ids | `FR-###`, flat across the whole document | `FR-<AREA>-NNN` | **`FR-###`** |
| Requirement body | prose block: User Story + Acceptance Criteria | `B1/B2/B3` steps + tables | **Stockbook's block** |
| Acceptance criteria | Given/When/Then as prose — *"Cho …, khi …, thì …"* | table | **Stockbook's prose form** |
| NFR layout | five named subsections, third column = business goal | one table grouped by `Nhóm` | **Stockbook's five subsections** |
| Glossary | dedicated section | inline in §1.3 | **dedicated section** |

Three sections here exist in the Omnichannel SRS and **not** in Stockbook's.
They are additions, not conflicts (C-0), and each is labelled with where it
came from so the team can judge it rather than inherit it:

- **§9 Luồng nghiệp vụ** (mermaid) — Stockbook's SRS has no diagrams at all.
- **§10 Ma trận phân quyền** — Stockbook describes auth narratively inside two
  FRs; required here only when more than one role exists.
- **§11 Truy vết** — the one addition that is **not optional**. Stockbook's
  trace lives in a prose changelog, which no check can read; the framework's
  spine (`BR-001 → F-012 → AC-034 → US1-02 → code → test → MR`) needs a table.

**`USn` ids travel** — `US1-02` is story 2 of epic 1, and that id reaches
Figma frame names, task filenames and test names. Renaming one later breaks
four references silently (C-3).

---

```markdown
# SRS — <initiative>

**Phiên bản**: v1.0 | **Trạng thái**: Bản nháp | Đang review | Đã duyệt
**Owner**: <Architect / BA, by name> | **Ngày**: <YYYY-MM-DD>
**Nguồn**: BRD <link> · PRD <link> · C1 SA View <link>

## 1. Mục đích & Tầm nhìn

### Hệ thống này làm gì

<One paragraph. A reader who stops here knows what the thing is.>

### Mục tiêu kinh doanh

| # | Mục tiêu | Chỉ số thành công |
|---|---|---|

### Vấn đề được giải quyết

<The problem, from the PRD. Cited, not re-argued.>

## 2. Phạm vi

### Trong phạm vi

The `#` column carries the feature category id, reused verbatim as the §4
headings.

| # | Khả năng | Mô tả |
|---|---|---|
| C001 | | |

### Ngoài phạm vi

| Khả năng | Lý do |
|---|---|

### Giả định & Ràng buộc

| Loại | Tuyên bố |
|---|---|
| Giả định | <and what would invalidate it> |
| Ràng buộc | <technical, regulatory, contractual> |
| Phụ thuộc | <the named system or team, and what we need from it> |

## 3. Vai trò người dùng & Mục tiêu

Every role the system will have, including administrative and operational
roles. A role that reaches this table for the first time — rather than
arriving from the PRD — is a PRD defect; report it back.

| Vai trò | Mô tả | Mục tiêu chính | Phạm vi dữ liệu |
|---|---|---|---|

## 4. Yêu cầu chức năng

**Định dạng**: `FR-###` — flat across the whole document, not per category.
Numbering is **not** contiguous within a category: a new requirement takes the
next free number regardless of where it sits. Withdrawn requirements keep
their number (C-3).

### C001 - <tên nhóm>

#### FR-001: <tên yêu cầu>

- **User Story**: Là <persona>, tôi muốn <capability>, để <outcome>.
- **Nguồn**: F-003 · AC-007, AC-008 · BR-001 · US1-01
- **Acceptance Criteria**:
  - Cho <điều kiện>, khi <hành động>, thì <kết quả quan sát được>.
  - Cho …, khi …, thì ….
- **Trạng thái màn hình**: <every state — loading · empty · error *per
  failure mode* · success · offline · permission-denied · first-run ·
  overflow. C3 draws one frame per state; a state missing here is a frame
  nobody designs and a branch nobody codes.>
- **Quy tắc áp dụng**: <the `BR/DR/SR/IR` ids this honours, and how>
- **Ngoài phạm vi của yêu cầu này**: <the adjacent thing a reader assumes>

Where a requirement changed after sign-off, annotate at the heading itself —
`#### FR-022: <tên> *(v1.1.16 — bỏ giới hạn 30 phút)*` — so the diff is
visible where the requirement is read, not only in §12.

## 5. Yêu cầu phi chức năng

Five named groups. Every row carries a number and the business goal it
serves; a threshold with no number is an aspiration (C-9).

### Hiệu suất

| ID | Yêu cầu | Ngưỡng | Đo tại | Mục tiêu kinh doanh |
|---|---|---|---|---|
| NFR-001 | | <e.g. <200ms p95> | <measurement point> | |

### Bảo mật

| ID | Yêu cầu | Ngưỡng | Đo tại | Mục tiêu kinh doanh |
|---|---|---|---|---|

### Khả năng mở rộng

| ID | Yêu cầu | Ngưỡng | Đo tại | Mục tiêu kinh doanh |
|---|---|---|---|---|

### Khả dụng

| ID | Yêu cầu | Ngưỡng | Đo tại | Mục tiêu kinh doanh |
|---|---|---|---|---|

### Tuân thủ

| ID | Yêu cầu | Ngưỡng | Đo tại | Mục tiêu kinh doanh |
|---|---|---|---|---|

## 6. Danh mục thực thể

Doubles as the data-governance register.

| Thực thể | Mô tả | PII | Lưu trữ | Ước tính khối lượng (N1) | Tăng trưởng |
|---|---|---|---|---|---|

### Ghi chú lưu trữ

<Retention decisions and their reason. Where a figure is an estimate, mark it
`[ước tính]` inline (C-5).>

## 7. Điểm tích hợp

| Hệ thống | Hướng | Mục đích | Trao đổi dữ liệu | Đội sở hữu |
|---|---|---|---|---|

## 8. Bảng thuật ngữ

| Thuật ngữ | Định nghĩa |
|---|---|

## 9. Luồng nghiệp vụ

*(Bổ sung — nguồn: SRS Omnichannel. Stockbook's SRS carries no diagrams.)*

Mermaid, inline (C-8). At minimum the end-to-end happy path, plus a state
machine for any entity with more than two states.

```mermaid
stateDiagram-v2
  [*] --> new
```

## 10. Ma trận phân quyền

*(Bổ sung — nguồn: SRS Omnichannel. Required only when §3 lists more than one
role. Stockbook describes auth narratively inside its FRs.)*

Deny-by-default; the matrix is the whole authority.

| # | Chức năng | <ROLE A> | <ROLE B> | Phạm vi | FR |
|---|---|---|---|---|---|
| P01 | | ✅ | ❌ | OWN / TEAM / UNIT / ALL | FR-001 |

Scope definitions stated as the predicate they compile to —
`OWN` = `assignee_id = user_id`, `UNIT` = `unit_id = token.unit_id`.

## 11. Truy vết

*(Bổ sung — nguồn: SRS Omnichannel. **Not optional**: the framework's trace
spine cannot be read out of a prose changelog.)*

| Mục SRS | PRD (F / AC) | Quy tắc BRD | Frame Figma | Test case |
|---|---|---|---|---|
| FR-001 | F-003 / AC-007 | BR-001 | US1-01 Portfolio / default | TC-014 |

## 12. Câu hỏi mở

| ID | Câu hỏi | Người phụ trách | Cần trước | Chặn việc gì |
|---|---|---|---|---|
| Q-001 | | <a person> | <date> | |

## 13. Lịch sử phiên bản

| Phiên bản | Ngày | Thay đổi | Tác giả |
|---|---|---|---|
```

---

## DoD — all nine must hold

1. **Every requirement is individually testable** — each AC reads
   *"Cho …, khi …, thì …"* and a QA can write a case from it without asking a
   question.
2. **Every SRS item traces up to the PRD** in §11, with no blank cells.
3. **Every requirement lists all of its states**, not only the happy path.
4. **Every NFR carries a number, a measurement point and the business goal it
   serves.** No number, no requirement.
5. **`FR-###` ids are flat and permanent** — next free number regardless of
   category, withdrawn ids keep their number, none reused.
6. **`USn` ids are assigned and stable.**
7. **A permissions matrix exists** wherever §3 lists more than one role.
8. **Every entity states PII and retention** — both, every row. That pair is
   the first thing a compliance review asks for.
9. **Every integration point names the system and its owning team** — "the
   identity service" fails, "iVND identity service, owned by <team>" passes.

## The reviewer pass

Dispatch a fresh agent before G4 and require all four:

1. **Untestable AC** — which criterion cannot be turned into a test case?
2. **Missing state** — which requirement handles success and one error, and
   nothing else?
3. **Orphan** — which requirement traces to nothing in the PRD?
4. **Aspirational NFR** — which threshold has no number, or no measurement
   point to read it at?

## Anti-patterns

- A requirement bundling three checks into one sentence. Split it; each gets
  its own id and its own test.
- "Hệ thống phải xử lý lỗi một cách hợp lý."
- Renumbering `FR-###` to make a category contiguous. Stockbook's SRS records
  a renumbering event (`FR-030 → FR-031`) precisely because it is expensive;
  the next free number is always cheaper than a tidy sequence.
- Provisional `USn` ids, renumbered later — four downstream references break
  and none of them error.
- Specifying implementation. The SRS says what must be true, not which class
  does it.
- Leaving the trace in §13's prose because that is what the reference document
  does. §11 exists for the checks; §13 exists for people.

# OMVP template — initiative charter

`schema: vnd.ai-sdlc.omvp/v1`

The one-page charter the organisation opens an initiative with: objectives,
timeframe across the four delivery phases, owners, outputs and budget. In the
real boards it is the sibling of the IPAM Way canvas — IPAM Way says *what is
true and who does what*; OMVP says *what we are committing to and by when*.

Generalised from three real OMVP boards (`Hàng hóa nội địa — CA/iCA`,
`Bảo an bưu gửi — VNPost`, `Bảo an bưu gửi — EMS`), including their habit of
issuing **one OMVP per flow** rather than one per initiative — cấp đơn, sửa
đổi bổ sung, tái tục and huỷ đơn each got their own objective, timeframe and
4D output row.

Conventions: `docs/ai-sdlc/document-conventions.md`.

---

```markdown
# OMVP — <initiative>

- **Version**: 1.0   **Status**: Draft | In review | Approved
- **Owner**: <a person>   **Date**: <YYYY-MM-DD>
- **Sources**: IPAM Way <link> · G1 decision <link>

## Flows in this initiative

One block per flow. A flow with no objective of its own is part of another
flow, not a flow.

### Flow 1 — <e.g. Cấp đơn / New issue>

**Objective**: <what this flow achieves, one line>

| Phase | Target date | Entry condition | Owner |
|---|---|---|---|
| Discovery | | | |
| Design | | <e.g. "+2 weeks from PPC available"> | |
| Development | | | |
| Deployment | | | |

Dates are either absolute (`19/9`) or explicitly relative to a named
precondition (`+2 tuần kể từ khi có PPC`). A relative date with no named
precondition is not a date.

**Output (4D)** — what exists at the end of each phase:

| Phase | Output artefact | Where it lives |
|---|---|---|
| Discovery | Discovery Report, IPAM Way canvas | Confluence |
| Design | BRD, PRD, SRS, UI spec, Test strategy | Confluence |
| Development | Code, tests, spec, ADRs | Repo |
| Deployment | Release notes, runbook, monitoring | Repo + Confluence |

**RACI**

| Activity | R | A | C | I |
|---|---|---|---|---|

**IPO**

| Input | Process | Output |
|---|---|---|

**Principles** — the non-negotiables for this flow.

- <e.g. partner system initiates and collects payment; we are the system of record>

### Flow 2 — <e.g. Sửa đổi bổ sung>
...

## Owners

| Role | Name |
|---|---|
| Biz sponsor | |
| Biz owner | |
| Delivery owner | |

**Stakeholders**: <by function — `Không có` where there is none>

## Budget

| Item | Estimate | Confidence | Source |
|---|---|---|---|

<Where budget is not tracked for this initiative, write `Không có — <why>`
rather than leaving the section empty (C-4).>

## Version history

| Version | Date | Change | Author |
|---|---|---|---|
```

---

## DoD — all five must hold

1. **Every flow has its own objective**, stated in one line.
2. **All four phases carry a date** — absolute, or relative to a *named*
   precondition.
3. **Every phase names the artefact it produces**, not just the phase name.
   "Design" is a phase; "PRD + SRS + UI spec, in Confluence" is an output.
4. **RACI has exactly one A per activity.** Two accountable people is none.
5. **Budget states a number or `Không có` with a reason.** An empty budget
   section is the most common way an initiative's cost first becomes visible
   at the point it is already spent.

## Anti-patterns

- One OMVP covering four flows with one shared timeline. The real boards
  split them for a reason: cấp đơn shipped while tái tục was still `Không có`.
- A 4D output column that repeats the phase name.
- Dates with no precondition, on a flow whose precondition is a third party.
  `+1.5 tháng` from nothing is not a commitment.

# BRD template — Business Requirements Document

`schema: vnd.ai-sdlc.brd/v1`

The B1 artefact. Five sections. Its rules constrain every solution that comes
after it, which is why they carry stable IDs and why a contradiction between
two of them is a defect rather than a discussion.

**Rule IDs are the spine of the whole traceability chain**: `BR-001 → F-012 →
AC-034 → US1-02 → code → test → MR`. Everything downstream cites them.

## The four rule families

| Prefix | Family | What belongs here |
|---|---|---|
| `BR-NNN` | Business | Constraints on how the business operates: eligibility, limits, entitlements, lifecycle |
| `DR-NNN` | Data | What must be held, for how long, with what accuracy, who owns the record |
| `SR-NNN` | Security | Authentication, authorisation, confidentiality, auditability, segregation of duties |
| `IR-NNN` | Integration | How this must interact with **named** systems |

IDs are permanent. A withdrawn rule is marked withdrawn with a date and a
reason; it is never deleted and its number is never reused. Downstream
documents cite these numbers, and a recycled ID silently repoints a trace.

```markdown
# BRD — <initiative>

- **Version**: 1.0   **Status**: Draft | In review | Approved
- **Owner**: <PM>   **Architect**: <name>   **Date**: <YYYY-MM-DD>
- **Sources**: Discovery Report <link> · Company Context <link> ·
  Systems & Projects Context <link>

## 1. Business context

<Why this exists, in the business's own terms. Draws on the Discovery Report;
does not re-argue it.>

## 2. Stakeholders

| Stakeholder | Role | What they need from this | Sign-off required? |
|---|---|---|---|

## 3. Success metrics

Linked directly to a company OKR. **Every metric has a number and a date** —
a metric without both cannot be failed, which means it cannot be passed.

| # | Metric | Baseline today | Target | By when | Linked OKR |
|---|---|---|---|---|---|

## 4. Business rules

| ID | Rule | Rationale | Source | Status |
|---|---|---|---|---|
| BR-001 | | | Discovery Report §x / stakeholder | Active |
| DR-001 | | | | Active |
| SR-001 | | | | Active |
| IR-001 | <must name the actual system, e.g. "iVND identity service"> | | | Active |

## 5. Constraints and out of scope

- **Constraints**: <regulatory, contractual, technical, temporal>
- **Out of scope**: <what this explicitly does not cover, agreed with C-level>
- **Assumptions**: <stated as assumptions, with what would invalidate each>

## Open questions

| ID | Question | Owner | Needed by |
|---|---|---|---|
| Q-001 | | <a person> | <date> |
```

## DoD — all seven must hold

1. Every business rule has a **unique ID**.
2. **No rule contradicts another rule.** Check pairwise within each family and
   across families — `SR` and `BR` conflicts are the common ones (a security
   rule forbidding what a business rule requires).
3. Integration rules **name a specific system**, never a generic description.
   "Must integrate with the identity system" fails; "Must obtain the verified
   identity from iVND identity service" passes.
4. Every success metric has a **number and a deadline**.
5. **C-level has approved** Business Context and Business Rules.
6. **The Architect has confirmed in writing** — email or comment, not a
   verbal nod — that no technical constraint is missing.
7. **Regulated domain: legal has confirmed** before finalisation.

## The reviewer pass — five angles

Mandatory before G2. Dispatch a fresh reviewer and require all five:

1. **Contradiction** — which two rules cannot both hold?
2. **Silence** — what does this not say that a builder will have to guess?
3. **Assumption as fact** — which statements are asserted with the confidence
   of evidence and have none?
4. **Unfalsifiable metric** — which success metric could never be shown to
   have failed?
5. **Vague integration** — which IR describes a system rather than naming it?

## Anti-patterns

- Deleting a withdrawn rule instead of marking it withdrawn.
- Reusing an ID.
- A success metric like "improve customer satisfaction".
- Recording the Architect's approval as attendance at a meeting. The DoD says
  *in writing*, because a walkthrough where everyone nodded is how a missing
  constraint reaches production.

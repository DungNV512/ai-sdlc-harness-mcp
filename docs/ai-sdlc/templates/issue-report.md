# Issue Report template

`schema: vnd.ai-sdlc.issue-report/v1`

The A0 artefact and the front door of the whole process. Anyone in the
company can file one; the five fields exist so that a raw signal arrives
without a solution already welded onto it.

**Five fields. The solution field is separate and optional.** That separation
is the entire design: a submitter who has a fix in mind can say so without
that fix contaminating the description of the problem, and a triager can read
the problem without reading the proposed answer first.

```markdown
# Issue: <short handle>

**1. What happened**
<What you observed, as you observed it. Behaviour, not diagnosis.>

**2. When and how often**
<Dates or frequency. "Every Monday morning" and "twice since April" lead to
completely different decisions.>

**3. Who it affects**
<Which roles or teams, roughly how many people.>

**4. What it costs**
<Time, money, risk, or an opportunity that was missed. If you do not know,
say so — an unquantified real problem beats an invented number.>

**5. Proposed solution — OPTIONAL**
<Leave blank if you do not have one. Having no solution does not make the
issue less valid, and having one does not make it more likely to be built.>

---
Submitted by: <name>   Date: <YYYY-MM-DD>
```

## The commitment attached to this form

A0 is not just a form, it is a promise. Within **3–5 working days** the
submitter receives exactly one of three answers:

1. **Taken into the discovery cycle** — with a link to the Idea Card.
2. **Deferred** — with a specific reason, not "not now".
3. **Merged into an issue already being tracked** — with a link to it.

Silence is a failure of this stage, not a neutral outcome. The second time a
submitter hears nothing, they stop submitting, and the intake channel becomes
a form nobody fills in — which is exactly how organisations lose the signal
that would have told them what to build.

## DoD

- One submission point, findable without asking anyone where it is.
- The response commitment published next to the form, not buried in a policy.
- A backlog that is maintained continuously, not reviewed when someone
  remembers.
- Every submission has a recorded outcome within 3–5 working days.

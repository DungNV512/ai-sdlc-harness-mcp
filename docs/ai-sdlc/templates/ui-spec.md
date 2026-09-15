# UI Spec & Design Tokens template

`schema: vnd.ai-sdlc.ui-spec/v1`

The C3 artefact accompanying the Figma frames. The frames are the design; this
is the contract that makes them buildable — states, tokens, and the `nodeId`
references tasks will point at.

**C3 cannot start before the SRS is complete.** Mocking a screen whose
business rules are undefined guarantees a redraw, and the redraw always costs
more than the wait.

```markdown
# UI Spec — <initiative>

- **Designer**: <name>   **Date**: <YYYY-MM-DD>   **Version**: 1.0
- **Figma file**: <name> — key `<published key>`
- **Sources**: PRD (personas, journeys) <link> · SRS <link>

## Figma file key

**Key**: `<the published key>`

> A key of the form `unsaved-*` fails this DoD. When a file key changes,
> every `mcp_ref` pointing into it dies at once — no warning, no error, just
> tasks referencing frames that are not there. This repo has been bitten:
> 61 task files still carry a stale `unsaved-*` key beside the real URL.

## Frames

Named after the user story they serve, so a task can cite them.

| Frame name | nodeId | Story | State |
|---|---|---|---|
| US1-01 Portfolio / default | `859:33602` | US1-01 | success |
| US1-01 Portfolio / empty | | US1-01 | empty |

## State matrix

Every screen, every state. A blank cell is an unanswered question, not an
omission.

| Screen | loading | empty | partial | error | offline | denied | first-run | overflow |
|---|---|---|---|---|---|---|---|---|
| Portfolio | ✓ | ✓ | ✓ | per failure mode | ✓ | n/a — reason | ✓ | ✓ |

<Errors get a row per failure mode where recovery differs. One generic
"something went wrong" standing in for four distinct failures is four
missing designs.>

## Interaction spec

For each interactive element: trigger, feedback, result, and what happens
when it fails. Include timing where it matters, and what the user can do
while waiting.

## Design tokens

Exported, not described. Colour, type, spacing, radius, elevation, motion.

| Token | Value | Used for |
|---|---|---|

<Handoff is tokens, never pixels measured from a screenshot. A measured
value is a copy that drifts.>

## Accessibility — WCAG 2.1 AA

| Check | Status | Evidence |
|---|---|---|
| Contrast ≥ 4.5:1 body, 3:1 large | | <computed on real token values> |
| Touch targets ≥ 44pt | | |
| Focus order logical | | |
| Every control labelled | | |
| Legible at 200% text scaling | | |

## Representative-user feedback

- **Round**: <date>   **With**: <who — actual representative users, not the team>
- **Changed as a result**: <what. "No changes" after a real round is a
  finding worth recording; "no round held" fails the DoD.>
```

## DoD

- **≥ 1 round of feedback from representative users.**
- **WCAG 2.1 AA** verified on real token values, not estimated.
- **Figma is the source of truth** (ADR-0010).
- **Every frame has a stable `nodeId`** and a published file key.
- Every state in the SRS has a frame or a recorded reason it does not.

# Function List template

`schema: vnd.ai-sdlc.function-list/v1`

The C2 index. One row per function the system must perform, each traced up to
the PRD and down to the SRS. It is the document scope is agreed against, which
is why the DoD requires PM and C-level consensus on it rather than on prose.

```markdown
# Function List — <initiative>

- **Author**: <Architect / BA>   **Date**: <YYYY-MM-DD>   **Version**: 1.0
- **Sources**: BRD <link> · PRD <link> · Package Design <link> ·
  Integration Design <link>

| Function | Description | Traces to | User stories | Priority | SRS ref |
|---|---|---|---|---|---|
| FN-001 | <what the system does, one line> | F-003 / AC-007 | US1-01, US1-02 | Must | SRS §2.1 |

## Coverage check

| PRD feature | Functions covering it |
|---|---|
| F-001 | FN-001, FN-004 |
| F-002 | **none — gap** |

<A feature with no function is a hole in the design. A function with no
feature is scope that entered at stage C, which is later and more expensive
than scope entering at B.>

## Out of scope at function level

<Functions considered and excluded, with reasons, agreed by PM and C-level.>
```

## DoD

- Scope agreed by PM **and** C-level.
- Every function traces up to a PRD `F-NNN` or `AC-NNN`.
- Every PRD Must-have feature is covered by at least one function.
- Every function points at the SRS section that specifies it.

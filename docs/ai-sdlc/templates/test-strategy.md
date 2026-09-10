# Test Strategy template

`schema: vnd.ai-sdlc.test-strategy/v1`

The C4 artefact, owned by FS 22 Quality Engineering. It fixes the coverage
thresholds as numbers and commits the team to shift-left: **QA writes test
cases as soon as the SRS exists, not after code appears.**

That ordering is the whole point. Test cases written from the SRS find
requirement defects while they are cheap; test cases written from code can
only confirm that the code does what it does.

```markdown
# Test Strategy — <initiative>

- **QE owner**: <name>   **Date**: <YYYY-MM-DD>   **Version**: 1.0
- **Sources**: PRD <link> · SRS <link>

## Test pyramid

| Level | What it covers | Who writes it | When | Runs where |
|---|---|---|---|---|
| Unit | | | | |
| Integration / widget | | | | |
| Visual / golden | | | | |
| End-to-end | | | | |

<State the intended shape and the reasoning. A pyramid with a heavy top is a
choice with consequences — slow feedback, flaky signal — and if that is the
right trade here, say why.>

## Coverage thresholds — as numbers

| Scope | Threshold | Enforced by |
|---|---|---|
| Overall | <n>% | <hook / CI job> |
| Domain layer | <n>% | <hook / CI job> |

> **Set these per project.** The 80% overall / 90% domain figures used in
> Stockbook came from Stockbook, and it is not established that they are an
> organisational standard. Inheriting them without deciding is how a number
> nobody chose ends up blocking a merge nobody can justify.

Name the enforcement mechanism. A threshold no job checks is a preference.

## Coverage of acceptance criteria

**Every AC in the PRD has at least one sketched test case before C4 is done.**

| AC | Test case | Level | Sketched | Automated |
|---|---|---|---|---|
| AC-001 | | unit | yes | not yet |
| AC-002 | **none — gap** | | | |

<Sketched, not written: enough to show the AC is testable and how. A gap in
this table at C4 usually means the AC is not actually testable, which is a
B2 defect found cheaply.>

## Test data

- **Fixtures**: <where they live, who owns them>
- **Sensitive data**: <never real customer data; how it is synthesised>
- **Environments**: <what exists, what each is for>

## What we are not testing, and why

<Explicit. An untested area everyone knows about is a risk; one nobody has
named is a surprise.>

## Entry and exit criteria

- **Entry**: <when testing can start for a slice>
- **Exit**: <when it is done — thresholds met, no open critical defects,
  golden diffs reviewed>
```

## DoD

- **Coverage thresholds fixed as numbers**, with the enforcing mechanism named.
- **Every PRD acceptance criterion has at least one sketched test case.**
- The pyramid shape is stated and justified.
- Untested areas named explicitly.

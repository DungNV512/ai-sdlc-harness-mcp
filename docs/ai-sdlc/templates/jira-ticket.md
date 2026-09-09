# Jira ticket template

`schema: vnd.ai-sdlc.jira-ticket/v1`

The ticket is the artefact that opens a phase, the PR is the artefact that
closes it, and `Refs:` is the thread between them. A ticket written after
the fact, purely to satisfy the gate, still has to answer these questions --
otherwise the next person inherits a link with nothing behind it.

Commands (`/skill-submit`, `/pr`) fill this shape automatically. Use this
file when creating a ticket by hand, or when checking one during review.

## Summary (the Jira `summary` field)

```
[<repo-or-component>] <what will be true when this is done>
```

Written as an outcome, not a task list. `[ai-sdlc-harness-mcp] Teams
notifications for the three agreed events` beats `Do Teams integration`.
Keep the bracketed prefix: a Jira project shared with other teams (CMS is)
becomes unnavigable without it.

## Description

### Link out first

```
GitHub PR: <url, or "not opened yet">
Repo: <owner/repo>
Branch: <head> -> <base>
```

If the PR does not exist yet, say so rather than leaving the line off. Fill
it in when it does — a ticket whose PR link is stale is a dead end, and this
has already happened once in this project (a ticket pointed at PR #6 while
the PR was actually #7).

### Why

The problem or the request, in the reporter's own terms. If this ticket came
from a real symptom someone reported, quote the symptom before interpreting
it.

### What

The change, concretely enough that someone can tell whether it happened.
For a plugin change, name the plugin and the version transition.

### Verified / Not verified

Same rule as the PR: evidence with the command that produced it, and an
explicit list of what could **not** be checked and why. Do not let the
ticket claim more than the PR does — they are read by different people, and
the ticket usually outlives the PR.

### Root cause (bug tickets only)

For a `Bug`, state the mechanism, not the symptom. "Version bump resolved to
a zero net diff because both PRs branched from the same base" is a root
cause; "skill did not appear" is a symptom.

## Fields

| Field | Rule |
|---|---|
| Issue type | `Task` for new work, `Bug` for something that behaved wrongly in a way a user noticed |
| Project | The project agreed for this repo. Do not invent a project key — ask |
| Assignee | The person accountable, not the person who typed it |

## Anti-patterns

- A ticket created only to unblock a gate, with a body that says nothing a
  reader could act on.
- Claiming verification the PR does not claim.
- A PR link that was correct when written and never corrected afterwards.
- Guessing a project key.

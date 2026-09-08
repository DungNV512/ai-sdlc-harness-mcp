---
description: Fold human reviewer feedback from an MR back into project memory. Closes the feedback loop so the same correction isn't needed twice.
argument-hint: <MR-url-or-number>
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# /learn-from-review $ARGUMENTS

Reviews from an MR (the human merge gate, phase 12) are the most
valuable signal in the loop — they catch what every automated phase
missed. This command harvests that signal and writes it into
`docs/memory/review-feedback.md` so future sub-agent runs avoid the
same correction.
## Pre-flight

1. Resolve `$ARGUMENTS` to an MR identifier. Accepted:
   - Full URL: `https://gitlab-new.vndirect.com.vn/<group>/<repo>/-/merge_requests/123`.
   - Short: `!123` or `123` (uses the current repo's `origin`).
2. Verify `glab` is on PATH and authenticated:
   ```bash
   glab auth status --hostname gitlab-new.vndirect.com.vn
   ```

## Phase 1 — fetch

```bash
mr_json="$(glab mr view "$mr_id" --output json)"
```

Capture (via `jq` on `$mr_json`):
- Title.
- URL (`.web_url`).
- Top-line review comments (`.notes[] | select(.type == null)`) —
  non-empty only.
- Per-line review threads (via `glab api projects/:id/merge_requests/$mr_id/discussions`).
  Collapse each note to `(file:line) — body`.
- General MR comments (`.notes[] | select(.system == false)`) —
  follow-up nits.

## Phase 2 — classify

For each comment, classify into one of:

- **Pattern** — a repeated correction that should change a skill, an
  agent, or a slash command. (Example: "this is the third MR where
  `BlocSelector` was missed — add a sentinel to the review checklist.")
- **One-off** — a feature-specific note that doesn't generalize.
  Skip.
- **Policy** — touches CLAUDE.md, an ADR, or coding-standards.
  Flag and surface to the user; do not auto-edit those.

Run the classification in-thread (Sonnet is fine here — light task).

## Phase 3 — write

Append a section to `docs/memory/review-feedback.md`. Schema:

```markdown
## MR !<id> — <title>  (<date>)

- **Source**: <URL>
- **Reviewer**: <handle>

### Patterns learned

- (file:line) — quote of comment.
  - **Action**: which skill / agent / command should be updated.
  - **Status**: open | applied (link to follow-up MR).

### Policy items surfaced (NOT auto-applied)

- ...
```

Newest entry at the **top** of the file. Older entries are archived
by year once the file exceeds 2,000 lines.

## Phase 4 — surface

Print a short summary in chat:

```
Learned from MR !<id>:
  Patterns:        <n>
  Policy items:    <n> (review needed)
  One-offs:        <n> (skipped)

Suggested follow-ups:
  - update .claude/skills/bloc-pattern/SKILL.md  (sentinel for BlocSelector)
  - update .claude/agents/flutter-engineer.md   (escalate Result mapping rule)
```

The user decides whether to land the follow-ups now (`/scaffold-feature`
on the relevant skill) or queue them.

## Refuse if

- `gh` is not authenticated.
- The MR has zero reviews. Print a hint to pick an MR that actually
  got reviewed.
- The user did not consent (`/learn-from-review` writes to
  `docs/memory/` which is committed). Ask before the first write.

## See also

- `.claude/commands/update-memory.md` — the more general memory editor.
- `.claude/commands/pr.md` — the producer of MRs we then learn from.

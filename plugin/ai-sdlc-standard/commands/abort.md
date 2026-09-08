---
description: Abort an in-flight /ship-feature run cleanly. Stashes unstaged work, saves the branch tip as a headref, detaches HEAD at the last-green commit, deletes the feature branch, archives the spec folder.
argument-hint: <feature-slug> [--keep-branch] [--keep-spec]
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# /abort $ARGUMENTS

Recovery command for a `/ship-feature` run that broke mid-phase.
Designed to leave the working tree in a clean, resumable state
**without losing the spec artefacts** (plan, spec, ADR) — only the
half-written code is rolled back

## Pre-flight

1. Resolve `<feature-slug>` from `$ARGUMENTS`. Required.
2. Confirm we are inside a git repo:
   ```bash
   git rev-parse --is-inside-work-tree >/dev/null
   ```
3. Identify the feature branch (`feat/<slug>` per coding-standards
   §11). If the current `HEAD` is not on that branch, abort the
   command with a clear error — don't blow away the user's actual
   work.

## Phase 1 — snapshot

Capture state so the user can recover if `/abort` itself was a
mistake:

```bash
ts=$(date +%Y%m%dT%H%M%S)
mkdir -p .claude/.aborts
git stash push -u -m "abort-snapshot-${slug}-${ts}" || true
git rev-parse HEAD > ".claude/.aborts/${slug}-${ts}.headref"
git diff --stat HEAD~1..HEAD > ".claude/.aborts/${slug}-${ts}.diffstat" || true
```

Print the stash entry name + the headref filename to chat so the user
sees the recovery handles.

## Phase 2 — resolve recovery point (no history destruction yet)

Resolve the "last green commit" — the most recent ancestor common
with the trunk `dev` (or `main` if the repo hasn't adopted a `dev`
trunk):

```bash
green=$(git merge-base HEAD origin/dev 2>/dev/null || git merge-base HEAD origin/main)
```

Report to the user:
> About to abandon branch `feat/<slug>` (dropping <N> commits since
> `<green>`). Stash + headref saved under `.claude/.aborts/`.
> Proceed? [y/N]

Wait for `y`. **Do NOT run `git reset --hard`** — the deny list
blocks it, and there's no need to rewind the branch's history
when we're about to delete the branch entirely (Phase 3). If the
user answered `n`, exit cleanly and print how to inspect the state.

## Phase 3 — branch cleanup (deletes the branch, not history)

Unless `--keep-branch`:

```bash
# Detach from the branch so we can delete it. `git switch --detach`
# is the modern, non-destructive equivalent of `git checkout --detach`
# and is not on the deny list. Falls back to `checkout --detach` if
# the git version predates `switch` (pre-2.23).
git switch --detach "$green" 2>/dev/null \
  || git checkout --detach "$green"
git branch -D "feat/$slug"
```

If `--keep-branch` is set, skip the deletion; the branch stays on
disk pointing at its current tip, and the stash + headref are still
recoverable.

Print a one-liner showing how to restore the branch from the stash
if needed:
```
git checkout -b feat/<slug> <headref>
git stash pop <stash-name>
```

Never run `git push --force` (deny-listed in `.claude/settings.json`).

## Phase 4 — spec archival

Unless `--keep-spec`:

```bash
mv "docs/specs/$slug" ".claude/.aborts/${slug}-${ts}-spec"
```

The plan / spec / ADR text survives — only the code is gone.

## Phase 5 — TaskList cleanup

Mark any in-flight tasks for this slug as `deleted` or `completed`,
whichever matches reality. Do not silently drop them; the burndown
log matters.

## Phase 6 — summary

Emit a short report:

```
Aborted feat/<slug>.

Recovery handles:
  stash:    abort-snapshot-<slug>-<ts>
  headref:  .claude/.aborts/<slug>-<ts>.headref
  spec:     .claude/.aborts/<slug>-<ts>-spec/

To resume:
  git checkout -b feat/<slug> $(cat .claude/.aborts/<slug>-<ts>.headref)
  git stash pop <stash-name>
  mv .claude/.aborts/<slug>-<ts>-spec docs/specs/<slug>
```

## Refuse if

- The current branch does not match `feat/<slug>`.
- There are uncommitted changes outside the feature scope (anything
  touching `.claude/`, `docs/architecture/`, `pubspec.yaml`,
  `modules/*/pubspec.yaml`).
- The user has not confirmed the branch abandonment.
- HEAD is on `main` or `dev` — refuse, this command deletes a
  feature branch and must never be run against trunk.

## See also

- `.claude/commands/ship-feature.md` — what this command rolls back.
- `coding-standards.md §11` — branch-naming convention.

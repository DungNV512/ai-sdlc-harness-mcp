---
description: Open a GitLab MR with the template fully filled. Follows the git-flow skill; commit and MR-body hygiene both enforced.
argument-hint: <feature-slug> [<base-branch>]
allowed-tools: Bash, Read, Edit
---

# /pr $ARGUMENTS

Phase 12. Pre-conditions: all earlier phases green.

## Platform

Stockbook is hosted on **GitLab** (`gitlab-new.vndirect.com.vn`), not
GitHub. Use `glab`, not `gh`. If `glab` is not on PATH, install with
`brew install glab` and authenticate with `glab auth login --hostname
gitlab-new.vndirect.com.vn`. This command **does not fall back to
`gh`** — `gh` will silently target the wrong host.

## Steps

1. Read `.claude/skills/git-flow/SKILL.md` (commit + MR hygiene).
2. Verify clean state:
   - `git status -s` empty or only committed changes,
   - branch matches `feat|fix|chore|docs|refactor/<slug>`,
   - `flutter analyze` green, `/test` summary `PASS`.
3. Rebase onto the integration branch: `git fetch origin && git rebase origin/dev`.
   Resolve conflicts locally; do **not** merge trunk into the branch.
4. Push the branch:
   - First push: `git push -u origin <branch>`.
   - Re-push after rebase / amend: `git push --force-with-lease
     origin <branch>`. Never plain `--force`.
5. Read `docs/specs/<slug>/traceability.yaml` and include its links in the
   MR body. Open the GitLab MR via `glab mr create` against `$2` (default
   `dev`):
   ```bash
   glab mr create \
     --source-branch "$(git branch --show-current)" \
      --target-branch "${2:-dev}" \
     --title "<commit subject — must match squash-merge form>" \
     --draft \
     --squash-before-merge \
     --remove-source-branch \
     --description-file docs/specs/<slug>/mr-body.md
   ```
6. Apply prompt **P9** to draft the MR body. Fill every section:
   - **Summary** — one paragraph, why this change.
   - **Screenshots / recording** — mandatory for any UI change (per
     DoD).
   - **Test plan** — checklist mapping to phase-exit items from
     `docs/ai-sdlc/phases.md`.
   - **Risk & rollback** — what breaks if this is wrong; how to
     revert.
    - **Linked ticket / manifest / sources / tasks / spec / ADR** — `Refs:
      STOCK-<id>`, manifest path, source/task paths, spec path, ADR filename.
   - **Localised strings list** (`/i18n` output).
   - **Security note** — or "N/A — no auth/network/storage touched".
7. Request review from the `reviewer` agent role and at least one
   human owner (`glab mr note` or the GitLab UI). Claude is never
   the sole approver.
8. Stop. **Do not** merge — human gate only.

## Anti-patterns to refuse

- Falling back to `gh` because `glab` isn't installed — install it,
  don't wrong-target the platform.
- Merging your own MR (Phase 13 is human).
- `git push --force` (denied by settings.json).
- Landing an MR with red pipeline or unresolved review threads.
- Copy-pasting the whole MR description into the commit body — the
  MR body is the artefact, the commit is the record.

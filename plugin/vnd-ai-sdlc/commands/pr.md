---
description: Open a pull/merge request against the project's configured VCS host, with the template fully filled.
argument-hint: <feature-slug> [<base-branch>]
allowed-tools: Bash, Read, Edit
---

# /pr $ARGUMENTS

Phase 12. Pre-conditions: all earlier phases green.

## Platform

Reads `.claude/settings.json`'s `vcs` field (`"github"` or `"gitlab"`) to
decide which MCP tool to call. If `vcs` is unset, ASK the user once which
host this project uses, and offer to write the setting so future runs
don't ask again.

- `vcs: github` — calls the `create_github_pull_request` MCP tool
  (`ai-sdlc-harness-mcp`'s GitHub tools, live since Phase 3).
- `vcs: gitlab` — calls a `create_gitlab_merge_request` MCP tool. **This
  tool does not exist yet** (GitLab support in `ai-sdlc-harness-mcp` is
  deferred — see that repo's top-level README roadmap). If your project
  is GitLab-hosted, install an overlay plugin that ships its own `/pr`
  override with the existing `glab`-CLI-based flow (Stockbook's overlay
  does exactly this) rather than relying on this Standard command until
  the GitLab MCP tool lands.

## Steps

1. Read `.claude/settings.json`'s `vcs` field (see above). Stop and ask if
   unset and no overlay override is installed.
2. If an overlay plugin defines its own `.claude/commands/pr.md`, that
   file takes precedence over this one (Claude Code resolves commands by
   the last-installed plugin that defines the same name) — this Standard
   version is the fallback for a project with no VCS-specific overlay.
3. Verify clean state:
   - `git status -s` empty or only committed changes,
   - branch matches `feat|fix|chore|docs|refactor/<slug>`,
   - the project's lint/test commands are green (see `/lint`, `/review`,
     `/security-review` for what those resolve to on this project).
4. Rebase onto the integration branch: `git fetch origin && git rebase
   origin/<base-branch, default "main">`. Resolve conflicts locally; do
   **not** merge trunk into the branch.
5. Push the branch:
   - First push: `git push -u origin <branch>`.
   - Re-push after rebase/amend: `git push --force-with-lease origin
     <branch>`. Never plain `--force`.
6. Read `docs/specs/<slug>/traceability.yaml` and include its links in the
   PR/MR body. Call the matching MCP tool (owner/repo resolved from the
   git remote):
   - GitHub: `create_github_pull_request` with `title`, `head` (current
     branch), `base` (`$2`, default `main`), `body` (the filled template
     from step 7), `draft: true`.
   - GitLab: `create_gitlab_merge_request` — not yet available, see above.
7. Fill the PR/MR body template. Every section:
   - **Summary** — one paragraph, why this change.
   - **Screenshots / recording** — mandatory for any UI change (per DoD).
   - **Test plan** — checklist mapping to phase-exit items from
     `docs/ai-sdlc/phases.md` (or the project's equivalent).
   - **Risk & rollback** — what breaks if this is wrong; how to revert.
   - **Linked ticket / manifest / sources / tasks / spec / ADR** — ticket
     ref, manifest path, source/task paths, spec path, ADR filename.
   - **Security note** — or "N/A — no auth/network/storage touched".
8. Request review from the `reviewer` agent role and at least one human
   owner. Claude is never the sole approver.
9. Stop. **Do not** merge — human gate only.

## Anti-patterns to refuse

- Calling the wrong platform's tool because `vcs` is misconfigured —
  verify it, don't assume.
- Merging your own PR/MR (the human-gate phase is human).
- `git push --force` (should be denied by `settings.json`).
- Landing a PR/MR with a red pipeline or unresolved review threads.
- Copy-pasting the whole PR/MR description into the commit body — the
  PR/MR body is the artefact, the commit is the record.

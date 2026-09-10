---
description: Open a pull/merge request against the project's configured VCS host, with the template fully filled.
argument-hint: <feature-slug> [<base-branch>]
allowed-tools: Bash, Read, Edit
---

# /pr $ARGUMENTS

Phase 12. Pre-conditions: all earlier phases green.

## Platform

Reads the `vcs` field (`github` or `gitlab`) from
`docs/ai-sdlc/project.yml`, written by `/harness-init`. If that file is
missing, stop and tell the user to run `/harness-init` first rather than
guessing the host. If the file exists but `vcs` is unset, ASK once and offer
to write it, so future runs don't ask again.

- `vcs: github` — calls the `create_github_pull_request` MCP tool.
  Needs `GITHUB_TOKEN`.
- `vcs: gitlab` — calls the `create_gitlab_merge_request` MCP tool. Needs
  `GITLAB_TOKEN`, and `GITLAB_API_URL` set to `https://<host>/api/v4` for a
  self-hosted instance (it defaults to gitlab.com).

Both hosts are supported by the same command; the differences are handled
inside the tools rather than by branching in this command, with three
exceptions worth knowing because they change what you pass:

| | GitHub | GitLab |
|---|---|---|
| Repo identity | `owner` + `repo` | `project`: numeric id **or** `group/subgroup/project` |
| Branch fields | `head` / `base` | `sourceBranch` / `targetBranch` |
| Draft | `draft: true` | `draft: true` — the tool prefixes the title with `Draft: `, since GitLab has no draft flag |
| Reviewers | usernames | usernames, resolved to numeric ids by the tool; an unknown username fails loudly |

A GitLab-hosted project that prefers the `glab` CLI can still install an
overlay shipping its own `/pr` (Stockbook's does), but that is now a
preference rather than a necessity.

## Steps

1. Read `vcs` from `docs/ai-sdlc/project.yml` (see above). Stop and ask if
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
   PR/MR body — `sources`, `artefacts.spec`, any `adrs`, and the
   `discovery`/`gates` block when the work came through Stage A. Then call
   the matching MCP tool, resolving the repo identity from the git remote:
   - GitHub: `create_github_pull_request` with `title`, `head` (current
     branch), `base` (`$2`, default `main`), `body` (the filled template
     from step 7), `draft: true`.
   - GitLab: `create_gitlab_merge_request` with `title`, `sourceBranch`
     (current branch), `targetBranch` (`$2`, default `main`), `description`
     (the same filled template), `draft: true`.

   After it is created, write the returned URL back into
   `artefacts.pr` in `traceability.yaml`, replacing the `PENDING` value. The
   manifest is the thing later phases read; a PR that exists but is not
   recorded there is invisible to them.
7. Fill the PR/MR body using the **standard artefact template**
   (`vnd.ai-sdlc.pull-request/v1`). This is the same shape `/skill-submit`
   produces -- one repo must not have two PR contracts. If the repo has
   `docs/ai-sdlc/templates/pull-request.md`, read it for the per-field rules;
   the shape itself is fixed:

   ```
   Refs: <TICKET-KEY>          # or `PENDING — <reason>`, never omitted

   ## Summary                  # one paragraph: why, not what files moved
   ## What changed             # plugin changes state `<plugin> old -> new`
   ## Verified                 # command + what it returned, not "tests pass"
   ## Not verified             # REQUIRED; "Nothing — ..." if truly nothing
   ## Risk and rollback
   ## Screenshots / recording  # or "N/A — no UI change"
   ## Security note            # or "N/A — no auth/network/storage touched"
   ## Links                    # manifest / spec / ADR / sources / tasks
   ```

   Two rules that are not negotiable:
   - **Never delete a section.** Fill it with `N/A — <reason>`. A missing
     section is indistinguishable from a forgotten one.
   - **`## Not verified` is the point of the template.** A check that did
     not run is reported as "did not run", never as passed and never as
     failed on its merits.
8. Request review from the `reviewer` agent role and at least one human
   owner. Claude is never the sole approver.
9. Stop. **Do not** merge — human gate only.

## Anti-patterns to refuse

- Calling the wrong platform's tool because `vcs` is misconfigured —
  verify it, don't assume.
- Merging your own PR/MR (the human-gate phase is human).
- `git push --force` (should be denied by the project's permission settings).
- Landing a PR/MR with a red pipeline or unresolved review threads.
- Deleting a template section instead of writing `N/A — <reason>`.
- Leaving `## Not verified` empty because everything "seemed fine".
- Copy-pasting the whole PR/MR description into the commit body — the
  PR/MR body is the artefact, the commit is the record.

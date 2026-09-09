---
description: Validate a new/changed skill, bump the plugin version, push the branch, then open a linked Jira ticket and GitHub PR for approval. Step 2 of the skill lifecycle.
argument-hint: <skill-name>
allowed-tools: Read, Glob, Grep, Edit, Bash
---

# /skill-submit $ARGUMENTS

Step 2 of 4. Turns a written skill into a reviewable submission. Never
merges anything -- approval is a human gate (`/skill-approve`).

Resolve the repo checkout exactly as `/skill-new` does (`$AI_SDLC_HARNESS_REPO`,
else cwd, else stop and ask).

## Pre-flight

1. Locate `plugin/<target>/skills/<skill-name>/SKILL.md`. Refuse if missing.
2. Check the frontmatter is real, not the scaffold:
   - `name:` present and identical to the directory name.
   - `description:` present, one sentence, and **not** still starting with
     `<` or containing `TODO`. Refuse a placeholder description -- it is the
     single most common reason a merged skill never fires for anyone.
   - The body has at least one concrete step, not just headings.
3. Confirm the branch is `skill/<skill-name>` and not `main`.
4. Run the real validator over the plugin and refuse on any error:
   ```bash
   claude plugin validate plugin/<target>
   ```

## Bump the version -- this is not optional

Edit `plugin/<target>/.claude-plugin/plugin.json` and bump `version` by one
patch (e.g. `0.1.0` -> `0.1.1`).

This step exists because of a tested failure, not a style preference:
`claude plugin update` compares version strings, so if the version does not
change it reports *"already at the latest version"* and **silently syncs
nothing** -- the merged skill reaches no one, while `claude plugin details`
still shows it (that command reads the marketplace source, not the installed
copy) which makes it look like it shipped. A skill submitted without a
version bump is a skill nobody will ever get.

If `mcp-server/src/**` changed in the same branch, also re-run
`npm --prefix mcp-server run bundle` and stage the regenerated
`plugin/vnd-ai-sdlc/mcp-server/index.mjs` -- the plugin ships that bundle,
so an un-rebuilt bundle means the fix is in git but not in anyone's session.

## Push and open the two links

5. Commit (`Add <skill-name> skill` or `Update <skill-name> skill`) and
   `git push -u origin skill/<skill-name>`.
6. Create the Jira ticket with the `create_jira_issue` MCP tool:
   - Project key: `$AI_SDLC_SKILL_JIRA_PROJECT` if set; otherwise **ask** --
     do not invent a project key.
   - Issue type `Task`, summary `AI-SDLC skill: <skill-name>`.
   - Description: what the skill does, which plugin it targets and why, and
     what the author verified.
7. Create the PR with the `create_github_pull_request` MCP tool
   (`owner: DungNV512`, `repo: ai-sdlc-harness-mcp`, `head: skill/<skill-name>`,
   `base: main`, `draft: false`). The PR body must contain:
   - `Refs: <JIRA-KEY>`
   - which plugin it lands in and the one-line reason
   - the old -> new version of that plugin
   - what the author actually ran (validator output, any manual try-out)
8. Link back: `update_jira_issue` to put the PR URL on the ticket, so the
   ticket is not a dead end for whoever picks up approval.
9. Request review with the `request_github_pr_reviewers` MCP tool:
   `reviewers: [$AI_SDLC_SKILL_REVIEWER]`, defaulting to `DungNV512` (this
   repo's maintainer) when the variable is unset. GitHub returns 422 if the
   named reviewer is the PR's own author -- when that happens, say the
   reviewer was **not** assigned and name who has to be asked instead. Never
   report an assignment that GitHub refused.
10. Notify Teams with the `send_teams_message` MCP tool, but only if
    `TEAMS_WEBHOOK_URL` is set -- when it is not, skip silently, this is an
    optional channel and its absence must never fail a submission:
    - `severity: "warning"` (something is waiting on a human)
    - `title: "Skill awaiting approval: <skill-name>"`
    - `facts`: plugin + old->new version, Jira key, reviewer, author
    - `actions`: "Open PR" and "Open Jira" (omit the Jira button when the
      ref is still `JIRA-PENDING` -- a button to a ticket that does not
      exist is worse than no button)
    Report the notification as sent only if the tool returned ok. If it
    threw, say the PR is open but Teams was not notified, and why.
11. Print the Jira key, the PR URL, and the exact `/skill-approve <pr-number>`
    command for the reviewer.

## If Jira is unreachable

The Atlassian host is behind an org egress allowlist that currently blocks
it from some environments. If `create_jira_issue` fails on a network/403
error rather than a payload error: **say so plainly, do not silently skip
the ticket.** Push the branch and open the PR anyway, put
`Refs: JIRA-PENDING` in the body, and tell the user which ticket still has
to be created by hand and pasted into the PR before approval. A PR that
quietly lost its compliance link is worse than a PR that says it is missing.

## Anti-patterns to refuse

- Bumping `main`'s version or pushing straight to `main`.
- Merging your own PR -- the human gate is the point.
- Submitting with a placeholder description or an empty body.
- Skipping the version bump "because it is a small change".
- Reporting success when the Jira link or the bundle rebuild did not happen.
- Claiming a reviewer was assigned or Teams was notified when the call failed.
- Treating a missing `TEAMS_WEBHOOK_URL` as an error: notification is optional,
  the PR and the ticket are not.

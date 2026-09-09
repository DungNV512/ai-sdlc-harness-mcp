---
description: Announce a merged pull/merge request to Teams. Run it after a human merges - the harness never merges, so nothing else knows the merge happened.
---

# /notify-merge

Post a "merged" Adaptive Card to Teams for a PR that a human has just
merged.

## Why this is a separate command, not automatic

The harness never merges its own work -- Phase 8 is a human gate, and
`/skill-approve` deliberately stops short of merging. So no command in this
plugin is running at the moment a merge actually happens. There is also no
webhook receiver in this architecture: the MCP server is a request/response
tool surface, not a long-running listener that GitHub can call back.

That leaves exactly one honest option: the person who merged (or Claude,
when asked to merge on their behalf) runs this afterwards. Anything else
would mean inventing a merge event the harness never observed.

## Usage

`/notify-merge <pr-number>` -- or `/notify-merge <pr-url>`.

## Steps

1. **Refuse early if there is nothing to send to.** If `TEAMS_WEBHOOK_URL`
   is unset, stop and say so. Unlike `/skill-submit`, where notification is
   an optional extra on top of real work, notifying *is* this command's
   entire job -- running it with nowhere to post is a no-op worth naming.

2. **Resolve the repo.** Read `vcs` from `docs/ai-sdlc/project.yml`. If the
   file is missing, stop and tell the user to run `/harness-init` first. If
   `vcs` is `gitlab`, stop and say the GitLab tools are not built yet
   (`create_gitlab_merge_request` and friends are still deferred) -- do not
   fake it with a GitHub call against a GitLab repo.

3. **Verify the merge actually happened.** Do not trust the argument. Read
   the PR (`gh api repos/{owner}/{repo}/pulls/{n}`, or the equivalent) and
   check `merged == true`. If it is still open, stop and say so: a "merged"
   card for an open PR is exactly the kind of false signal that makes a
   notification channel worthless.

4. **Send the card** with `send_teams_message`:
   - `severity: "success"`
   - `title: "Merged: <pr title>"`
   - `facts`: PR number, base branch, who merged, merged-at, and the Jira
     key parsed from the PR body's `Refs:` line when one is present
   - `actions`: "Open PR", plus "Open Jira" when a real key was found
     (never for `JIRA-PENDING`)

5. **If the plugin version changed in that PR**, add one line to the card
   telling consumers to run `/skill-sync` -- otherwise the merge reaches
   nobody's session and the notification is only half the news.

## Anti-patterns to refuse

- Sending a "merged" card for a PR that is not merged.
- Merging the PR yourself as part of this command. This announces a merge;
  it does not perform one.
- Guessing the Jira key when the PR body has no `Refs:` line.
- Reporting the card as sent when `send_teams_message` threw.

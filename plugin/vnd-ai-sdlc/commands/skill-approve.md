---
description: Maintainer-side review of a submitted skill PR - runs the quality and mechanics checklist, verifies the version bump, then hands the merge decision to a human. Step 3 of the skill lifecycle.
argument-hint: <pr-number>
allowed-tools: Read, Glob, Grep, Bash
---

# /skill-approve $ARGUMENTS

Step 3 of 4, run by a maintainer. This command **reviews and reports; it
does not merge.** That is deliberate on two levels: the harness's standing
rule is that Claude is never the sole approver, and this project's GitHub
MCP tools are a read+create surface with no merge/close tool by design. The
merge button stays with a person.

## Fetch

Read the PR (`gh pr view <pr-number> --json ...`, or the GitHub UI) and the
diff. Refuse to review a PR that touches anything outside
`plugin/*/skills/**`, `plugin/*/.claude-plugin/plugin.json`, and (when the
server changed) `plugin/vnd-ai-sdlc/mcp-server/index.mjs` -- a skill
submission that also edits agents, hooks, or the MCP server source is a
different review and should be split.

## Mechanics checklist -- any NO blocks the merge

- [ ] `plugin/<target>/.claude-plugin/plugin.json` `version` is bumped
      relative to `main`. **This is the one that silently breaks
      distribution**: without it `claude plugin update` reports "already at
      the latest version" and syncs nothing, so the merged skill reaches
      nobody. Verified by testing, not assumed.
- [ ] `claude plugin validate plugin/<target>` passes with no errors.
- [ ] Directory name, frontmatter `name:`, and the PR title agree.
- [ ] The skill name does not already exist in the *other* plugin (a
      duplicate name across the two plugins means whichever installed last
      silently wins).
- [ ] If `mcp-server/src/**` changed, `plugin/vnd-ai-sdlc/mcp-server/index.mjs`
      was regenerated in the same PR (`npm --prefix mcp-server run bundle`).
- [ ] `Refs: <JIRA-KEY>` is present and resolves to a real ticket -- not
      `JIRA-PENDING`. If it is still pending, say so and hold.

## Content checklist -- the quality bar

- [ ] **`description:` earns its keep.** One sentence, says what it does AND
      when to reach for it, in words a user would actually type. This string
      is the entire matching surface; a vague one means the skill never
      fires and the work was wasted.
- [ ] **Right plugin.** Standard (`vnd-ai-sdlc`) only if it would work
      unchanged on a project with a different language, framework and git
      host. Anything naming Flutter/Dart/BLoC, mobile release tooling, or
      GitLab belongs in `vnd-ai-sdlc-stockbook`.
- [ ] **Concrete steps**, not a restatement of the description. A reader
      should be able to follow it without already knowing the answer.
- [ ] **No secrets, tokens, internal URLs, or personal data** in the skill
      body or its templates.
- [ ] **No duplication** of an existing skill's job; if it overlaps, say
      which one and whether this should extend that instead.
- [ ] Always-on cost is sane -- check `claude plugin details <plugin>@ai-sdlc-harness-mcp`
      and flag it if this one skill adds a disproportionate share, since
      every skill's frontmatter is loaded into every session.

## Report, then hand off

Produce a table of every checklist item with PASS / FAIL / N-A and the
evidence for each FAIL (file:line). Then one of:

- **Blocking findings** -- list them, post them as PR review comments, and
  transition the Jira ticket back to the author (`get_jira_transitions` then
  `transition_jira_issue`). Do not merge.
- **Clean** -- state that explicitly and print the exact hand-off:

  ```
  Ready to merge: PR #<n> — <plugin> <old-version> -> <new-version>
  A human merges on GitHub (this command will not).
  After merge, tell the team to run /skill-sync.
  ```

  Then transition the Jira ticket to its review/done state.

## Anti-patterns to refuse

- Merging, closing, or force-pushing anything.
- Passing a PR whose version was not bumped, however small the change.
- Approving your own submission without a second person, when the team has
  more than one maintainer.
- Rewriting the author's skill inside the review instead of asking for the
  change -- review comments, not silent edits.

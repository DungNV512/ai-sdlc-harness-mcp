---
description: Pull newly approved skills, commands and agents into this machine's installed VND plugins, and verify what landed. Step 4 of the skill lifecycle - run this after someone announces a merge.
argument-hint: (no args)
allowed-tools: Bash, Read
---

# /skill-sync

Step 4 of 4, run by everyone using the plugins. A merge on GitHub does not
reach anyone's machine on its own -- installed plugins are cached copies,
refreshed only when asked.

## Steps

1. Refresh the marketplace's view of what versions exist:
   ```bash
   claude plugin marketplace update ai-sdlc-harness-mcp
   ```
2. Update whichever plugins are installed (run both if both are):
   ```bash
   claude plugin update vnd-ai-sdlc@ai-sdlc-harness-mcp
   claude plugin update vnd-ai-sdlc-stockbook@ai-sdlc-harness-mcp
   ```
   Pass `--scope project` if the plugin was installed at project scope --
   `claude plugin list` shows the scope, and an update at the wrong scope
   fails with *"not installed at scope user"* rather than doing anything.
3. Read the output carefully and report which of these actually happened:
   - `updated from <old> to <new>` -- the real success case.
   - `already at the latest version` -- **nothing was synced.** Either you
     already have it, or whoever merged forgot the version bump. If a
     teammate just announced a skill and you see this, say so: the fix is a
     follow-up version bump on `main`, not a retry on your side.
4. Confirm what landed:
   ```bash
   claude plugin details vnd-ai-sdlc@ai-sdlc-harness-mcp
   ```
   and check the expected skill name appears in the inventory.
5. Tell the user plainly: **the running session does not pick this up --
   restart Claude Code.** The CLI says "Restart to apply changes" for a
   reason; skills, commands, agents and MCP servers are all resolved at
   session start.

## If the MCP tools are missing after a sync

The `ai-sdlc-harness` MCP server ships inside the `vnd-ai-sdlc` plugin as a
self-contained bundle, so it needs no separate clone or `npm install`. If
its tools are absent after a restart, check in this order:

1. **Are you in an interactive session?** The plugin-bundled MCP server does
   not activate under `claude -p` (headless) -- a tested, still-open
   limitation. For a headless script, pass the server explicitly with
   `--mcp-config` instead.
2. **Credentials.** The tools load but fail at call time without
   `ATLASSIAN_EMAIL`, `ATLASSIAN_API_TOKEN`, `CONFLUENCE_SITE`, `JIRA_SITE`
   and `GITHUB_TOKEN` in your environment. See `mcp-server/README.md`.
3. **A stale dev override.** If `AI_SDLC_HARNESS_MCP_SERVER_DIR` is set in
   your shell, the launcher prefers that checkout; if it is not built, the
   launcher prints a warning to that effect and falls back to the bundle.
   Unset it if you did not mean to be developing the server.

## Anti-patterns to refuse

- Reporting "synced" when the output said "already at the latest version".
- Editing files under `~/.claude/plugins/cache/**` to force a change in --
  that is an install artifact, overwritten on the next update, and invisible
  to everyone else.

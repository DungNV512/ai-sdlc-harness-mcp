# ai-sdlc-harness-mcp

Integration + distribution layer for an AI-assisted SDLC harness built
around the Stockbook app project.

This repo is planned to hold two halves:

- **[`mcp-server/`](./mcp-server)** — an MCP (Model Context Protocol)
  server exposing Confluence, Jira, GitHub, a Claude Code trigger tool, and
  (planned) GitLab and Microsoft Teams tools. Usable from any MCP client
  (Claude Code, Claude Desktop, Cowork, or any other MCP-speaking agent),
  not just from inside one repo.
- **[`plugin/`](./plugin)** — an installable Claude Code plugin
  marketplace packaging the AI-SDLC harness itself (agents, commands,
  skills, hooks) that already runs in the `stockbookapp` repo, split into
  a framework-agnostic **[`ai-sdlc-standard`](./plugin/ai-sdlc-standard)**
  layer and a **[`ai-sdlc-stockbook-overlay`](./plugin/ai-sdlc-stockbook-overlay)**.
  Its `.mcp.json` wires in `mcp-server` automatically, so installing the
  plugin is enough to get the whole AI-SDLC (rules, skills, commands,
  sub-agents, and the MCP tools) working in a fresh repo. See
  `plugin/README.md` for install steps and known limitations (not yet
  live-installed in a real Claude Code session).

## Status

| Phase | What | Status |
|---|---|---|
| 1 | Jira MCP tools (12) | ✅ done |
| 1 | Confluence: `create_confluence_page` | ✅ done |
| 3 | GitHub tools (3, read+create surface, live-tested) | ✅ done |
| 5 | Claude Code trigger tool (`run_claude_code_command`) | ✅ done — verified against a mock CLI, not a real install |
| 6 | Plugin extraction (`plugin/`, marketplace.json, Standard/Overlay split) | ✅ done — not yet live-installed in a real Claude Code session (see `plugin/README.md`) |
| 2 | Confluence full parity (update/get/search/list spaces) | planned |
| 3 | GitLab tools | deferred — same egress block as Confluence/Jira makes them unverifiable right now; blocks Standard's genericized `/pr` for `vcs: gitlab` |
| 4 | Microsoft Teams (`send_teams_message` via Incoming Webhook) | planned — blocked on a webhook URL |

See `mcp-server/README.md` for the tool reference and setup instructions.

## Why this exists

The Confluence `create_confluence_page` tool was built first, specifically
because Atlassian's own hosted Rovo MCP server's `createConfluencePage`
route returns a persistent 404 (see `mcp-server/README.md` for the full
diagnosis). Jira, GitLab, GitHub and Teams tools extend the same server
into a general integration layer for the harness, and the planned `plugin/`
half makes the whole harness — not just the integrations — installable in
one step in any frontend repo.

## License

MIT

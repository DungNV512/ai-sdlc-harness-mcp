# ai-sdlc-harness-mcp

Integration + distribution layer for an AI-assisted SDLC harness built
around the Stockbook app project.

This repo is planned to hold two halves:

- **[`mcp-server/`](./mcp-server)** — an MCP (Model Context Protocol)
  server exposing Confluence, Jira, GitHub, and (planned) GitLab,
  Microsoft Teams, and Claude Code trigger tools. Usable from any MCP
  client (Claude Code, Claude Desktop, Cowork, or any other MCP-speaking
  agent), not just from inside one repo.
- **`plugin/`** *(not yet built)* — an installable Claude Code plugin
  marketplace packaging the AI-SDLC harness itself (agents, commands,
  skills, hooks) that already runs in the `stockbookapp` repo, split into
  a framework-agnostic **Standard** layer and a **Stockbook project
  overlay**. Once built, its `.mcp.json` will wire in `mcp-server`
  automatically, so installing the plugin is enough to get the whole
  AI-SDLC (rules, skills, commands, sub-agents, and the MCP tools)
  working in a fresh repo.

## Status

| Phase | What | Status |
|---|---|---|
| 1 | Jira MCP tools (12) | ✅ done |
| 1 | Confluence: `create_confluence_page` | ✅ done |
| 3 | GitHub tools (3, read+create surface, live-tested) | ✅ done |
| 2 | Confluence full parity (update/get/search/list spaces) | planned |
| 3 | GitLab tools | deferred — same egress block as Confluence/Jira makes them unverifiable right now |
| 4 | Microsoft Teams (`send_teams_message` via Incoming Webhook) | planned — blocked on a webhook URL |
| 5 | Claude Code trigger tool | next |
| 6 | Plugin extraction (`plugin/`, marketplace.json, Standard/Overlay split) | planned |

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

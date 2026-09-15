# ai-sdlc-harness-mcp

Integration + distribution layer for an AI-assisted SDLC harness built
around the Stockbook app project.

This repo is planned to hold two halves:

- **[`mcp-server/`](./mcp-server)** — an MCP (Model Context Protocol)
  server exposing Confluence, Jira, GitHub, GitLab, Microsoft Teams and a
  Claude Code trigger tool — 28 tools. Usable from any MCP client
  (Claude Code, Claude Desktop, Cowork, or any other MCP-speaking agent),
  not just from inside one repo.
- **[`plugin/`](./plugin)** — an installable Claude Code plugin
  marketplace packaging the AI-SDLC harness itself (agents, commands,
  skills, hooks) that already runs in the `stockbookapp` repo, split into
  a framework-agnostic **[`vnd-ai-sdlc`](./plugin/vnd-ai-sdlc)**
  layer and a **[`vnd-ai-sdlc-stockbook`](./plugin/vnd-ai-sdlc-stockbook)**.
  `vnd-ai-sdlc` ships the MCP server inside itself as a self-contained
  bundle, so installing the plugin — no clone, no `npm install`, no build —
  is enough to get the whole AI-SDLC (rules, skills, commands, sub-agents,
  and the MCP tools) working in a fresh repo; only credentials come from
  your environment. It also carries a governed **skill lifecycle**
  (`/skill-new` → `/skill-submit` → `/skill-approve` → `/skill-sync`) so a
  skill one person writes reaches everyone else through Jira + PR review.
  Real-installed and verified with a live Claude Code CLI — see
  `plugin/README.md` for install steps, the bugs that real install caught,
  and the known limitations it surfaced.

## Status

| Phase | What | Status |
|---|---|---|
| 1 | Jira MCP tools (12) | ✅ done |
| 1 | Confluence: `create_confluence_page` | ✅ done |
| 3 | GitHub tools (3, read+create surface, live-tested) | ✅ done |
| 5 | Claude Code trigger tool (`run_claude_code_command`) | ✅ done — verified against a mock CLI, not a real install |
| 6 | Plugin extraction (`plugin/`, marketplace.json, Standard/overlay split) | ✅ done — real-installed + verified with a live Claude Code CLI (see `plugin/README.md`) |
| 7 | Self-contained plugin: MCP server bundled inside `vnd-ai-sdlc` + dev-override launcher | ✅ done |
| 7 | Skill lifecycle commands (`/skill-new`, `/skill-submit`, `/skill-approve`, `/skill-sync`) with Jira + PR approval gate | ✅ done |
| 4 | Microsoft Teams (`send_teams_message` via a Workflows webhook) | ✅ built — **not live-tested**: the org egress allowlist blocks `powerplatform.com`, so the POST must be verified from a machine that can reach Microsoft |
| 2 | Confluence full parity (`get`/`update`/`search`/`list_spaces`) | ✅ built — **not live-tested**: `ipas-tech.atlassian.net` is egress-blocked. Logic covered by unit tests |
| 3 | GitLab tools (5, read+create surface) | ✅ built — **not live-tested**: both `gitlab.com` and `gitlab-new.vndirect.com.vn` are egress-blocked. Logic covered by unit tests |
| A | Stage A discovery (A0–A4) + G1 feasibility gate, with `/idea-card`, `/problem-canvas`, `/discovery-report`, `/gate` | ✅ built — A3 (market/feasibility scan) has a contract but no command yet |
| — | `traceability.yaml` schema (`vnd.ai-sdlc.traceability/v2`) + generation in `/plan-feature` | ✅ done |

### What "built but not live-tested" means here

Three integrations are complete, build clean, and pass unit and stdio
JSON-RPC tests, but have never made a real call — every one of their hosts
(`gitlab.com`, `gitlab-new.vndirect.com.vn`, `ipas-tech.atlassian.net`,
`powerplatform.com`) is refused by this environment's egress allowlist,
which permits `github.com`. That is why GitHub is the one platform with a
genuine end-to-end verification behind it.

So the request/response shapes are exercised against stubs, not against the
real APIs. The places where those APIs differ in ways a naive port gets
wrong — GitLab addressing projects by URL-encoded path, having no draft flag,
replacing rather than appending reviewer lists, taking numeric user ids
instead of usernames; Confluence requiring version *current + 1* on every
update — are handled explicitly and covered by
`mcp-server/unit-test.mjs`. What is *not* covered is whether the endpoints
behave as documented. Run `npm test` in `mcp-server/`, then make one real
call per platform from a machine with network access before trusting them.

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

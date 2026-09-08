# ai-sdlc-harness-mcp

The MCP (Model Context Protocol) server half of the `ai-sdlc-harness-mcp`
repo — the integration layer for an AI-assisted SDLC harness built around
the Stockbook app project. `../plugin/` (added in a later phase) holds the
installable Claude Code plugin (agents/commands/skills) that consumes these
tools; this package is usable on its own from any MCP client (Claude Code,
Claude Desktop, Cowork, or any other MCP-speaking agent).

13 tools today: 1 Confluence, 12 Jira. More platforms (GitLab, GitHub,
Microsoft Teams, a Claude Code trigger tool) are planned in later phases —
see the repo's top-level README for the roadmap.

## Why this exists

While integrating Claude with our Atlassian Cloud site, the hosted **Rovo
MCP** server's `createConfluencePage` tool returned a persistent `404` on
every attempt, across:

- both a space key and a resolved numeric `spaceId`
- `parentId` present and absent
- `status: current` and `status: draft`
- multiple different spaces
- two independently (re-)connected Rovo MCP instances

Meanwhile every **read** operation on the same authenticated Rovo session
succeeded (`getConfluenceSpaces`, `getConfluencePage`,
`searchConfluenceUsingCql`, etc.), and the OAuth session carried the
`write:page:confluence` scope. To rule out a permissions problem, we
manually created a page through the real Confluence web UI with the same
account — it worked immediately. That isolates the failure to the hosted
`createConfluencePage` route itself, not to credentials or scopes.

The Confluence and Jira tools both talk to the Atlassian Cloud REST API
directly over HTTPS Basic auth (account email + API token) — the same way
Atlassian's own documented API examples do, and the same way the
`stockbookapp` repo's own `bin/*.sh` scripts already do (each Jira tool
here is a 1:1 port of one of those scripts — see `src/jira.ts`'s doc
comments for the exact mapping, endpoint, and payload shape it mirrors).
Porting them into MCP tools, rather than only keeping them as shell
scripts, makes them usable from any MCP client, not just from inside that
one repo via Claude Code's Bash tool.

**Deliberately not included**: a `delete_jira_issue` tool.
`stockbookapp/.claude/settings.json` carries a standing deny-rule ("Org
policy forbids deleting Jira issues") and the repo has no such script by
design — this server respects that policy instead of treating "full
parity with the existing scripts" as license to exceed it.

## Setup

```bash
npm install
npm run build
```

Copy `.env.example` to `.env` and fill in:

```
ATLASSIAN_EMAIL=you@example.com
ATLASSIAN_API_TOKEN=...   # https://id.atlassian.com/manage-profile/security/api-tokens
CONFLUENCE_SITE=https://your-site.atlassian.net
JIRA_SITE=https://your-site.atlassian.net
```

Confluence and Jira share one Atlassian identity, so `ATLASSIAN_EMAIL` /
`ATLASSIAN_API_TOKEN` cover both tool groups. `CONFLUENCE_SITE` and
`JIRA_SITE` are usually the same host.

## Running as an MCP server

Point an MCP client (e.g. Claude Code's `mcp` config) at:

```json
{
  "mcpServers": {
    "ai-sdlc-harness": {
      "command": "node",
      "args": ["/absolute/path/to/ai-sdlc-harness-mcp/mcp-server/dist/index.js"],
      "env": {
        "ATLASSIAN_EMAIL": "you@example.com",
        "ATLASSIAN_API_TOKEN": "...",
        "CONFLUENCE_SITE": "https://your-site.atlassian.net",
        "JIRA_SITE": "https://your-site.atlassian.net"
      }
    }
  }
}
```

## Tools

### Confluence

| Tool | Notes |
|---|---|
| `create_confluence_page` | `spaceId` (numeric or key), `title`, `bodyHtml` (storage format, not Markdown), `parentId?`, `status?` (`current`/`draft`) |

`bodyHtml` must be [Confluence storage format](https://confluence.atlassian.com/doc/confluence-storage-format-790796544.html)
— plain HTML-like tags (`<p>`, `<h2>`, `<ul>`, `<strong>`, ...), the same
format the REST API itself expects. It does not understand the visual
editor's proprietary macros beyond what you supply verbatim.

### Jira

All 12 tools below take Jira Cloud REST API v3 (or Agile API v1.0) field
names directly — see each function's doc comment in `src/jira.ts` for the
exact request shape.

| Tool | Mirrors |
|---|---|
| `create_jira_issue` | `bin/create-jira-issue.sh` |
| `update_jira_issue` | `bin/update-jira-issue.sh` (passthrough — you supply the full edit-issue payload) |
| `get_jira_issue` | `bin/fetch-jira-issue.sh` |
| `search_jira_issues` | `bin/search-jira-issues.sh` (JQL) |
| `add_jira_comment` | `bin/add-jira-comment.sh` |
| `update_jira_comment` | `bin/update-jira-comment.sh` |
| `transition_jira_issue` | `bin/transition-jira-issue.sh` |
| `get_jira_transitions` | `bin/get-jira-transitions.sh` |
| `link_jira_issues` | `bin/link-jira-issues.sh` |
| `list_jira_boards` | `bin/list-jira-boards.sh` |
| `list_jira_sprints` | `bin/list-jira-sprints.sh` |
| `list_jira_issue_types` | `bin/list-jira-issue-types.sh` |

Note: `add_jira_comment` and `update_jira_comment` build ADF (Atlassian
Document Format) differently, matching their respective source scripts
exactly — `add` always produces a single paragraph; `update` splits the
input text on newlines into one ADF paragraph per line (blank lines become
empty paragraphs).

## Known limitation

This server calls the Atlassian Cloud REST API directly over HTTPS, so it
requires outbound network access to your `*.atlassian.net` site. If your
network enforces an egress allowlist that blocks that host (as ours did
during development), every tool here will fail the same way plain `curl`
would — that's an organization network-policy question, not a bug in this
code.

## License

MIT

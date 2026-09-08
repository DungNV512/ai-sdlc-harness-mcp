# ai-sdlc-harness-mcp

A small MCP (Model Context Protocol) server built while wiring an AI-assisted
SDLC harness for a Stockbook app project. It currently ships one tool:
`create_confluence_page`.

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
account -- it worked immediately. That isolates the failure to the hosted
`createConfluencePage` route itself, not to credentials or scopes.

This package is a minimal, working replacement: it talks to the
[Confluence Cloud REST API v2](https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/#api-pages-post)
directly over HTTPS Basic auth (Atlassian account email + API token), the
same way Atlassian's own documented API examples do.

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
```

## Running as an MCP server

Point an MCP client (e.g. Claude Code's `mcp` config) at:

```json
{
  "mcpServers": {
    "ai-sdlc-harness": {
      "command": "node",
      "args": ["/absolute/path/to/ai-sdlc-harness-mcp/dist/index.js"],
      "env": {
        "ATLASSIAN_EMAIL": "you@example.com",
        "ATLASSIAN_API_TOKEN": "...",
        "CONFLUENCE_SITE": "https://your-site.atlassian.net"
      }
    }
  }
}
```

## Tool: `create_confluence_page`

| Field      | Type   | Required | Notes                                                            |
|------------|--------|----------|-------------------------------------------------------------------|
| `spaceId`  | string | yes      | Numeric space ID, or a space key (e.g. `DAS`) — resolved for you   |
| `title`    | string | yes      | Page title                                                        |
| `bodyHtml` | string | yes      | **Confluence storage-format HTML**, not Markdown, not editor paste|
| `parentId` | string | no       | Numeric ID of the parent page                                     |
| `status`   | string | no       | `current` (default, published) or `draft`                         |

`bodyHtml` must be [Confluence storage format](https://confluence.atlassian.com/doc/confluence-storage-format-790796544.html)
(plain HTML-like tags: `<p>`, `<h2>`, `<ul>`, `<strong>`, etc.) — the same
format the REST API itself expects. It is not aware of the visual editor's
proprietary macros beyond what you supply verbatim.

## Known limitation

This server calls the Atlassian Cloud REST API directly over HTTPS, so it
requires outbound network access to your `*.atlassian.net` site. If your
network enforces an egress allowlist that blocks that host (as ours did
during development), this tool will fail the same way plain `curl` would —
that's an organization network-policy question, not a bug in this code.

## License

MIT

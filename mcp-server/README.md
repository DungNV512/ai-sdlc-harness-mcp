# ai-sdlc-harness-mcp

The MCP (Model Context Protocol) server half of the `ai-sdlc-harness-mcp`
repo — the integration layer for an AI-assisted SDLC harness built around
the Stockbook app project. `../plugin/` (added in a later phase) holds the
installable Claude Code plugin (agents/commands/skills) that consumes these
tools; this package is usable on its own from any MCP client (Claude Code,
Claude Desktop, Cowork, or any other MCP-speaking agent).

17 tools today: 1 Confluence, 12 Jira, 3 GitHub, 1 Claude Code trigger.
More platforms (GitLab, Microsoft Teams) are planned in later phases —
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
GITHUB_TOKEN=...          # a PAT with repo scope (fine-grained or classic)
GITHUB_API_URL=https://api.github.com   # optional, override for GitHub Enterprise
```

Confluence and Jira share one Atlassian identity, so `ATLASSIAN_EMAIL` /
`ATLASSIAN_API_TOKEN` cover both tool groups. `CONFLUENCE_SITE` and
`JIRA_SITE` are usually the same host. GitHub uses a separate Bearer-token
PAT (`GITHUB_TOKEN`), not Atlassian's Basic auth.

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

### GitHub

A read+create surface only, deliberately (same "don't exceed what's asked"
discipline as the excluded `delete_jira_issue` tool) — no delete, merge, or
close tools. Uses GitHub's stable REST API v3 (`X-GitHub-Api-Version:
2022-11-28`), Bearer-token PAT auth.

| Tool | Endpoint | Notes |
|---|---|---|
| `create_github_pull_request` | `POST /repos/{owner}/{repo}/pulls` | `title`, `head`, `base`, `body?`, `draft?` |
| `create_github_issue` | `POST /repos/{owner}/{repo}/issues` | `title`, `body?`, `labels?`, `assignees?` |
| `get_github_workflow_run_status` | `GET /repos/{owner}/{repo}/actions/runs/{run_id}` | returns `{status, conclusion, html_url}` |

**Live-tested** (unlike the Confluence/Jira tools, which are blocked by an
egress allowlist — see below): `create_github_issue` was called end-to-end
over real stdio JSON-RPC against the real GitHub API, creating and then
closing [issue #2](https://github.com/DungNV512/ai-sdlc-harness-mcp/issues/2)
on this repo itself. `create_github_pull_request` and
`get_github_workflow_run_status` share the identical HTTP client, auth and
error-handling code path (`request`/`assertOk` in `src/github.ts`) but were
**not individually live-tested** — the repo has no diverging branch to open
a real PR against and no GitHub Actions runs yet to fetch a real status
for. This gap is noted here rather than silently skipped.

### Claude Code trigger

| Tool | Notes |
|---|---|
| `run_claude_code_command` | Spawns a real `claude` CLI process (`claude -p "<prompt>" --output-format json`) against a target repo checkout. `cwd`, `prompt` required. `allowedTools?`, `permissionMode?`, `bare?` (default false), `continueSession?`, `resumeSessionId?`. |

Triggers a headless Claude Code run from outside the editor — e.g. from a
Teams message or a CI job. `--cwd` doesn't exist as a CLI flag; the target
repo is selected by the spawned process's actual working directory, so
this tool sets `cwd` on `child_process.spawn` instead.

**Deliberately does not default to `--bare`.** Bare mode skips discovery
of hooks, skills, custom commands, subagents, plugins, MCP servers, auto
memory, and CLAUDE.md — exactly the AI-SDLC harness machinery this tool
exists to trigger. Defaulting it on would silently run the prompt with
none of that loaded, so it's an opt-in `bare` input instead, off by
default. `permissionMode` / `allowedTools` are exposed as caller-supplied
inputs rather than a hardcoded policy — required in practice for a
non-interactive run to avoid hanging on a permission prompt with nobody to
answer it, and the right policy depends entirely on what the caller trusts
the triggered command to do.

Never throws on a non-zero exit code — the result's
`{exitCode, stdout, stderr}` lets the caller distinguish "Claude Code ran
and reported a failure result" (e.g. exit 1) from "the process itself
never completed" (e.g. a spawn failure because `claude` isn't on PATH,
which *does* throw, since no process ever ran at all).

**Execution environment**: this tool needs a real `claude` CLI on PATH and
a writable checkout at `cwd` — it only makes sense configured on a machine
that has both (e.g. your own Mac with Claude Code installed), never inside
a container with no persistent checkout and no `claude` binary. It doesn't
run inside the container this server was developed in.

**Verification**: this tool could not be live-tested against a real
`claude` CLI — this sandbox has no real install reachable (the
`device_bash` shell's own `claude` binary is a restricted stub: `only
claude -p "<prompt>" is supported in this environment`, not a real
install with real flags). Instead it was verified against a mock `claude`
script substituted onto `PATH` (a shell script that echoes a canned
`--output-format json` response and exits with a controllable code),
proving the spawn/arg-building/parse/error-handling logic itself is
correct, independent of a real Claude Code install being reachable:
confirmed all six inputs (`allowedTools`, `permissionMode`, `bare`,
`continueSession`, `resumeSessionId`, plus the required `cwd`/`prompt`)
map to the correct CLI args; confirmed a non-zero exit code (7) surfaces
in the result rather than throwing; confirmed a missing `claude` binary on
PATH throws a clear "is Claude Code installed?" error instead of hanging
or crashing the server. This gap — no live test against a real `claude`
CLI — is noted here rather than silently skipped.

## Known limitation

This server calls each platform's REST API directly over HTTPS, so it
requires outbound network access to that platform's host
(`*.atlassian.net` for Confluence/Jira, `api.github.com` for GitHub — or
your `GITHUB_API_URL` override). If your network enforces an egress
allowlist that blocks one of those hosts (as ours did for
`*.atlassian.net` during development), every tool that talks to it will
fail the same way plain `curl` would — that's an organization
network-policy question, not a bug in this code.

If you're running this server inside a sandboxed environment that requires
going through an HTTP(S) proxy for all outbound traffic (`HTTPS_PROXY`/
`HTTP_PROXY` set, direct DNS resolution failing) — as opposed to a normal
open network — Node's built-in `fetch()` does **not** honor those proxy
env vars by default. Set `NODE_USE_ENV_PROXY=1` in the server's
environment to make it do so (verified during Phase 3 development: without
it, every GitHub call failed with `EAI_AGAIN`/`fetch failed`; with it, the
live test above succeeded). This is currently marked experimental by
Node/undici but is the documented mechanism as of Node 22.

This server calls the Atlassian Cloud REST API directly over HTTPS, so it
requires outbound network access to your `*.atlassian.net` site. If your
network enforces an egress allowlist that blocks that host (as ours did
during development), every tool here will fail the same way plain `curl`
would — that's an organization network-policy question, not a bug in this
code.

## License

MIT

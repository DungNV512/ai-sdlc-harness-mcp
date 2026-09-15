# ai-sdlc-harness-mcp

Integration + distribution layer for an AI-assisted SDLC harness built
around the Stockbook app project.

This repo holds two halves:

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

## Start here

| You want to | Read |
|---|---|
| **Full system overview** (architecture, agents, commands, plugins) | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| **Look up any command by name** (input/output/owner/next step) | [`docs/ai-sdlc/COMMANDS.md`](./docs/ai-sdlc/COMMANDS.md) |
| Install it and run it on real work | [`plugin/README.md`](./plugin/README.md), then [`docs/ai-sdlc/cookbook.md`](./docs/ai-sdlc/cookbook.md) |
| Understand the SDLC flow (A → B → C → gates → delivery) | [`ARCHITECTURE.md#sdlc-flow-stages-a--b--c--gate--delivery`](./ARCHITECTURE.md#sdlc-flow-stages-a--b--c--gate--delivery) |
| Know which agent does what | [`ARCHITECTURE.md#agents-roster`](./ARCHITECTURE.md#agents-roster) |
| Quick lookup: command by use case | [`docs/ai-sdlc/COMMANDS.md#quick-lookup-by-use-case`](./docs/ai-sdlc/COMMANDS.md#quick-lookup-by-use-case) |
| Know what each phase produces and when it is done | [`stage-a-discovery.md`](./docs/ai-sdlc/stage-a-discovery.md) · [`stage-b-definition.md`](./docs/ai-sdlc/stage-b-definition.md) · [`stage-c-design.md`](./docs/ai-sdlc/stage-c-design.md) |
| Write one of the documents | the matching file in [`docs/ai-sdlc/templates/`](./docs/ai-sdlc/templates), plus [`document-conventions.md`](./docs/ai-sdlc/document-conventions.md) |
| Know the MCP tools and their env vars | [`mcp-server/README.md`](./mcp-server/README.md) |

## The document standard

Every phase output follows one set of conventions (C-0…C-10) in
[`docs/ai-sdlc/document-conventions.md`](./docs/ai-sdlc/document-conventions.md),
derived by reading the organisation's own shipped documents rather than from
first principles — two real SRSs, two Product Listing pages, a PRD, and two
completed IPAM Way boards.

The rule that settles arguments: **where two of those documents do the same
thing differently, the Stockbook project's form wins** (C-0). A silence is
not a conflict — where only one document does something at all, it is an
addition, kept and labelled with its source.

`python3 docs/ai-sdlc/check-conventions.py` enforces the conventions
mechanically and exits non-zero on failure. It is scaffolded into consuming
repos by `/harness-init`, and it exists because this framework insists on
machine-checkable DoDs and, for a while, had none of its own.

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
| A | Stage A discovery A0–A5 + G1, with `/idea-card`, `/problem-canvas`, `/market-scan`, `/discovery-report`, `/ipam-way` | ✅ built — **not yet run on a real feature** |
| B | Stage B definition B0–B2 + G2/G3, with `/context-doc`, `/brd`, `/prd` | ✅ built — **not yet run on a real feature** |
| C | Stage C design C1–C5 + G4, with `/sa-view`, `/srs`, `/ui-spec`, `/test-strategy`, `/security-review` | ✅ built — **not yet run on a real feature** |
| — | Document conventions C-0…C-10 + `check-conventions.py` | ✅ done — the checker passes on this repo |
| — | 23 versioned artefact templates, incl. IPAM Way and OMVP | ✅ done |
| — | `traceability.yaml` schema (`vnd.ai-sdlc.traceability/v3`) + generation in `/plan-feature` | ✅ done |
| — | Publishing artefacts to Confluence automatically | ❌ **not built** — only `/gate` calls `create_confluence_page`. Stage A/B/C artefacts reach the manifest, not the wiki |

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

### What "built but not yet run" means for the upstream stages

Stages A, B and C are complete specifications with working commands, a
template per artefact, and DoDs the commands enforce. What has **not**
happened is a single real feature going A → G4 through them. Until that run
exists, treat the upstream half as a well-specified system that has never met
a deadline, a stakeholder who will not answer, or a document someone refuses
to sign.

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

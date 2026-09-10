# VND AI-SDLC plugin marketplace

Two Claude Code plugins, distributed from this one marketplace:

- **[`vnd-ai-sdlc/`](./vnd-ai-sdlc)** — the framework-agnostic layer, and the
  one most teams install: 3 agents (`architect`, `reviewer`, `security`), 10
  process commands (`abort`, `adr`, `agent-metrics`, `plan-feature`, `pr`,
  `review`, `security-review`, `spec`, `status`, `update-memory`), 4 skill
  lifecycle commands (`skill-new`, `skill-submit`, `skill-approve`,
  `skill-sync` — see below), 1 cross-cutting skill (`threat-modeling`), 3
  hooks, and a **self-contained bundled MCP server** exposing Confluence,
  Jira, GitHub and Claude Code trigger tools.
- **[`vnd-ai-sdlc-stockbook/`](./vnd-ai-sdlc-stockbook)** — the Stockbook
  (Flutter) project overlay: 3 agents (`flutter-engineer`, `qa`, `release`),
  10 commands (`api-from-openapi`, `audit`, `i18n`, `implement`,
  `learn-from-review`, `lint`, `pr` — a GitLab/`glab`-flavored override of
  Standard's generic `/pr` — `scaffold-feature`, `ship-feature`, `test`), 27
  Flutter/mobile/GitLab-specific skills, and 7 Dart-aware hooks. **Requires
  `vnd-ai-sdlc` to also be installed** — it does not duplicate the
  architect/reviewer/security agents or the process commands.

Both are copies of what already runs in the `stockbookapp` repo's own
`.claude/` directory, split on one rule: if a file's content only makes
sense for a Flutter/BLoC/GitLab project it goes in the overlay; if it would
work unchanged anywhere it goes in Standard. Every file's body was read to
decide that — not just its filename or frontmatter (`/implement` and
`/ship-feature` in particular read as generic from their descriptions but
are saturated with Flutter/BLoC specifics inside).

## Install

```
/plugin marketplace add DungNV512/ai-sdlc-harness-mcp
/plugin install vnd-ai-sdlc@ai-sdlc-harness-mcp
# For a Flutter project following Stockbook's conventions:
/plugin install vnd-ai-sdlc-stockbook@ai-sdlc-harness-mcp
```

Then, **once per repo**, bootstrap the harness into it:

```
/harness-init
```

That step is not optional. Installing the plugin gives you the commands; it
does not give the repo the files those commands read. `/harness-init` detects
the project's real toolchain, source roots, VCS host and default branch — by
reading its manifests, never by assuming — and writes
`docs/ai-sdlc/project.yml`, `phases.md`, `integration.md`, `docs/specs/README.md`
and a `CLAUDE.md` section. It shows what it detected and asks before writing,
never overwrites an existing file without `--force`, and records `UNKNOWN`
rather than a guess for anything it could not determine. Without it,
`/plan-feature` stops on the first step — which is exactly what happened the
first time this plugin was pointed at a non-Stockbook repo.

The plugin install itself needs **no clone, no `npm install`, no build
step** — `vnd-ai-sdlc` ships the MCP server as a self-contained bundle
inside the plugin (`vnd-ai-sdlc/mcp-server/index.mjs`, one file, no
`node_modules`), so the tools work as soon as the plugin is installed.

The only thing left is credentials, which live in your environment and never
in this repo. Add to your shell profile:

```bash
export ATLASSIAN_EMAIL=you@example.com
export ATLASSIAN_API_TOKEN=...        # id.atlassian.com/manage-profile/security/api-tokens
export CONFLUENCE_SITE=https://your-site.atlassian.net
export JIRA_SITE=https://your-site.atlassian.net
export GITHUB_TOKEN=...               # PAT with repo scope
```

Then restart Claude Code. See [`../mcp-server/README.md`](../mcp-server/README.md)
for what each variable is for.

### Working on the MCP server itself

If you are changing the server rather than just using it, set
`AI_SDLC_HARNESS_MCP_SERVER_DIR` to a built checkout of `mcp-server/` and the
plugin's launcher will run that instead of the bundle:

```bash
git clone https://github.com/DungNV512/ai-sdlc-harness-mcp.git
cd ai-sdlc-harness-mcp/mcp-server && npm install && npm run build
export AI_SDLC_HARNESS_MCP_SERVER_DIR=$PWD
```

Edit, `npm run build`, restart the session — no re-bundling or reinstalling
needed while iterating. When your change is ready to ship, run
`npm run bundle` from `mcp-server/` to regenerate
`plugin/vnd-ai-sdlc/mcp-server/index.mjs` and commit it in the same PR;
otherwise the fix is in git but not in anyone's session. If the override is
set but not built, the launcher says so on stderr and falls back to the
bundle rather than failing silently.

### How plugin install actually works (learned the hard way)

An earlier version pointed `.mcp.json` at
`${CLAUDE_PLUGIN_ROOT}/../../mcp-server/dist/index.js`, on the theory that
installing a plugin keeps the whole repo checked out as one unit so the
plugin could reach its sibling `mcp-server/` by relative path. **A real
`/plugin install` proved that wrong**: Claude Code copies each plugin into
its own isolated cache directory
(`~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`) with no
`mcp-server/` anywhere nearby, so the path resolved to a file that does not
exist and the server silently never started. Everything a plugin needs at
runtime has to live inside that plugin's own subtree — which is why the
bundle ships where it does.

## The skill lifecycle: create → submit → approve → sync

The point of this marketplace is that a skill one person writes becomes a
skill everyone gets. Four commands in `vnd-ai-sdlc` carry that, and each one
exists to close a specific way the naive version goes wrong:

| Command | Who runs it | What it does |
|---|---|---|
| `/harness-init` | any dev, once per repo | Detects toolchain/layout/VCS and scaffolds the config + phase docs the other commands read. Run before `/plan-feature`. |
| `/skill-new <name>` | author | Picks the right plugin (Standard vs overlay — it asks rather than guesses), checks the name is not already taken in either, cuts a `skill/<name>` branch off `main`, scaffolds `SKILL.md` with real frontmatter. Stops there; you write the content. |
| `/skill-submit <name>` | author | Validates the frontmatter is not still a placeholder, runs `claude plugin validate`, **bumps the plugin version**, pushes the branch, opens a Jira ticket (`create_jira_issue`) and a GitHub PR (`create_github_pull_request`) cross-linked to each other. |
| `/skill-approve <pr>` | maintainer | Runs the mechanics + content checklist (version bumped, validator clean, no name collision, description actually specific, right plugin, no secrets, bundle rebuilt if the server changed), reports PASS/FAIL with evidence, transitions the Jira ticket. **Does not merge** — a human does that. |
| `/skill-sync` | everyone | `marketplace update` + `plugin update`, reads the output honestly (`already at the latest version` means *nothing synced*), verifies the new skill is in the inventory, and reminds you a restart is required. |

Two mechanics in there are not obvious and will silently waste your work:

1. **The version bump in `plugin.json` is mandatory, even for a one-file
   skill.** `claude plugin update` compares version strings; if the version
   did not change it reports *"already at the latest version"* and syncs
   nothing, so a merged skill reaches nobody. Confusingly `claude plugin
   details` *does* show the new skill immediately, because it reads the
   marketplace source rather than the installed copy — so it looks shipped
   when it is not. `/skill-submit` bumps it and `/skill-approve` blocks
   without it, precisely because this is invisible otherwise.
2. **A merge does not reach anyone's machine.** Installed plugins are cached
   copies; each person runs `/skill-sync` and restarts. Announce merges.

Skills are **files**, not something submitted through the MCP server — those
are two unrelated mechanisms. The MCP server (`mcp-server/`) exposes
callable *tools* over JSON-RPC; skills, commands and agents are *files* the
plugin loader discovers by directory convention. There is no API for "adding
a skill"; the path is git, which is what these four commands drive.

To prototype a skill privately first, `claude plugin new <name> --with skills`
scaffolds one under `~/.claude/skills/<name>/`, auto-loaded for you alone on
your own machine. Bring it here via `/skill-new` when it is worth sharing.

## The `/pr` split, as a worked example of the Standard/overlay boundary

`vnd-ai-sdlc/commands/pr.md` is genericized: it reads a `vcs` setting
(`github`/`gitlab`) and calls the matching MCP tool —
`create_github_pull_request` or `create_gitlab_merge_request`. Both now
exist, so Standard's `/pr` covers both hosts.

`vnd-ai-sdlc-stockbook/commands/pr.md` remains a same-named override
carrying the original `glab`-based flow verbatim. That override started as a
necessity and is now a preference: `glab` is live-proven against the real
GitLab instance, whereas `create_gitlab_merge_request` has never made a real
call from this environment (egress-blocked, see the top-level README). Until
someone runs it against `gitlab-new.vndirect.com.vn` and confirms it, the
overlay is the safer path for Stockbook specifically. Claude Code resolves a
command name to the last-installed plugin that defines it, so a Stockbook
machine with both plugins gets the overlay version, while any other project
gets the generic one.

## Known limitations

- **The bundled MCP server does not activate in headless (`claude -p`)
  mode.** Tested at user scope and project scope, with
  `--dangerously-skip-permissions` and with
  `"enableAllProjectMcpServers": true` — none of it helped, while the same
  server passed directly via `--mcp-config` connects and lists all tools.
  It looks like a one-time interactive approval gate headless mode cannot
  satisfy, and it fails closed silently. Works in an interactive session;
  for a headless script, pass `--mcp-config` explicitly.
- **GitLab, Confluence and Teams tools are built but never live-called.**
  Every one of their hosts is refused by the org egress allowlist from the
  environments this was developed in, so they are verified by unit tests
  over a stubbed `fetch` and by schema smoke tests — not against the real
  APIs. `/skill-submit`'s Jira step is exposed to the same block and says so
  out loud rather than skipping the ticket quietly. Make one real call per
  platform from a machine with network access before trusting them.
- **Stage A3 has a contract but no command.** `/idea-card` (A1),
  `/problem-canvas` (A2), `/discovery-report` (A4) and `/gate` (G1) exist;
  the market-scan and feasibility stage is specified in `stage-a-discovery.md` and run
  by hand. `/discovery-report` refuses to invent A3's findings when its
  outputs are missing — it marks those sections `NOT DONE` and says the
  report is incomplete for gate purposes.
- **Framework stages B through O are undefined.** They are named in the
  wider framework but no contract for them has been supplied, and nothing
  here invents one.
- **Standard's `install.sh`/`status.md` self-test step is a no-op** unless an
  overlay providing `.claude/hooks/_self_test.sh` is also installed — guarded
  explicitly rather than left to break.

## Verified by actually installing this, not by reading the schema

Cloned fresh, ran `claude plugin marketplace add`, `claude plugin install`
for both plugins, `claude plugin validate`, and `claude plugin details` —
confirming the real inventory matches the repo: `vnd-ai-sdlc` → 3 agents,
commands + skills, 3 hooks (`PostToolUse`, `Stop`, `SessionStart`), 1 MCP
server; `vnd-ai-sdlc-stockbook` → 3 agents, 27 skills + 10 commands, 2 hooks
(`PreToolUse`, `PostToolUse`), 0 MCP servers (by design — only Standard
wires the server). That real install is what caught the `.mcp.json` path bug
and the version-bump requirement above; the JSON-schema-only pass before it
caught neither.

## License

MIT

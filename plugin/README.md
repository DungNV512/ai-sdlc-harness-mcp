# ai-sdlc-harness-mcp plugin marketplace

Two Claude Code plugins, distributed from this one marketplace:

- **`ai-sdlc-standard/`** — framework-agnostic AI-SDLC harness: 3 agents
  (`architect`, `reviewer`, `security`), 10 process commands (`abort`,
  `adr`, `agent-metrics`, `plan-feature`, `pr`, `review`, `security-review`,
  `spec`, `status`, `update-memory`), 1 cross-cutting skill
  (`threat-modeling`), 3 hooks (`branch-watch.py`, `install.sh`,
  `log-agent-usage.sh`), and a bundled `.mcp.json` that auto-wires in
  [`../mcp-server`](../mcp-server) (Confluence, Jira, GitHub, and a Claude
  Code trigger tool).
- **`ai-sdlc-stockbook-overlay/`** — the Stockbook (Flutter) project
  overlay: 3 agents (`flutter-engineer`, `qa`, `release`), 10 commands
  (`api-from-openapi`, `audit`, `i18n`, `implement`, `learn-from-review`,
  `lint`, `pr` — a GitLab/`glab`-flavored override of Standard's generic
  `/pr` — `scaffold-feature`, `ship-feature`, `test`), 27 Flutter/mobile/
  GitLab-specific skills, and 7 Dart-aware hooks. **Requires
  `ai-sdlc-standard` to also be installed** — it does not duplicate the
  architect/reviewer/security agents or the process commands.

Both plugins are copies of what already runs in the `stockbookapp` repo's
own `.claude/` directory, split along one rule: if a file's content only
makes sense for a Flutter/BLoC/GitLab project, it's in the overlay; if it
would work unchanged for any project, it's in Standard. Every file's
actual body was read to decide this — not just its filename or frontmatter
description (see the commit history and the project plan doc for the
specific corrections that reading turned up, e.g. `/implement` and
`/ship-feature` initially looked generic from their descriptions but are
saturated with Flutter/BLoC specifics once you read the body).

## Install

```
/plugin marketplace add DungNV512/ai-sdlc-harness-mcp
/plugin install ai-sdlc-standard@ai-sdlc-harness-mcp
# For a Flutter project following Stockbook's conventions:
/plugin install ai-sdlc-stockbook-overlay@ai-sdlc-harness-mcp
```

Before the bundled MCP tools work:

1. Clone this repo somewhere permanent (installing the plugin does **not**
   keep a full checkout on disk — see "How plugin install actually works"
   below for why that matters) and build the server once:

   ```bash
   git clone https://github.com/DungNV512/ai-sdlc-harness-mcp.git
   cd ai-sdlc-harness-mcp/mcp-server && npm install && npm run build
   ```

2. Export `AI_SDLC_HARNESS_MCP_SERVER_DIR` pointing at that `mcp-server/`
   directory, plus the credentials it needs, in your shell profile:

   ```bash
   export AI_SDLC_HARNESS_MCP_SERVER_DIR=/absolute/path/to/ai-sdlc-harness-mcp/mcp-server
   export ATLASSIAN_EMAIL=you@example.com
   export ATLASSIAN_API_TOKEN=...
   export CONFLUENCE_SITE=https://your-site.atlassian.net
   export JIRA_SITE=https://your-site.atlassian.net
   export GITHUB_TOKEN=...
   ```

   (see [`../mcp-server/README.md`](../mcp-server/README.md) for what each
   var is for). `ai-sdlc-standard/.mcp.json` deliberately does **not**
   hardcode any of these — it spawns
   `node "${AI_SDLC_HARNESS_MCP_SERVER_DIR}"/dist/index.js` and lets the
   process inherit your shell's environment, so no secret ever lives in a
   file this marketplace tracks in git.

### How plugin install actually works (verified by actually doing it)

The first version of this doc assumed `${CLAUDE_PLUGIN_ROOT}/../../mcp-server/dist/index.js`
would work, on the theory that installing the plugin keeps this whole repo
checked out as one unit, so the plugin could reach its sibling `mcp-server/`
directory by relative path. **That assumption was wrong, and a real
`/plugin install` test caught it**: Claude Code copies each plugin into its
own isolated cache directory
(`~/.claude/plugins/cache/<marketplace>/<plugin-name>/<version>/`), with no
`mcp-server/` sibling anywhere nearby — the relative path resolved to a file
that doesn't exist, so the MCP server never started, silently. That's why
step 1/2 above ask you to keep your own separate clone and point at it with
an env var instead of relying on install-time layout.

## The `/pr` split, as a worked example of the Standard/Overlay boundary

## The `/pr` split, as a worked example of the Standard/Overlay boundary

`ai-sdlc-standard/commands/pr.md` is genericized: it reads a `vcs`
setting (`github`/`gitlab`) and calls the matching MCP tool
(`create_github_pull_request` today; a `create_gitlab_merge_request` tool
is not built yet — see the top-level README's roadmap). Because Stockbook
is GitLab-hosted and that tool doesn't exist yet,
`ai-sdlc-stockbook-overlay/commands/pr.md` is a same-named override
carrying the original `glab`-CLI-based flow verbatim. Claude Code resolves
a command name to the last-installed plugin that defines it, so installing
both plugins for a Stockbook-like GitLab project gets you the working
overlay version; installing only Standard for a GitHub project gets you
the generic one.

## Contributing a new skill, agent, command, or hook

Tested for real (not assumed) by adding a throwaway skill to a local clone,
pushing the change to the marketplace source, and running the exact update
commands a consuming project would run. Two things aren't obvious and will
trip you up if you skip them:

1. **A skill (or agent/command/hook) is a file you add to the plugin's
   `skills/`, `agents/`, `commands/`, or `hooks/` directory in this repo —
   nothing gets "submitted into the MCP server."** Skills and MCP tools are
   two unrelated mechanisms in Claude Code: the MCP server
   (`mcp-server/`) exposes callable **tools** over the MCP JSON-RPC
   protocol (Jira/Confluence/GitHub operations, `run_claude_code_command`);
   skills/agents/commands are **files** that Claude Code's plugin loader
   discovers by directory convention and loads into a session's context.
   There is no API or MCP tool for "adding a skill" — the workflow is git:
   add the file under the right plugin, commit, push, PR, merge.
2. **You must bump that plugin's `version` in its `.claude-plugin/plugin.json`,
   even for a one-file addition.** Confirmed by testing: a project that
   already has the plugin installed calls `claude plugin update
   <plugin>@<marketplace>` to pick up changes, and that command compares
   version strings — if the version didn't change, it reports "already at
   the latest version" and does **not** re-sync the installed copy, even
   though the underlying commit did change. (`claude plugin details`,
   confusingly, reads the marketplace source directly and *does* show the
   new file immediately — don't let that fool you into thinking consumers
   already have it; they don't, until the version bump ships and they
   update.) After `claude plugin update` reports success, existing Claude
   Code sessions need a restart to pick up the change.

Concrete steps to add a skill to, say, `ai-sdlc-standard`:

```bash
mkdir -p plugin/ai-sdlc-standard/skills/my-new-skill
# write plugin/ai-sdlc-standard/skills/my-new-skill/SKILL.md
# bump "version" in plugin/ai-sdlc-standard/.claude-plugin/plugin.json
git add plugin/ai-sdlc-standard/skills/my-new-skill plugin/ai-sdlc-standard/.claude-plugin/plugin.json
git commit -m "Add my-new-skill" && git push   # PR + merge in a real team
```

Consumers then run, in a project where the plugin is already installed:

```
claude plugin marketplace update ai-sdlc-harness-mcp
claude plugin update ai-sdlc-standard@ai-sdlc-harness-mcp
```

...then restart their Claude Code session.

If you just want to try authoring a skill locally without touching this
repo at all, `claude plugin new <name> --with skills` scaffolds one under
`~/.claude/skills/<name>/`, auto-loaded for you personally on your own
machine (a "skills-dir" plugin) — useful for prototyping before you decide
a skill is generally useful enough to contribute back here.

## Known limitations

- **GitLab tools are not built yet** (deferred, same egress-block
  reasoning as Confluence/Jira — see the top-level README). The overlay's
  `/pr` keeps working via `glab` directly in the meantime; Standard's
  genericized `/pr` will only work for `vcs: gitlab` once that MCP tool
  lands.
- **Standard's `install.sh`/`status.md` self-test step is a no-op** unless
  an overlay providing `.claude/hooks/_self_test.sh` is also installed
  (guarded explicitly, not silently broken — see their light-edit notes in
  the project plan doc).
- **The bundled MCP server does not activate in headless (`-p`) mode**,
  confirmed by real testing: with `AI_SDLC_HARNESS_MCP_SERVER_DIR` set
  correctly and the plugin installed at both user and project scope, a
  `claude -p "..."` run in that project reports zero `ai-sdlc-harness`
  tools — tried with `--dangerously-skip-permissions` and
  `"enableAllProjectMcpServers": true` in `.claude/settings.local.json`,
  neither changed the result. The identical server config passed directly
  via `--mcp-config` (bypassing the plugin loader) connects and lists all
  17 tools correctly, so the MCP server itself is not the problem — this
  looks like a one-time interactive approval gate for a freshly-installed
  plugin's MCP server that headless mode has no way to satisfy, silently
  skipping it rather than erroring. **Confirmed working in an interactive
  Claude Code session** (start `claude` normally in a project with the
  plugin installed and the env var set — the tools are available there).
  If you specifically need `ai-sdlc-harness`'s tools from a headless/`-p`
  script, use `--mcp-config` pointing at a config with the server declared
  directly (see this repo's own test in the project plan doc for the exact
  invocation) rather than relying on the plugin-installed path.

## Verified by actually installing this (this session, not assumed)

Cloned the repo fresh, ran `claude plugin marketplace add`, `claude plugin
install` for both plugins, and `claude plugin details` — confirmed the real
component counts match what's in the repo: `ai-sdlc-standard` → 3 agents
(security, architect, reviewer), 11 skills/commands (10 commands + 1 real
skill — Claude Code's plugin loader counts commands as a kind of skill
internally), 3 hooks (`PostToolUse`, `Stop`, `SessionStart`), 1 MCP server;
`ai-sdlc-stockbook-overlay` → 3 agents, 37 skills/commands (27 skills + 10
commands), 2 hooks (`PreToolUse`, `PostToolUse`), 0 MCP servers (by design
— only Standard wires the server). This is what caught the `.mcp.json` path
bug fixed above, and the two "Known limitations" entries above it — real
verification found real problems the JSON-schema-only pass couldn't.

## License

MIT

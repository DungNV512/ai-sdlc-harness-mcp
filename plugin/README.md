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

Before the bundled MCP tools work, build the server once in your clone:

```bash
cd mcp-server && npm install && npm run build
```

...and export the credentials it needs in your shell profile
(`ATLASSIAN_EMAIL`, `ATLASSIAN_API_TOKEN`, `CONFLUENCE_SITE`, `JIRA_SITE`,
`GITHUB_TOKEN` — see [`../mcp-server/README.md`](../mcp-server/README.md)).
`ai-sdlc-standard/.mcp.json` deliberately does **not** hardcode any of
these — it spawns the server with `node "${CLAUDE_PLUGIN_ROOT}"/../../mcp-server/dist/index.js`
and lets the process inherit your shell's environment, so no secret ever
lives in a file this marketplace tracks in git.

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

## Known limitations

- **Not live-installed in a real Claude Code instance.** Neither this
  session's cloud environment nor the device sandbox this was built in has
  a real Claude Code CLI reachable (see `mcp-server/README.md`'s Phase 5
  section for the same limitation affecting the trigger tool). Verification
  here was: every `.json` file (`marketplace.json`, both `plugin.json`,
  both `hooks.json`, `.mcp.json`) parses as valid JSON; the directory
  layout matches the convention confirmed against the real, live
  `anthropics/claude-code` marketplace and `commit-commands` plugin; file
  counts were cross-checked against a fresh `ls` of `stockbookapp/.claude/`
  rather than assumed. It has **not** been confirmed that Claude Code
  actually discovers and loads everything correctly end-to-end — that
  needs a real install (`/plugin marketplace add` + `/plugin install`) in
  an actual Claude Code session, which is a good next verification step
  before relying on this for real work.
- **GitLab tools are not built yet** (deferred, same egress-block
  reasoning as Confluence/Jira — see the top-level README). The overlay's
  `/pr` keeps working via `glab` directly in the meantime; Standard's
  genericized `/pr` will only work for `vcs: gitlab` once that MCP tool
  lands.
- **Standard's `install.sh`/`status.md` self-test step is a no-op** unless
  an overlay providing `.claude/hooks/_self_test.sh` is also installed
  (guarded explicitly, not silently broken — see their light-edit notes in
  the project plan doc).

## License

MIT

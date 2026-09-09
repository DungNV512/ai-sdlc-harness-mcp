---
description: Bootstrap the AI-SDLC harness into a repo that has never used it - detect the real toolchain and layout, then scaffold the docs and config the other commands require. Run this once per project, before /plan-feature.
argument-hint: [--vcs=github|gitlab] [--force]
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# /harness-init $ARGUMENTS

Installing the plugin gives you the commands. It does not give this repo the
files those commands read. `/plan-feature` stops immediately in a fresh repo
because `docs/ai-sdlc/phases.md`, `docs/ai-sdlc/integration.md` and
`docs/ai-sdlc/project.yml` do not exist yet. This command creates them, from
what your project actually is rather than from a template's assumptions.

Run once per repo. Safe to re-run: it never overwrites a file that already
exists unless `--force` is passed, and it never touches source code.

## Step 1 — Refuse to run in the wrong place

Stop with a clear message if any of these hold:

- `git rev-parse --show-toplevel` fails → not a git repo.
- The working directory is not that toplevel → tell the user to `cd` there.
- `docs/ai-sdlc/project.yml` already exists and `--force` was not passed →
  the harness is already initialised; print its contents and stop.

## Step 2 — Detect, do not assume

Use the `project-toolchain` skill for the commands, and resolve the rest here.
**Every value below must come from a file you read.** If something cannot be
determined, write `UNKNOWN` and list it as a question in the final report —
never fill it with a plausible guess.

- **Toolchain**: package manager (from the lockfile), and the real lint / test
  / build / format commands (from `scripts`, Makefile targets, or the
  ecosystem's convention). Verify at least the lint command runs.
- **Source roots**: the directories that actually hold first-party code.
  Read the workspace config where there is one (`pnpm-workspace.yaml`,
  `workspaces`, `go.work`, Cargo workspace members, `pubspec.yaml`); otherwise
  take the top-level dirs holding source, excluding `node_modules`, `dist`,
  `build`, `.git`, vendor directories. Do not write `src/` because it is
  common — write what is there.
- **VCS host**: from `git remote get-url origin`. `github.com` → `github`;
  anything containing `gitlab` → `gitlab`. `--vcs=` overrides. If there is no
  remote, ask.
- **Default branch**: `git symbolic-ref refs/remotes/origin/HEAD` if set, else
  the current branch, else ask. Do not assume `main`.
- **Existing conventions worth recording**: a CI config, a pre-commit hook and
  what it actually runs, an existing test layout.

## Step 3 — Show the detection and get confirmation

Print a table of every detected value with the file it came from, then ask
the user to confirm or correct before anything is written. This is the whole
point of the step: a wrong `test` command recorded here is one every later
command will trust.

Skip the confirmation only when running non-interactively, and say in the
report that values were unconfirmed.

## Step 4 — Write the files

Create each of these only if missing (or if `--force`):

### `docs/ai-sdlc/project.yml`

The single config the other commands read. Fill from step 2:

```yaml
# AI-SDLC harness configuration for this repo. Read by /plan-feature, /pr,
# /review, /security-review and the reviewer agent. Written by /harness-init;
# safe to hand-edit -- keep it accurate, everything downstream trusts it.
project: <repo name>
vcs: github            # or gitlab -- decides which MCP tool /pr calls
default_branch: <branch>

# Directories holding first-party source. Commands scope their reading and
# their "do not edit outside this" rules to these.
source_roots:
  - <dir>

toolchain:
  package_manager: <pnpm|npm|yarn|bun|cargo|go|uv|gradle|...>
  lint: <exact command>
  test: <exact command>
  build: <exact command>
  format_check: <exact command>
  # Anything not applicable: omit the key rather than inventing a command.

# Optional: filter syntax for a monorepo, so commands can scope to one package
# instead of running the whole workspace.
monorepo:
  tool: <turbo|nx|lerna|pnpm|none>
  filter_syntax: <e.g. "turbo run <task> --filter=<pkg>">
```

### `docs/ai-sdlc/phases.md`

```markdown
# AI-SDLC phases

Each phase has one owner, one artefact, and one exit condition. A phase that
cannot meet its exit condition stops the run; it does not proceed degraded.

| # | Phase | Command | Artefact | Exit condition |
|---|-------|---------|----------|----------------|
| 0 | Intake | (manual or a bridge) | `docs/specs/<slug>/traceability.yaml` | Sources identified and current; scope written down |
| 1 | Plan | `/plan-feature <slug>` | `docs/specs/<slug>/plan.md` | Sub-tasks listed; open questions explicit, not guessed |
| 2 | Spec | `/spec <slug>` | `docs/specs/<slug>/spec.md` | Behaviour specified precisely enough to write a failing test from |
| 3 | ADR (if architectural) | `/adr <slug>` | `docs/ai-sdlc/adr/<n>-<slug>.md` | >= 2 options compared; decision and consequences recorded |
| 4 | Implement | project-specific | code + tests | The project's test command passes |
| 5 | Self-review | `/review <slug>` | review table | No `block` or `major` finding left unresolved |
| 6 | Security review | `/security-review <slug>` | STRIDE table | No high residual risk without a follow-up |
| 7 | PR / MR | `/pr <slug>` | pull or merge request | Template filled; CI green where CI exists |
| 8 | Human gate | — | — | A person merges. Never automated. |

## Rules that hold across every phase

- Evidence over assertion: a claim about the code cites `file:line`; a claim
  about a check cites the command and its output.
- A check that did not run is reported as "did not run", never as passed and
  never as failed on its merits.
- Phase 8 is human. Claude never merges its own work and is never the sole
  approver.
- Stop at the first phase whose exit condition fails, and say which one.
```

### `docs/ai-sdlc/integration.md`

```markdown
# Integration and ownership rules

## Bounded layers

| Layer | Owns | Must not |
|-------|------|----------|
| Generated docs (`docs/specs/**`) | The harness | Be hand-edited mid-run; edit the source and re-run the phase |
| Source (`source_roots` in project.yml) | Engineers | Be edited by a phase that is not the implement phase |
| Config and CI | Engineers, via review | Be changed as a side effect of a feature task |
| Trackers (Jira/GitLab/GitHub issues) | The team | Be closed automatically by any command |

## Traceability

Every feature folder carries `traceability.yaml` linking: source (ticket or
document) -> task id -> plan -> spec -> code and tests -> ADRs -> gate
evidence. A phase that cannot link its artefact back to a source stops and
reports the break rather than filing an orphan.

## Ownership rules

- One task, one branch, one PR. Cross-cutting changes need an ADR first.
- A reviewer is never the author. Dispatch a fresh reviewer agent.
- Anything touching auth, tokens, network, storage or third-party SDKs goes
  through `/security-review` regardless of diff size.
- Secrets never enter the repo, generated docs, or a commit message. Report
  and stop.
```

### `docs/ai-sdlc/templates/` and the VCS PR template

The artefacts at each phase boundary need a contract, or the next phase has
to guess what it was handed. Write all four, each only if missing (or with
`--force`):

- `docs/ai-sdlc/templates/pull-request.md` — the per-field rules
  (`vnd.ai-sdlc.pull-request/v1`).
- `docs/ai-sdlc/templates/jira-ticket.md` — `vnd.ai-sdlc.jira-ticket/v1`.
- `docs/ai-sdlc/templates/skill.md` — `vnd.ai-sdlc.skill/v1`.
- The host-native PR template, so a person opening a PR by hand in the web
  UI gets the same shape a command would produce. **Path depends on `vcs`
  detected in step 2** — write the matching one, never both:

  | `vcs` | Path |
  |---|---|
  | `github` | `.github/PULL_REQUEST_TEMPLATE.md` |
  | `gitlab` | `.gitlab/merge_request_templates/Default.md` |

  If `vcs` is `UNKNOWN`, write neither, and say in the report that the host
  template was skipped because the VCS could not be determined — do not
  write a GitHub file into a GitLab repo on a coin flip.

Copy the bodies from this plugin's own `docs/ai-sdlc/templates/*` as the
reference shape, but **inline them here rather than reading them by path
from the installed plugin** — same reason every other template in this
command is inlined: a path relative to an installed plugin is a failure
waiting to happen (see the `.mcp.json` bug).

The fixed PR body shape is:

```
Refs: <TICKET-KEY>          # or `PENDING — <reason>`, never omitted

## Summary
## What changed
## Verified                 # command + what it returned
## Not verified             # REQUIRED; "Nothing — ..." if truly nothing
## Risk and rollback
## Screenshots / recording  # or "N/A — no UI change"
## Security note            # or "N/A — no auth/network/storage touched"
## Links
```

### `docs/specs/README.md`

```markdown
# Feature specs

One folder per task: `docs/specs/<slug>/`, holding `traceability.yaml`
(Phase 0), `plan.md` (Phase 1), `spec.md` (Phase 2), and for audits
`report.md`. Created by the phase commands; do not hand-author them.
```

### `CLAUDE.md`

If it does not exist, create it with a short project header plus the AI-SDLC
section below. **If it does exist, do not rewrite it** — append the section
only, and only if a section with the same heading is not already present:

```markdown
## AI-SDLC harness

This repo uses the `vnd-ai-sdlc` Claude Code plugin. Configuration lives in
`docs/ai-sdlc/project.yml`; phases in `docs/ai-sdlc/phases.md`.

- Toolchain: `<lint>` / `<test>` / `<build>` (resolved by /harness-init on <date>)
- Source roots: `<roots>`
- Start a task with `/plan-feature <slug>`, never by editing code first.
```

## Step 5 — Report

Print a table of every file with `created`, `skipped (exists)`, or
`overwritten (--force)`, then the unresolved `UNKNOWN` values as questions,
then the next command to run (`/plan-feature <slug>`).

State plainly if anything could not be detected. A `project.yml` with an
honest `UNKNOWN` is better than one with a guess that silently misleads every
later phase.

## Anti-patterns to refuse

- Writing a toolchain command that was never verified to run.
- Overwriting an existing `CLAUDE.md`, or any file, without `--force`.
- Inventing `source_roots` from convention (`src/`, `lib/`) instead of reading
  the workspace config or listing what is actually there.
- Committing or pushing. This command writes files; the user reviews and
  commits them.
- Running in a repo that already has `project.yml` and quietly re-scaffolding
  over the team's edits.

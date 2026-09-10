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

# Who reviews work in this repo. /pr requests review from these people, and
# the Teams notification names them. List real VCS usernames, not display
# names. Leave empty rather than guessing -- an unassigned PR is honest; a PR
# assigned to the wrong person is not.
maintainers: []

# Optional. When TEAMS_WEBHOOK_URL is set in the environment, /pr and
# /notify-merge post an Adaptive Card here. Absent or unset means the harness
# simply does not notify -- it is never a failure.
notifications:
  teams: env:TEAMS_WEBHOOK_URL

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

These are the delivery phases: they start from work someone has already
decided is worth doing. What happens before that decision is specified
separately — discovery stages A0–A4 and gate G1 in `docs/ai-sdlc/stage-a-discovery.md`,
definition B0–B2 with gates G2 and G3 in `stage-b-definition.md`, and design C1–C5 with
gate G4 in `stage-c-design.md`. Work can legitimately enter at Phase 0 without
passing through them (a bug fix, a small change); work that came the long way
arrives with `discovery`, `define`, `design` and `gates` already filled in
its manifest.

| # | Phase | Command | Artefact | Exit condition |
|---|-------|---------|----------|----------------|
| 0 | Intake | `/plan-feature` generates it | `docs/specs/<slug>/traceability.yaml` | Sources identified and current; scope written down |
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
to guess what it was handed. Write all of these, each only if missing (or with
`--force`):

- `docs/ai-sdlc/templates/pull-request.md` — the per-field rules
  (`vnd.ai-sdlc.pull-request/v1`).
- `docs/ai-sdlc/templates/jira-ticket.md` — `vnd.ai-sdlc.jira-ticket/v1`.
- `docs/ai-sdlc/templates/skill.md` — `vnd.ai-sdlc.skill/v1`.
- `docs/ai-sdlc/templates/traceability.yaml` — `vnd.ai-sdlc.traceability/v2`.
  **Do not skip this one.** Eleven commands read `traceability.yaml`;
  `/plan-feature` generates each feature's copy from this schema. Without it
  every team hand-writes the manifest, guesses different key names, and the
  later phases fail on fields that were never there.
- `docs/ai-sdlc/templates/company-context.md` —
  `vnd.ai-sdlc.company-context/v1`. **Write this one even though it is not
  per-feature.** It is standing background with one named owner and a review
  cadence, and every Stage A and Stage B prompt reads it. Without it the
  analysis is about a generic company rather than this one. Say in the report
  that it needs an owner assigned before `/idea-card` is useful.
- `docs/ai-sdlc/company-context.md` — **the instance, not the template**,
  only if missing. Every Stage A/B command reads this exact path (never the
  template path) — `/idea-card`, `/problem-canvas`, `/market-scan`,
  `/discovery-report`. Since Company Context has no per-feature generator (it
  is standing, not produced by a phase), `/harness-init` is the only place it
  gets created. Seed it as a copy of the template with every field marked
  `NEEDS OWNER — not yet filled`, never with invented content — an instance
  that looks filled in but isn't is worse than one that visibly isn't.
- The **Stage A** contracts, written together since they only make sense as a
  set: `issue-report.md` (`vnd.ai-sdlc.issue-report/v1`), `idea-card.md`
  (`vnd.ai-sdlc.idea-card/v1`), `problem-statement-canvas.md`
  (`vnd.ai-sdlc.problem-statement-canvas/v1`), `market-scan.md`
  (`vnd.ai-sdlc.market-scan/v1`), `feasibility-assessment.md`
  (`vnd.ai-sdlc.feasibility-assessment/v1`), and `discovery-report.md`
  (`vnd.ai-sdlc.discovery-report/v1`).
- The **Stage B** contracts: `systems-context.md`
  (`vnd.ai-sdlc.systems-context/v1`), `brd.md` (`vnd.ai-sdlc.brd/v1`), and
  `prd.md` (`vnd.ai-sdlc.prd/v1`).
- The **Stage C** contracts: `package-design.md`
  (`vnd.ai-sdlc.package-design/v1`), `integration-design.md`
  (`vnd.ai-sdlc.integration-design/v1`), `function-list.md`
  (`vnd.ai-sdlc.function-list/v1`), `srs.md` (`vnd.ai-sdlc.srs/v1`),
  `ui-spec.md` (`vnd.ai-sdlc.ui-spec/v1`), `test-strategy.md`
  (`vnd.ai-sdlc.test-strategy/v1`), and `threat-model.md`
  (`vnd.ai-sdlc.threat-model/v1`).
- `docs/ai-sdlc/stage-a-discovery.md`, `stage-b-definition.md` and `stage-c-design.md` — the upstream
  stages and the G1–G4 gates.
  Every upstream command — `/idea-card`, `/problem-canvas`, `/market-scan`,
  `/discovery-report`, `/context-doc`, `/brd`, `/prd`, `/sa-view`, `/srs`,
  `/ui-spec`, `/test-strategy` and `/gate` — reads these **from the consuming
  repo**, the same way every command reads `project.yml` from there. Inline the content below rather than reading it
  from the installed plugin by path — a path relative to an installed plugin
  is a failure waiting to happen (see the `.mcp.json` bug), and the plugin
  ships no `docs/` directory to read from in the first place.

  ```markdown
  # Stage A — Discovery, and the G1 feasibility gate

  Phases 0–8 describe delivery: they start from work someone already decided
  was worth doing. Stage A is what happens before that decision. Work may
  legitimately enter at Phase 0 without passing through Stage A (a bug fix, a
  small change); work that did arrives with `discovery` and `gates.G1`
  already filled in its `traceability.yaml`.

  | Stage | Produces | Command |
  |---|---|---|
  | A0 Issue intake | Issue Report | infrastructure, not a command |
  | A1 Signal normalisation | Idea Card | `/idea-card` |
  | A2 Problem framing | Problem Statement Canvas | `/problem-canvas` |
  | A3 Market & feasibility scan | Market Scan, Feasibility Assessment | not built |
  | A4 Discovery synthesis | Discovery Report | `/discovery-report` |
  | G1 Feasibility gate | Decision + minutes | `/gate G1` records it |

  ## Definitions of done

  - **A0** — within 3–5 working days the submitter gets exactly one of:
    into the cycle, deferred with a reason, or merged into a tracked issue.
    Silence is a failure of this stage.
  - **A1** — the *observed problem* field contains none of `cần` · `nên` ·
    `tính năng` · `build` · `làm` · `tạo` (or `need` / `should` / `feature` /
    `build` / `make` / `create`). Each of those replaces an observation with
    a solution, and a solution recorded as a problem is never re-examined.
  - **A2** — one A4 page, and someone outside the project can answer after
    reading it: whose problem is this, when does it happen, how much does it
    hurt?
  - **A3** — at least one advantage that is specific and defensible. "We do
    it better" is rejected. Unverified numbers carry `[ước tính]` inline.
  - **A4** — five sections, five pages, plus the mandatory adversarial
    reviewer pass (logical gaps · assumptions treated as fact · the five
    hardest questions). Longer than five pages means A2 was not sharp
    enough; fix it upstream rather than compressing.

  ## G1 — hard gate

  **No AI participation.** 60 minutes, no longer. C-level decides, PM
  presents, Tech Lead attends only if there is real technical risk. Three
  questions: worth building against the backlog? right moment? what is the
  advantage and will it last?

  | Decision | Obliges | Recorded |
  |---|---|---|
  | GO | proceed to Stage B, resources allocated | `gates.G1.decision: GO` |
  | NO-GO | archive with reason, **and tell the submitter** | `+ reason`, `+ submitter_notified` |
  | NEED-DATA | name the data, the owner, and the return date | `+ needed_data`, `+ data_owner`, `+ return_by` |

  A NEED-DATA missing any of its three fields is an abandoned idea nobody
  has admitted to abandoning; `/gate` refuses to record one.

  Recorded in two places, both required: minutes in Confluence (what a
  person reads later) and `gates.G1` in the feature's `traceability.yaml`
  (what the harness reads).

  ## Stage B — Define (see stage-b-definition.md)

  | Phase | Produces | Command | DoD that bites |
  |---|---|---|---|
  | B0 | Systems & Projects Context Doc | `/context-doc` | **Humans only, no AI generation.** Architect fills the technical debt and data/integration sections personally. Regulated domain → the BRD cannot be finalised until legal advises. |
  | B1 | BRD, rules `BR/DR/SR/IR-NNN` | `/brd` | Unique ids · no rule contradicts another · every `IR` **names** a system · every metric has a number and a date · C-level approved · **Architect confirmed in writing** · legal confirmed if regulated |
  | B2 | PRD, ids `F/AC/Q-NNN` | `/prd` | ≥ 2 testable ACs per Must-have · every feature traces to ≥ 1 rule (**untraced = scope creep**) · a developer can estimate and QA can write cases without asking · personas state validated-or-assumption |

  **G2** (after B1) and **G3** (after B2) are each **two parts and need
  both**. G2: C-level approval *and* a ≥ 60-minute walkthrough with the
  Architect ending in **written** confirmation. G3: a one-hour team review
  *and* a 90-minute Sprint 0. These are the steps most often quietly cut.

  ## Stage C — Design (see stage-c-design.md)

  Hard ordering: **C1 → C2 → C3**, with C4 parallel to C3.

  | Phase | Produces | Command | DoD that bites |
  |---|---|---|---|
  | C1 | Package + Integration Design | `/sa-view` | Scalability and security reviewed · **every API contract confirmed with a person**, not a docs link · no BRD rule violated |
  | C2 | Function List + SRS, `USn` ids | `/srs` | Every requirement testable · every SRS item traces up to the PRD · every state listed, not just the happy path |
  | C3 | Figma frames + design tokens | `/ui-spec` | ≥ 1 round with **representative users** · WCAG 2.1 AA on real values · **published file key, never `unsaved-*`** · stable `nodeId` per frame |
  | C4 | Test Strategy | `/test-strategy` | Coverage thresholds **as numbers, decided per project** with a named enforcer · every AC has a sketched test case |
  | C5 | Threat Model | `/security-review` | Security requirement per component · findings carry severity · risk acceptance signed |

  **G4** signs **per output**; any output short of its DoD means stage P does
  not start. G4 also switches on **mandatory version control**: after it, any
  change to a signed-off artefact needs a new version, a reason, and
  notification of everyone who read the old one.

  ## Stages P, D, E, F, O

  The delivery half — see `phases.md`.
  ```
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

**Inline every template body rather than reading it by path from the
installed plugin** — a path relative to an installed plugin is a failure
waiting to happen (see the `.mcp.json` bug), and the plugin ships no `docs/`
directory to read from.

The traceability manifest shape, which `/plan-feature` generates each
feature's copy from. **This is `vnd.ai-sdlc.traceability/v2`** — it must
match `docs/ai-sdlc/templates/traceability.yaml` exactly; if the two ever
drift, the template file is the one to trust and this block needs updating,
not the other way round:

```yaml
schema: vnd.ai-sdlc.traceability/v2

slug: <feature-slug>              # matches the docs/specs/<slug>/ folder name
title: <one line, plain language>
status: draft                     # draft | active | shipped | abandoned
created: <YYYY-MM-DD>
owner: <person accountable, not the author of the code>

sources:                          # at least one entry. NEVER empty.
  - id: <TICKET-KEY or doc id>
    type: jira                    # jira | confluence | issue | incident | conversation
    title: <as it reads at the source>
    url: <link>
    retrieved: <YYYY-MM-DD>       # when it was last read; stale sources mislead

module: <module-or-package>       # omit the key if the project has no such concept

# Upstream discovery (Stage A). Present only for work that went through
# discovery; omit the whole block for a bug fix that entered at Phase 0.
discovery:
  issue_report: <Confluence URL or PENDING — reason>
  idea_card: <Confluence URL or PENDING — reason>
  problem_statement_canvas: <Confluence URL or PENDING — reason>
  market_scan: <Confluence URL or PENDING — reason>
  feasibility_assessment: <Confluence URL or PENDING — reason>
  discovery_report: <Confluence URL or PENDING — reason>

# Stage B (Define). Present for work that went through B0-B2.
define:
  systems_context: <Confluence URL or PENDING — reason>
  brd: <Confluence URL or PENDING — reason>
  prd: <Confluence URL or PENDING — reason>
  legal_status: not_applicable    # not_applicable | requested | received
  legal_requested: <YYYY-MM-DD, or omit>
  rule_ids:    []                 # e.g. [BR-001..BR-014, SR-001..SR-003]
  feature_ids: []                 # e.g. [F-001..F-022]
  ac_ids:      []                 # e.g. [AC-001..AC-058]
  trace_check:                    # the two-way BRD<->PRD check from B2
    uncovered_rules: []
    untraced_features: []

# Stage C (Design).
design:
  package_design: <Confluence URL or PENDING — reason>
  integration_design: <Confluence URL or PENDING — reason>
  function_list: <Confluence URL or PENDING — reason>
  srs: <Confluence URL or PENDING — reason>
  ui_spec: <Confluence URL or PENDING — reason>
  test_strategy: <Confluence URL or PENDING — reason>
  threat_model: <repo path or PENDING — reason>
  blocked_contracts: []           # contracts needed but not confirmed, visible at G4
  figma_file_key: <published key or PENDING — reason>   # never an unsaved-* key
  user_story_ids: []              # e.g. [US1-01, US1-02, US2-01] — assigned once at C2
  coverage_thresholds:
    overall: <n>%
    domain: <n>%
    enforced_by: <hook or CI job>

# Gate decisions. A gate is a human decision point; nothing here is ever
# written by an AI on its own authority.
gates:
  G1:                              # Feasibility gate, end of Stage A
    decision: PENDING              # PENDING | GO | NO-GO | NEED-DATA
    date: <YYYY-MM-DD>
    decided_by: <C-level name/role who actually decided>
    minutes: <Confluence URL>
    needed_data: <what specifically, or omit>     # NEED-DATA only
    data_owner: <who fetches it, or omit>          # NEED-DATA only
    return_by: <YYYY-MM-DD, or omit>               # NEED-DATA only
    reason: <why, or omit>                         # NO-GO only
    submitter_notified: <YYYY-MM-DD, or omit>      # NO-GO only

  G2:                              # BRD sign-off, end of B1. TWO PARTS, both required.
    decision: PENDING              # PENDING | APPROVED | IN-REVIEW | BLOCKED
    date: <YYYY-MM-DD>
    minutes: <Confluence URL>
    c_level_approved:
      by: <who>
      date: <YYYY-MM-DD>
    architect_confirmation:        # >= 60 min sitting together; WRITTEN confirmation
      by: <Architect name>
      date: <YYYY-MM-DD>
      link: <URL of the email or comment>
    blocked_on: <e.g. legal advice, or omit>

  G3:                              # PRD sign-off, end of B2. TWO PARTS.
    decision: PENDING              # PENDING | APPROVED | FIX-TOP-3 | NOT-RIPE
    date: <YYYY-MM-DD>
    minutes: <Confluence URL>
    team_review:                   # 1 hour: Dev + QA + Designer + PM
      date: <YYYY-MM-DD>
      attendees: []
    sprint0_kickoff:                # 90 minutes walking the whole PRD
      date: <YYYY-MM-DD>
      attendees: []
    open_questions_closed: false    # > 2 unowned Q-NNN => NOT-RIPE, see stage-b-definition.md

  G4:                              # Design sign-off, end of stage C. PER OUTPUT.
    decision: PENDING              # PENDING | SIGNED-OFF | DOD-NOT-MET | ANOTHER-ROUND
    date: <YYYY-MM-DD>
    minutes: <Confluence URL>
    outputs:
      package_design:      { owner: <name>, dod_met: false, signed: <YYYY-MM-DD> }
      integration_design:  { owner: <name>, dod_met: false, signed: <YYYY-MM-DD> }
      function_list:       { owner: <name>, dod_met: false, signed: <YYYY-MM-DD> }
      srs:                 { owner: <name>, dod_met: false, signed: <YYYY-MM-DD> }
      ui_spec:             { owner: <name>, dod_met: false, signed: <YYYY-MM-DD> }
      test_strategy:       { owner: <name>, dod_met: false, signed: <YYYY-MM-DD> }
      threat_model:        { owner: <name>, dod_met: false, signed: <YYYY-MM-DD> }
    version_control_active: false   # G4 turns this on; see stage-c-design.md

  G5:                              # Human merge gate, end of F3.
    decision: PENDING              # PENDING | MERGED | CHANGES-REQUESTED | CLOSED
    date: <YYYY-MM-DD>
    approved_by: <the human who approved - never the harness>
    mr_url: <URL>

tasks:
  - id: T1
    summary: <what this task delivers>
    status: todo                   # todo | doing | done | dropped
    covers: []                     # requirement ids from spec.md, e.g. [FR-001]

artefacts:
  plan: docs/specs/<slug>/plan.md
  spec: docs/specs/<slug>/spec.md
  adrs: []                         # docs/ai-sdlc/adr/<n>-<slug>.md
  pr: <URL once opened, else PENDING — not opened yet>

code: []                          # - path: ...   tasks: [T1]
tests: []                         # - path: ...   covers: [T1]

evidence:
  lint: PENDING — not run yet
  test: PENDING — not run yet
  security_review: PENDING — not run yet
```

Three rules the file carries: `sources` is never empty (a feature with no
source is an orphan); unknown is written as `PENDING — <reason>`, never
omitted and never guessed — a missing key and a deliberately-unknown one
must not look the same; and the `discovery`/`define`/`design` blocks are each
omitted **entirely** for work that skipped that stage (entered at Phase 0),
never left present with every field `PENDING` — an omitted block means "not
applicable," a present-but-pending block means "applicable, not done yet,"
and collapsing that distinction is what caused the traceability generation
bug this file exists to close.

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

One folder per task: `docs/specs/<slug>/`, holding

- `traceability.yaml` — the manifest (Phase 0). Generated by `/plan-feature`
  from `docs/ai-sdlc/templates/traceability.yaml`, then hand-editable. It is
  the one file that links the work back to why it exists and forward to the
  code that implements it.
- `plan.md` (Phase 1), `spec.md` (Phase 2), and for audits `report.md` —
  created by the phase commands; do not hand-author these.
- For work that came through discovery: `idea-card.md` (A1),
  `problem-statement-canvas.md` (A2), `market-scan.md` /
  `feasibility-assessment.md` (A3), `discovery-report.md` (A4). See
  `docs/ai-sdlc/stage-a-discovery.md`.
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

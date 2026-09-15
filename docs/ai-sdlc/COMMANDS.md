# Command Reference

Quick lookup for every command in the AI SDLC harness.

---

## Discovery Phase (Stage A)

### `/idea-card <slug>`
Capture a problem statement as a normalized Idea Card.
- **Input**: Problem description from a person
- **Output**: `docs/specs/<slug>/idea-card.md`
- **Owner runs**: PM
- **Gate**: None (A1 feeds into A2)

### `/problem-canvas <slug>`
Frame the root problem on a one-page canvas (WHO / WHAT / WHY IT MATTERS / WHY NOW).
- **Input**: `idea-card.md`
- **Output**: `docs/specs/<slug>/problem-statement-canvas.md` (max 500–600 words)
- **Owner runs**: PM + originator (30–45 min working session)
- **Uses**: Interactive conversation to find root problem
- **Next**: `/market-scan`

### `/market-scan <slug>`
Scan the market landscape and competitive position.
- **Input**: `problem-statement-canvas.md`
- **Output**: `docs/specs/<slug>/market-scan.md`
- **Owner runs**: AI drafts; a human verifies every figure against its source
- **Output (2nd)**: `docs/specs/<slug>/feasibility-assessment.md`
- **Next**: `/discovery-report`

> **Không có `/feasibility-assessment` riêng.** `/market-scan` chạy ba luồng song song
> và sinh **cả hai** artefact: Market Scan Report và Feasibility Assessment.

### `/discovery-report <slug>`
Synthesize discovery into a 5-page report ready for G1 feasibility gate.
- **Input**: All A-phase docs (problem-canvas, market-scan, feasibility-assessment)
- **Output**: `docs/specs/<slug>/discovery-report.md`
- **Owner runs**: pm-analyst agent (with adversarial reviewer pass)
- **DoD**: 5 sections, 5 pages, hard limits enforced
- **Next**: `/ipam-way`

### `/ipam-way <slug>`
Co-author the IPAM Way stakeholder alignment + integrity canvas.
- **Input**: All discovery artifacts
- **Output**: `docs/specs/<slug>/ipam-way.md`
- **Owner runs**: PM + Architect (sit together)
- **Sections**: Interbeing (stakeholders), Integrity (constraints), Mobilise (actions)
- **Next**: `/gate G1`

### `/gate G1 <slug>`
Record the feasibility gate decision.
- **Input**: Complete discovery artifacts + IPAM Way
- **Owner runs**: C-level (CEO/board decision)
- **Decisions**:
  - `GO` → proceed to Stage B (requires `discovery.ipam_way` + `discovery.omvp_charter`)
  - `NO-GO` → stop, record reason
  - `NEED-DATA` → define 3 required fields, max 1 week, reconvene
- **Output**: `docs/specs/<slug>/traceability.yaml` → `gates[G1]`
- **Next**: `/context-doc` (if GO)

---

## Definition Phase (Stage B)

### `/context-doc <slug>`
Scribe the Systems & Projects Context Doc while PM + Architect fill it.
- **Input**: G1 GO decision + internal org knowledge
- **Output**: `docs/specs/<slug>/systems-context.md`
- **Owner runs**: PM + Architect (sit together, human work)
- **DoD**: 7 items (systems table, projects table, tech debt, data/integration, dependencies, regulatory holds)
- **Uses**: Knowledge transfer between experienced people; harness scaffolds, checks completeness, never invents
- **Next**: `/brd`

### `/brd <slug>`
Author the Business Requirements Document.
- **Input**: All B0 docs + Discovery Report
- **Output**: `docs/specs/<slug>/brd.md`
- **Owner runs**: pm-analyst agent (with 5-angle reviewer pass)
- **Produces**: BR/DR/SR/IR rules with unique ids, success metrics linked to OKRs
- **DoD**: 9 items (unique ids, no contradictions, integration names specific, metrics have numbers + deadlines, C-level approval, architect confirmation, legal clearance for regulated domains, all stakeholder functions represented, version history)
- **Next**: `/gate G2`

### `/gate G2 <slug>`
Record BRD sign-off — HARD GATE with two required parts.
- **Owner runs**: C-level + Architect
- **Part 1** (1 hour): C-level approval of Business Context and Business Rules → BRD status `Approved`
- **Part 2** (≥60 minutes): BRD walkthrough with Architect (sitting together) → written confirmation they read entire doc, no rule is misunderstood, no technical constraint missing
- **Decisions**:
  - `APPROVED` → both parts complete
  - `IN-REVIEW` → one part outstanding
  - `BLOCKED` → waiting on legal (regulated domain)
- **Output**: `traceability.yaml` → `gates[G2]`
- **Note**: This is the step most often quietly cut; `/gate` refuses a record with only one part
- **Next**: `/prd`

### `/prd <slug>`
Author the Product Requirements Document.
- **Input**: Approved BRD + user research (or explicit "none yet — using ICP")
- **Output**: `docs/specs/<slug>/prd.md`
- **Owner runs**: pm-analyst agent (with 2-angle reviewer pass)
- **Produces**: Personas, journeys, feature list with MoSCoW + two-way trace (forward: which features implement each BRD rule; backward: every feature traces to a rule)
- **DoD**: 11 items (must-haves have ≥2 acceptance criteria, no contradiction of BRD, every feature traces to ≥1 rule, out-of-scope agreed by PM + C-level, developer can estimate without questions, QA can write test cases without questions, personas state source, open questions have owner + deadline, every role has persona row with data scope, two-way coverage recorded, version history per change)
- **Next**: `/gate G3`

### `/gate G3 <slug>`
Record PRD sign-off — HARD GATE with two required parts.
- **Owner runs**: Dev + QA + Designer + PM
- **Part 1** (1 hour): Team review and feedback
- **Part 2** (90 minutes): Sprint 0 walkthrough of entire PRD, every question → Open Questions with owner + deadline
- **Decisions**:
  - `APPROVED` → both meetings held, ≤2 unowned open questions
  - `FIX-TOP-3` → approved subject to three named fixes
  - `NOT-RIPE` → too many open questions (>2 with no owner); **stage C must not start**
- **Output**: `traceability.yaml` → `gates[G3]`
- **Next**: `/sa-view` (if approved)

---

## Design Phase (Stage C)

### `/sa-view <slug>`
Design package architecture and integration contracts.
- **Input**: BRD
- **Output**: `docs/specs/<slug>/package-design.md` + `integration-design.md`
- **Owner runs**: architect
- **Produces**: Client architecture (Package Design) + API contracts (read-only from existing API docs; if needed contract doesn't exist, that's a finding + dependency, not license to design new)
- **DoD**: Scalability + security risk reviewed; every API contract confirmed with owning party; no BRD rule violated
- **Ordering**: C1 must complete before C2 (SRS needs both BRD/PRD + Package Design)
- **Next**: `/srs`

### `/srs <slug>`
Detail requirements into individually testable function list + SRS.
- **Input**: BRD + PRD + C1 (Package Design)
- **Output**: `docs/specs/<slug>/function-list.md` + `srs.md`
- **Owner runs**: architect
- **Produces**: Every AC detailed into individually testable requirement; US ids assigned per user story; each item traces to F-NNN / AC-NNN; flat FR-### format; Given/When/Then prose; five named NFR groups (Hiệu suất, Bảo mật, Khả năng mở rộng, Khả dụng, Tuân thủ)
- **DoD**: 9 items (scope agreed, every requirement testable, every item traces to PRD, all states listed, NFRs carry number + measurement + goal, permissions matrix exists if >1 role, every entity states PII + retention, every integration names system + owner, flows are inline mermaid)
- **Ordering**: C2 before C3 (UI specs drawn from this list)
- **Next**: `/ui-spec` (C3) + `/test-strategy` (C4) + `/security-review` (C5) — C3 and C4 run in parallel

### `/ui-spec <slug>`
Design wireframes → hi-fi Figma frames + design tokens.
- **Input**: PRD (personas, journeys) + SRS
- **Output**: Figma file (stable published key, never `unsaved-*`) + `docs/specs/<slug>/ui-spec.md`
- **Owner runs**: px-designer
- **Produces**: Frame naming by US id; interaction specs for every state; design token export
- **DoD**: ≥1 round feedback from representative users; WCAG 2.1 AA; stable `nodeId` per frame
- **Note**: Figma file key is a hard DoD — if it changes, all `mcp_ref` links break with no warning
- **Ordering**: C2 before C3; C3 and C4 can run in parallel
- **Next**: `/test-strategy` (parallel, not dependent)

### `/test-strategy <slug>`
Define test pyramid, coverage thresholds, and QA approach.
- **Input**: PRD + SRS
- **Output**: `docs/specs/<slug>/test-strategy.md`
- **Owner runs**: qa-engineer
- **Produces**: Test pyramid shape; coverage thresholds (as fixed numbers with enforcement mechanism); sketched test case per PRD acceptance criterion
- **DoD**: Coverage thresholds fixed as numbers, enforcement mechanism named; every AC has ≥1 sketched test case
- **Note**: Set thresholds per project; inherit Stockbook's 80/90 only if you decide that's your standard
- **Ordering**: C2 before C3; C3 and C4 parallel
- **Next**: `/security-review` (C5, parallel)

### `/security-review <slug>` (C5)
STRIDE threat model per feature + risk acceptance.
- **Input**: C1 + C2 (architecture + requirements)
- **Output**: `docs/specs/<slug>/threat-model.md` (in repo, not Confluence)
- **Owner runs**: security
- **Produces**: STRIDE per feature (actor, attack, mitigation, residual risk); security requirement per component; risk acceptance signed
- **DoD**: Severity on every finding; risk acceptance signed
- **Uses**: the `threat-modeling` skill (STRIDE) — a skill, not a command
- **Ordering**: C5 draws on C1 + C2 (no dependency on C3/C4)
- **Next**: `/gate G4`

### `/gate G4 <slug>`
Record design sign-off — HARD GATE, per-output.
- **Owner runs**: All C owners (architect, px-designer, qa-engineer, security)
- **Decision**: Each output must meet its DoD; if any falls short → stage P does not start
- **Decisions**:
  - `SIGNED-OFF` → every output meets DoD, every owner signed
  - `DOD-NOT-MET` → at least one output falls short (named)
  - `ANOTHER-ROUND` → signed in principle, one more revision agreed
- **Output**: `traceability.yaml` → `gates[G4]`
- **Effect**: Version control becomes mandatory for all upstream artefacts (BRD, PRD, SRS, etc.) from this point onward
- **Next**: Implementation phase (Stage D, not yet specified)

---

## Delivery Commands

Run at any stage to coordinate work, orchestrate builds, or publish results.

### `/plan-feature <slug>`
Intake a feature request and produce a plan + sub-tasks.
- **Input**: Feature description + acceptance criteria
- **Output**: `docs/specs/<slug>/traceability.yaml` (with phase tracking) + task breakdown
- **Owner runs**: Whole team (entry point to the harness)
- **Produces**: Sub-tasks for each phase (A1, A2, A4, B1, B2, C1, C2, C3, C4, C5, plus delivery tasks)

### `/spec <slug>`
Narrow and refine requirements; open architecture decision record.
- **Input**: Broad requirements + uncertainty
- **Output**: Narrowed spec + `docs/specs/<slug>/adr.md`
- **Owner runs**: Dev + architect
- **Produces**: ADR with decision rationale + trade-offs

### `/adr <slug>`
Open a new Architecture Decision Record.
- **Input**: Architecture question or design decision
- **Output**: `docs/specs/<slug>/adr-###.md`
- **Owner runs**: architect
- **Template**: Status (PROPOSED/ACCEPTED/DEPRECATED), context, decision, consequences, alternatives considered

### `/pr`
Create a pull request or merge request.
- **Input**: Feature branch + review checklist
- **Output**: GitHub PR or GitLab MR (determined by `vcs` setting in `project.yml`)
- **Owner runs**: Dev team
- **Default**: `vcs: github` (Standard) or `vcs: gitlab` (Stockbook overlay)
- **Note**: Standard's `/pr` genericized to read `vcs` setting; Stockbook's override uses glab-based flow

### `/review <file>`
Independent code review of a diff.
- **Input**: File path or Git diff
- **Output**: Review findings + checklist
- **Owner runs**: reviewer agent (independent, never reviewed the code being reviewed)
- **Reviews**: Correctness, simplification, efficiency, test coverage

### `/security-review <file>`
Security review of code changes.
- **Input**: Changed files or module
- **Output**: Security findings + risk assessment
- **Owner runs**: security agent
- **Reviews**: Secret audit, PII handling, auth/authn/authz, injection risk, crypto

### `/ship-feature <slug>`
Orchestrate the full delivery: lint + test + merge + announce.
- **Input**: Feature complete and reviewed
- **Output**: Merged to main + Teams notification
- **Owner runs**: Release team (calls lint, test, pr, notify-merge in sequence)
- **Orchestration**:
  1. Run lint (or skip if clean)
  2. Run test (or skip if passing)
  3. Create/verify PR/MR
  4. Merge (human decision)
  5. Announce to Teams
- **Note**: Harness never merges; only records the human decision

### `/abort <slug>`
Clean abort of in-flight feature work.
- **Input**: Reason for abort
- **Output**: Work stashed, branch deleted, spec archived
- **Owner runs**: Whole team (rollback mechanism)
- **Produces**: Detaches HEAD at last-green commit; saves branch tip as headref for later recovery

### `/status`
Show project status: which phases complete, which phases pending, which gates passed.
- **Input**: None (reads traceability.yaml)
- **Output**: Status summary table
- **Owner runs**: Whole team (progress visibility)

### `/notify-merge`
Announce a merged PR/MR to Microsoft Teams.
- **Input**: PR/MR title + link
- **Output**: Teams channel message
- **Owner runs**: After human merge (harness never merges)
- **Uses**: teams MCP tool

### `/update-memory`
Save project learnings to Claude memory for future sessions.
- **Input**: Pattern or decision to remember
- **Output**: Claude memory updated
- **Owner runs**: PM or architect (durable knowledge)

### `/agent-metrics`
Summarize agent dispatch metrics (count, tokens, duration).
- **Input**: Window (optional; defaults to today)
- **Output**: Metrics summary + chart
- **Owner runs**: Whole team (observability)
- **Companion**: PostToolUse:Task log hook

---

## Skill Lifecycle

### `/skill-new <name>`
Create a new skill file and branch.
- **Input**: Skill name (unique in both plugins)
- **Output**: `skill/<name>` branch + `SKILL.md` scaffold
- **Owner runs**: Author
- **Asks**: Which plugin (Standard vs Stockbook overlay)?
- **Next**: Write the SKILL.md content

### `/skill-submit <name>`
Validate + submit a skill for approval.
- **Input**: Completed `SKILL.md`
- **Output**: GitHub PR + Jira ticket + plugin version bumped
- **Owner runs**: Author
- **Mechanics**:
  1. Validate frontmatter (not placeholder)
  2. Run `claude plugin validate`
  3. Bump plugin version in `plugin.json`
  4. Push branch
  5. Create GitHub PR
  6. Create Jira ticket (cross-linked)
- **Next**: `/skill-approve`

### `/skill-approve <pr>`
Review + approve a skill submission.
- **Input**: GitHub PR number
- **Output**: PASS/FAIL report + Jira transition
- **Owner runs**: Maintainer
- **Checklist**:
  - Version bumped
  - Validator clean
  - No name collision
  - Description specific
  - Right plugin
  - No secrets
  - MCP server bundle rebuilt (if server changed)
- **Does NOT merge** — human does that

### `/skill-sync`
Update installed skills from marketplace.
- **Input**: None
- **Output**: Updated skill inventory
- **Owner runs**: Everyone (after new skill merged)
- **Mechanics**:
  1. `marketplace update`
  2. `plugin update` (for each installed plugin)
  3. Verify new skill appears in inventory
  4. Announce restart required
- **Note**: Merged skills don't reach people's machines until they run `/skill-sync` + restart

---

## Project Setup

### `/harness-init`
Bootstrap the harness into a new repo.
- **Input**: Repo root (cd into repo first)
- **Output**: `docs/ai-sdlc/project.yml`, `phases.md`, `integration.md`, `docs/specs/README.md`, `CLAUDE.md` section
- **Owner runs**: Any dev, once per repo
- **Detection**:
  - VCS host (GitHub/GitLab/Bitbucket)
  - Default branch (main/master/develop)
  - Source roots (src/, lib/, app/, etc.)
  - Package manager (npm, yarn, cargo, etc.)
  - CI/CD (GitHub Actions, GitLab CI, Bitbucket Pipelines, etc.)
- **Does NOT overwrite** existing files without `--force`
- **Records** `UNKNOWN` rather than guessing
- **Scaffolds**:
  - `docs/ai-sdlc/` directory
  - `document-conventions.md` (full inline text, not a reference)
  - `check-conventions.py` (mechanical DoD checker)
  - `cookbook.md` (command recipes)
  - `project.yml` (config)
  - Phase specification files

### `project-toolchain` (skill, not a slash command)
Detect and record project toolchain settings. Invoked by other commands, or by name.
- **Input**: Repo structure
- **Output**: `docs/ai-sdlc/project.yml`
- **Detects**: Build system, test framework, linting, deployment, VCS host, CI platform
- **Note**: it is a skill; there is no `/project-toolchain` command

---

## Quick Lookup by Use Case

### "I have a new feature request"
1. `/plan-feature <slug>` → produces traceability + tasks
2. `/idea-card <slug>` → normalize the request
3. `/problem-canvas <slug>` → frame the problem
4. `/market-scan <slug>` → scan the market
5. `/discovery-report <slug>` → synthesize findings
6. `/gate G1 <slug>` → GO/NO-GO decision

### "I need to review code"
→ `/review <file>`

### "I need to review for security"
→ `/security-review <file>`

### "Feature is ready to ship"
1. `/ship-feature <slug>` → full orchestration
   - or manually: `/review`, `/security-review`, `/pr`, then human merge, then `/notify-merge`

### "I need to abort a feature"
→ `/abort <slug>` → clean rollback

### "I'm writing a new skill"
1. `/skill-new <name>` → create branch + scaffold
2. Write the SKILL.md
3. `/skill-submit <name>` → open PR + Jira ticket
4. → maintainer runs `/skill-approve`
5. Human merges
6. Everyone runs `/skill-sync` + restarts

### "I need to see project status"
→ `/status`

### "I need an architecture decision recorded"
→ `/adr <slug>` or `/spec <slug>`

---

## Environment Variables

Set these for MCP tools to work:

```bash
# Atlassian (Confluence + Jira)
export ATLASSIAN_EMAIL=you@example.com
export ATLASSIAN_API_TOKEN=...  # id.atlassian.com/manage-profile/security/api-tokens
export CONFLUENCE_SITE=https://your-site.atlassian.net
export JIRA_SITE=https://your-site.atlassian.net

# GitHub
export GITHUB_TOKEN=...  # PAT with repo scope

# GitLab (if configured)
export GITLAB_TOKEN=...  # PAT with api scope
export GITLAB_SITE=https://your-gitlab.com  # optional, defaults to gitlab.com

# Microsoft Teams (if configured)
export TEAMS_WEBHOOK_URL=...  # Incoming Webhook to target channel
```

Then restart Claude Code.

---

## Links

- **Full Architecture**: [`ARCHITECTURE.md`](../ARCHITECTURE.md)
- **Installation**: [`plugin/README.md`](../../plugin/README.md)
- **Recipes**: [`cookbook.md`](./cookbook.md)
- **Stages**: [`stage-a-discovery.md`](./stage-a-discovery.md) · [`stage-b-definition.md`](./stage-b-definition.md) · [`stage-c-design.md`](./stage-c-design.md)
- **Document Standards**: [`document-conventions.md`](./document-conventions.md)

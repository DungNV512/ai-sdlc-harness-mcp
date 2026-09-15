# AI SDLC Harness — Architecture & Workflow

Complete overview of the system architecture, SDLC flow, agents, plugins, and commands.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code / Claude Desktop                  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  vnd-ai-sdlc Plugin (Framework-Agnostic)                    │ │
│  │                                                              │ │
│  │  • 5 Agents (pm-analyst, architect, px-designer,           │ │
│  │             security, reviewer)                            │ │
│  │  • 29 Commands (Stage A/B/C + delivery + skill cycle)     │ │
│  │  • 2 Skills (threat-modeling, project-toolchain)          │ │
│  │  • 3 Hooks (git integration)                               │ │
│  │  • Bundled MCP Server (self-contained)                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  vnd-ai-sdlc-stockbook Plugin (Flutter Overlay)            │ │
│  │                                                              │ │
│  │  • 3 Agents (flutter-engineer, qa, release)               │ │
│  │  • 10 Commands (scaffold-feature, implement, test, ...)    │ │
│  │  • 30 Flutter/Mobile Skills                                │ │
│  │  • 7 Dart-aware Hooks                                       │ │
│  │  • 0 MCP Servers (uses Standard's bundle)                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│         MCP Server (28 tools across 6 platforms)                │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Confluence│  │  Jira    │  │  GitHub  │  │  GitLab  │       │
│  │ 5 tools  │  │ 12 tools │  │ 4 tools  │  │ 5 tools  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────────────────────────────┐   │
│  │   Teams      │  │   Claude Code Trigger                │   │
│  │  1 tool      │  │   1 tool (run commands in repos)     │   │
│  └──────────────┘  └──────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
           ┌────────┬─────────┼─────────┬────────┐
           ▼        ▼         ▼         ▼        ▼
      Confluence  Jira    GitHub    GitLab   Microsoft
       (Rovo)              (API)     (API)     Teams
```

---

## SDLC Flow: Stages A → B → C → Gate → Delivery

### Stage A: Discovery (A0–A5, Gate G1)

**Owner**: FS 18 PM + FS 20 Architect  
**Input**: A problem statement or business request  
**Output**: Approved G1 go/no-go decision + discovery artifacts

| Phase | Command | Owner | Produces | Saved to |
|---|---|---|---|---|
| A0 | Human intake | Human | Problem statement | Jira ticket |
| A1 | `/idea-card <slug>` | PM | Idea Card | `docs/specs/<slug>/idea-card.md` |
| A2 | `/problem-canvas <slug>` | PM + originator | Problem Canvas | `docs/specs/<slug>/problem-statement-canvas.md` |
| A3 | `/market-scan <slug>` | AI drafts, human verifies figures | Market Scan **and** Feasibility Assessment | `docs/specs/<slug>/` |
| A4 | `/discovery-report <slug>` | pm-analyst agent + review | Discovery Report | `docs/specs/<slug>/discovery-report.md` |
| A5 | `/ipam-way <slug>` | PM + Architect | IPAM Way Canvas | `docs/specs/<slug>/ipam-way.md` |
| A5 | (same command) | PM | OMVP Charter | `docs/specs/<slug>/omvp.md` |
| G1 | `/gate G1 <slug>` | Humans (CEO/C-level) | Gate Decision + Evidence | `docs/specs/<slug>/traceability.yaml` |

**G1 Decision Logic**:
- `GO` → advance to Stage B; requires discovery.ipam_way + discovery.omvp_charter
- `NO-GO` → stop, record reason, close feature branch
- `NEED-DATA` → define 3 required fields, max 1 week, come back to G1

### Stage B: Definition (B0–B2, Gates G2/G3)

**Owner**: FS 18 PM (drives) + FS 20 Architect (co-owns)  
**Input**: G1 GO decision + discovery artifacts  
**Output**: Approved requirements (BRD + PRD) ready for design

| Phase | Command | Owner | Produces | DoD count |
|---|---|---|---|---|
| B0 | `/context-doc <slug>` | PM + Architect (sit together) | Systems & Projects Context | 7 items |
| B1 | `/brd <slug>` | pm-analyst agent + reviewer | Business Requirements Document | 9 items |
| G2a | Human approval | C-level | BRD Status → Approved | 1 part |
| G2b | BRD walkthrough | Architect + PM | Written confirmation | 2nd part (≥60 min) |
| B2 | `/prd <slug>` | pm-analyst agent + reviewer | Product Requirements Document | 11 items |
| G3a | Team review | Dev + QA + Designer + PM | Review feedback | 1 part (1 hour) |
| G3b | Sprint 0 | PM + team | Open questions owned | 2nd part (90 min) |

**G2 Decision**:
- `APPROVED` → both parts complete (C-level sign + architect walkthrough)
- `IN-REVIEW` → one part outstanding
- `BLOCKED` → waiting on legal (regulated domain)

**G3 Decision**:
- `APPROVED` → both meetings held, ≤2 unowned open questions
- `FIX-TOP-3` → approved subject to three named fixes
- `NOT-RIPE` → too many open questions; stage C must not start

### Stage C: Design (C1–C5, Gate G4)

**Owner**: FS 20 Architect (C1) · FS 19 PX (C3) · FS 22 QE (C4) · FS 14 AppSec (C5)  
**Input**: Approved BRD + PRD  
**Output**: Signed-off design set ready for development

| Phase | Command | Owner | Produces | DoD count |
|---|---|---|---|---|
| C1 | `/sa-view <slug>` | architect | Package Design + Integration Design | 2 outputs, confirmed APIs |
| C2 | `/srs <slug>` | architect | Function List + SRS (flat FR-###) | 9 items |
| C3 | `/ui-spec <slug>` | px-designer | Figma frames (stable key) + design tokens | WCAG 2.1 AA |
| C4 | `/test-strategy <slug>` | qa-engineer | Test Strategy (pyramid + thresholds) | Fixed numbers + every AC sketched |
| C5 | `/security-review <slug>` | security | Threat Model (STRIDE per feature) | Risk acceptance signed |
| G4 | `/gate G4 <slug>` | All C owners | Design Sign-off | Per-output + version control on |

**G4 Decision**:
- `SIGNED-OFF` → every output meets DoD, every owner signed
- `DOD-NOT-MET` → at least one output falls short (named)
- `ANOTHER-ROUND` → signed in principle, one more revision agreed

**After G4**: Version control becomes mandatory for all upstream artefacts (BRD, PRD, SRS, etc.)

### The delivery half: Phases 0–8 and gate G5

Specified in full in [`docs/ai-sdlc/delivery-phases.md`](./docs/ai-sdlc/delivery-phases.md),
which also maps the numbered phases onto the lettered stage names
(`P`/`D`/`E`/`F`/`O`) that `gate.md` and `stage-c-design.md` use — and marks
which of those letters are evidenced and which are inferred.

| Phase | Command | Owner | Done when |
|---|---|---|---|
| 0 | generated by `/plan-feature` | intake | Sources named **and dated**; scope written; upstream blocks present or omitted entirely, never `PENDING` |
| 1 | `/plan-feature <slug>` | engineer | Sub-tasks have ids; every open question explicit and owned |
| 2 | `/spec <slug>` | engineer | A failing test can be written from it by someone not in the conversation |
| 3 | `/adr <slug>` (only if architectural) | FS 20 Architect | ≥2 real options compared; the rejected one described well enough to show it was considered |
| 4 | project-specific | FS 2 Client Eng | The project's **own** test command passes; new behaviour has a test that fails without the change |
| 5 | `/review <slug>` | an agent that did **not** write the code | `review-checklist.md` walked; no `block`/`major` unresolved; every finding cites `file:line` |
| 6 | `/security-review <slug>` | FS 14 AppSec | `security-checklist.md` walked; no high residual risk unowned; secrets scanned over the diff **and its history** |
| 7 | `/pr <slug>` | engineer | Template filled; CI green where CI exists, reported missing where it does not |
| 7.5 | — | — | **NOT BUILT**: close the trace, publish the reader copy to Confluence |
| 8 / **G5** | `/gate G5`, then `/notify-merge` | **a human** | `mr_url` + `approved_by` (a named person, never the harness) + `minutes` |

---

## Agents Roster

### Standard (Framework-Agnostic)

| Agent | Triggers | Responsibilities | Uses |
|---|---|---|---|
| **pm-analyst** (FS 18) | `/idea-card`, `/problem-canvas`, `/discovery-report`, `/brd`, `/prd` | Problem framing, market scanning, requirement authoring, conflict detection | Review agents |
| **architect** (FS 20) | `/adr`, `/sa-view`, `/srs`, `/implement` | Design decisions, API contracts, function lists, implementation ordering | All other agents |
| **px-designer** (FS 19) | `/ui-spec` | Wireframing, hi-fi in Figma, interaction specs, design tokens, accessibility | Figma MCP |
| **security** (FS 14) | `/security-review`, `/threat-modeling` | STRIDE threat models, PII audit, compliance checks | Threat-modeling skill |
| **reviewer** | `/review` (diff review), `/skill-approve` | Independent code review, skill submission gate | All agents (checks assumptions) |

### Stockbook-Specific (Flutter Overlay)

| Agent | Triggers | Responsibilities |
|---|---|---|
| **flutter-engineer** | `/scaffold-feature`, `/implement`, `/audit` | Flutter architecture (BLoC, Freezed, Clean Architecture), code generation, module structure |
| **qa** | `/test`, `/audit` | Flutter/Dart testing (unit, widget, golden, integration), test matrix, coverage gates |
| **release** | `/ship-feature` | Fastlane + Play Console + App Store Connect, version bumping, changelog, beta releases |

---

## Commands Reference

### Discovery Phase (Stage A)

| Command | Input | Output | Owner runs |
|---|---|---|---|
| `/idea-card <slug>` | Problem statement | Idea Card doc | PM |
| `/problem-canvas <slug>` | Idea Card | Problem Canvas (1 page) | PM + originator |
| `/market-scan <slug>` | Problem Canvas | Market Scan findings | PM + Architect |
| `/discovery-report <slug>` | All A-phase docs | 5-page report ready for G1 | pm-analyst agent |
| `/ipam-way <slug>` | All above | IPAM Way (Interbeing + Integrity) | PM + Architect |
| `/gate G1 <slug>` | Discovery complete | GO/NO-GO/NEED-DATA | C-level |

### Definition Phase (Stage B)

| Command | Input | Output | Owner runs |
|---|---|---|---|
| `/context-doc <slug>` | G1 GO + org knowledge | Systems & Projects Context | PM + Architect |
| `/brd <slug>` | Context + discovery | BR/DR/SR/IR rules, contradictions checked | pm-analyst agent |
| `/gate G2 <slug>` | BRD complete | Approved status + architect walkthrough | C-level + Architect |
| `/prd <slug>` | BRD + user research | Feature list, personas, two-way trace | pm-analyst agent |
| `/gate G3 <slug>` | PRD complete | APPROVED / FIX-TOP-3 / NOT-RIPE | PM + team |

### Design Phase (Stage C)

| Command | Input | Output | Owner runs |
|---|---|---|---|
| `/sa-view <slug>` | BRD | Package Design + API contracts | architect |
| `/srs <slug>` | BRD + PRD + C1 | Function List + flat FR-### SRS | architect |
| `/ui-spec <slug>` | PRD personas + SRS | Figma frames (stable key) + tokens | px-designer |
| `/test-strategy <slug>` | PRD + SRS | Pyramid, coverage, per-AC test sketch | qa-engineer |
| `/threat-modeling <slug>` | C1 + C2 | STRIDE threat model + risk matrix | security |
| `/gate G4 <slug>` | All C outputs | SIGNED-OFF / DOD-NOT-MET / ANOTHER-ROUND | All C owners |

### Delivery Commands (Any Stage)

| Command | What | Audience |
|---|---|---|
| `/plan-feature <slug>` | Create traceability.yaml + sub-tasks | Whole team |
| `/spec <slug>` | Narrow a feature: ADR + refined requirements | Dev team |
| `/adr <slug>` | Open a new Architecture Decision Record | architect |
| `/pr <vcs>` | Create a PR/MR using repo's VCS setting | Dev team |
| `/review <file>` | Independent code review of a diff | reviewer agent |
| `/security-review <file>` | Security review of code changes | security agent |
| `/ship-feature <slug>` | Orchestrate: lint + test + merge + announce | Whole team |
| `/abort <slug>` | Clean abort of in-flight feature | Whole team |
| `/status` | Project status + unfinished phases | Whole team |
| `/notify-merge` | Announce merged PR to Teams | Post-merge |

### Skill Lifecycle Commands

| Command | Owner | What |
|---|---|---|
| `/skill-new <name>` | Author | Create skill branch + scaffold SKILL.md |
| `/skill-submit <name>` | Author | Validate + bump version + open PR + Jira ticket |
| `/skill-approve <pr>` | Maintainer | Mechanics + content check, PASS/FAIL |
| `/skill-sync` | Everyone | `marketplace update` + `plugin update` + verify |

### Project Setup

| Command | When | What |
|---|---|---|
| `/harness-init` | Once per repo | Scaffold all config + docs + phase files |
| `/project-toolchain` | Initial setup | Detect VCS, source roots, defaults, write config |

---

## Plugins Structure

### vnd-ai-sdlc (Standard, Framework-Agnostic)

**Install anywhere** — no framework assumptions

```
plugin/vnd-ai-sdlc/
├── .claude-plugin/plugin.json          # name, version, author
├── agents/
│   ├── pm-analyst.md
│   ├── architect.md
│   ├── px-designer.md
│   ├── security.md
│   └── reviewer.md
├── commands/                           # 10 commands
│   ├── plan-feature.md
│   ├── spec.md
│   ├── adr.md
│   ├── review.md
│   ├── security-review.md
│   ├── abort.md
│   ├── agent-metrics.md
│   ├── pr.md                           # genericized: github|gitlab
│   ├── status.md
│   └── update-memory.md
├── skills/
│   └── threat-modeling.md              # 1 cross-cutting skill
├── hooks.json
├── hooks/
│   ├── branch-watch.py
│   ├── install.sh
│   └── log-agent-usage.sh
├── .mcp.json                           # points to MCP server
└── mcp-server/
    └── index.mjs                       # self-contained bundle
```

**MCP Tools** (28 total):
- Confluence: 5 · Jira: 12 · GitHub: 4
- GitLab: 5 · Teams: 1 · Claude Code trigger: 1

### vnd-ai-sdlc-stockbook (Overlay, Flutter-Specific)

**Requires Standard** — adds Flutter/BLoC/Fastlane specifics

```
plugin/vnd-ai-sdlc-stockbook/
├── .claude-plugin/plugin.json
├── agents/                             # 3 agents
│   ├── flutter-engineer.md
│   ├── qa.md
│   └── release.md
├── commands/                           # 10 commands
│   ├── scaffold-feature.md
│   ├── implement.md
│   ├── test.md
│   ├── lint.md
│   ├── audit.md
│   ├── api-from-openapi.md
│   ├── i18n.md
│   ├── learn-from-review.md
│   ├── ship-feature.md                 # orchestrator
│   └── pr.md                           # glab override
├── skills/                             # 27 Flutter/mobile skills
│   ├── bloc-pattern.md
│   ├── clean-architecture.md
│   ├── golden-tests.md
│   ├── mobile-security.md
│   ├── responsive-layout.md
│   ├── secure-storage.md
│   └── ... (21 more)
├── hooks.json
└── hooks/                              # 7 Dart-aware hooks
    ├── require-test.sh
    ├── pre-push.sh
    ├── block-generated.sh
    ├── format-dart.sh
    ├── pre-commit.sh
    ├── _parse_payload.sh
    └── _self_test.sh
```

**MCP Tools**: 0 (uses Standard's bundle)

---

## Installation & Setup

### Quick Start

```bash
# 1. Add marketplace (local dev path or GitHub URL)
claude plugin marketplace add /path/to/ai-sdlc-harness-mcp/plugin

# 2. Install Standard plugin
claude plugin install vnd-ai-sdlc

# 3. (Optional) Install Flutter overlay
claude plugin install vnd-ai-sdlc-stockbook

# 4. Bootstrap the harness into your repo (once)
/harness-init

# 5. Set environment variables for MCP tools
export ATLASSIAN_EMAIL=...
export ATLASSIAN_API_TOKEN=...
export CONFLUENCE_SITE=...
export JIRA_SITE=...
export GITHUB_TOKEN=...

# 6. Restart Claude Code session
```

### Development Setup

```bash
# Work on the MCP server itself
git clone https://github.com/DungNV512/ai-sdlc-harness-mcp.git
cd ai-sdlc-harness-mcp/mcp-server
npm install && npm run build
export AI_SDLC_HARNESS_MCP_SERVER_DIR=$PWD

# Edit, build, restart session — no re-bundling needed
npm run build
# ... restart Claude Code ...
```

---

## Document Standards (C-0 through C-10)

Every phase artifact inherits these conventions:

| Rule | What | Applied to |
|---|---|---|
| **C-0** | Source precedence: Stockbook's form wins when 2 docs conflict | All decisions |
| **C-1** | Identity block: Version, Status, Owner, Date, Sources | All phase artefacts |
| **C-2** | Version history: table, per-change row (gate-signed only) | After G2/G3/G4 |
| **C-3** | Permanent ids: BR-001, F-012, AC-034, etc. (never reuse) | BRD, PRD, SRS |
| **C-4** | Explicit absence: `Không có` not blank | All tables |
| **C-5** | Unconfirmed markers: `[ước tính]`, `[unverified]` | Numbers + claims |
| **C-6** | Decision references: link to ADR or gate record | Rationale sections |
| **C-7** | Mapping tables: trace up to artefact above | BRD→PRD, PRD→SRS |
| **C-8** | Inline mermaid: no external links | Flows + architecture |
| **C-9** | Numeric NFRs: number + measurement + business goal | All non-functionals |
| **C-10** | Real data: use actual VCS branches, ticket numbers, role names | Examples + templates |

**Checker**: `python3 docs/ai-sdlc/check-conventions.py` (exit 1 on failure)

---

## Known Limitations

1. **Headless mode**: MCP server doesn't auto-activate in `claude -p` mode (interactive mode works). Workaround: `--mcp-config`.
2. **Egress-blocked platforms**: GitLab, Confluence, Teams tools built + unit-tested but never live-called from this environment (network restrictions). Verify before production use.
3. **Stage A3**: Market scan + feasibility assessment specified but run by hand; no AI command yet.
4. **Stages D–P**: Implementation, testing, merge automation not yet specified (roadmap).
5. **Confluence auto-publish**: Artefacts stored in `traceability.yaml`, not auto-published to Confluence (only `/gate` publishes).

---

## What's Next

- [ ] **Real feature run**: A1–G4 through stages A/B/C with a real product requirement
- [ ] **Stages D–P**: Define implementation, testing, merge, and release orchestration
- [ ] **Auto-publish**: Artefacts → Confluence on `/gate` completion
- [ ] **Teams notifications**: Real webhook setup + live call verification
- [ ] **GitLab full parity**: Verify all 5 tools against real GitLab instance

---

## Links

- **Install & Setup**: [`plugin/README.md`](./plugin/README.md)
- **Command Recipes**: [`docs/ai-sdlc/cookbook.md`](./docs/ai-sdlc/cookbook.md)
- **Stage Specs**: [`docs/ai-sdlc/stage-a-discovery.md`](./docs/ai-sdlc/stage-a-discovery.md) · [`stage-b-definition.md`](./docs/ai-sdlc/stage-b-definition.md) · [`stage-c-design.md`](./docs/ai-sdlc/stage-c-design.md)
- **Document Standards**: [`docs/ai-sdlc/document-conventions.md`](./docs/ai-sdlc/document-conventions.md)
- **MCP Tools Reference**: [`mcp-server/README.md`](./mcp-server/README.md)

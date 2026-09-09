---
description: Comprehensive read-only compliance audit. Architecture + clean-code + security + a11y + i18n + tests, dispatched in parallel, synthesized into a single P0/P1/P2 report.
argument-hint: "[--scope=full|architecture|clean-code|security|a11y|i18n|tests] [--max-agents=N] [--write]"
allowed-tools: Read, Glob, Grep, Bash, Write, Task
---

<!-- : --max-agents caps parallel dispatch so
     `/audit --scope=full` (7 agents on Opus) doesn't produce a
     surprise cost. Default 4; set 1 for serial; set higher only when
     you've budgeted for it. Per-agent timeout 10 min hard cap. -->


# /audit $ARGUMENTS

Read-only multi-dimension audit of the entire repo. Default: full audit
(7 dimensions). Use `--scope=X` to focus. Use `--write` to write the
generated report. Findings are not auto-fixed or auto-converted into tasks.

## Pre-flight

1. Read context (mandatory before any agent dispatch):
   - `CLAUDE.md`
   - `docs/architecture/00-overview.md` (capability + bounded contexts)
   - `docs/architecture/11-traceability.md` (FR → component matrix)
   - `docs/ai-sdlc/coding-standards.md`
   - `docs/ai-sdlc/review-checklist.md`
   - `docs/ai-sdlc/definition-of-done.md`
   - `docs/design-system/mobile-first.md`
2. Resolve `--scope`:
   - `full` (default) — all 7 agents
   - `architecture` — architect only
   - `clean-code` — flutter-engineer + reviewer
   - `security` — security only
   - `a11y` — flutter-engineer (a11y dimension only)
   - `i18n` — flutter-engineer (i18n dimension only)
   - `tests` — qa only
3. Create `docs/specs/audit-<YYYY-MM-DD>/` (use today's date).

## Dispatch (parallel)

For each in-scope dimension, dispatch the corresponding subagent in
parallel via the Task tool. Every agent prompt MUST include:

```
You are doing a READ-ONLY <dimension> compliance audit. Do NOT change
any file. Cite file:line for every finding. Output P0/P1/P2 severities
with one-line fix suggestions. Cap report at 1500 words. Quote ≤15
words from any external source per copyright rules.
```

### Architecture (`architect` agent)

Verify `lib/` matches `docs/architecture/`:

- Every FR-001..FR-050 in `11-traceability.md` maps to a real file (or
  is documented as sprint-deferred).
- Bounded contexts in `00-overview.md` match feature folders in
  `modules/*/lib/src/`.
- Domain layer imports no Flutter / Dio / Freezed UI types.
- Cross-feature imports only via module barrels and app-shell boundaries
  (per `coding-standards.md §3`).
- Per-feature folder layout matches the contract: `data/{dto,datasource,repository_impl}/`, `domain/{entity,repository,usecase,failure.dart}/`, `presentation/{bloc,widgets,pages}/`.
- For each P0: cite the architecture doc § + the offending file:line.

### Clean code (`flutter-engineer` + `reviewer` agents — two parallel agents)

Audit dimensions:

- A. Naming (`coding-standards.md §2`).
- B. `const`-correctness (§1).
- C. BLoC patterns — Freezed states with status enum; events past-tense;
  side-effects via `Stream<Effect>`; optimistic updates with rollback (§4).
- D. Error handling — sealed `Result<F, T>`; no `dartz`; no throws across
  boundaries; no `print()` (§5).
- E. Network — one shared `Dio`; three interceptors (Auth/Logging/Connectivity);
  no ad-hoc `Dio()` (§6).
- F. Storage — tokens only in `flutter_secure_storage` (§7).
- G. i18n — all strings via slang `t.X.y`; no hard-coded user-facing strings (§8).
- H. Codegen freshness — `*.g.dart`, `*.freezed.dart`, `*.config.dart`, `i18n.g.dart` align with source.
- I. Imports — `package:stockbook/...` only; no orphan imports to deleted files (§3).
- J. Public API docs — every public class/method has `///`.
- K. TODO hygiene — ticket ID required.
- L. Anti-patterns — `getIt<>` in build; `setState` on large subtrees; raw `Scaffold`; FAB on Compact; inline `EdgeInsets`/`Color` literals; touch targets < 48 dp.

### Security (`security` agent)

STRIDE per touched module:

- Token handling (only `flutter_secure_storage`; never logged).
- PII in logs / analytics / stack traces.
- Deep-link route guards.
- Network stack — TLS pinning when on; auth interceptor present;
  ATS / network-security-config baseline.
- KYC pipeline retention SLA (30 d post-decision).
- Biometric step-up on sensitive ops.

### Tests (`qa` agent)

- Per-feature: list every public `.dart` in `modules/*/lib/src/` without a
  matching module test counterpart.
- List every `Bloc` without a `bloc_test`.
- List every public domain API without a unit test.
- Find golden tests with stale snapshots (compare current `ThemeData`
  to the time the golden was recorded — flag any difference).
- Report coverage gap per feature.

### A11y (`flutter-engineer` agent, a11y-only)

- Every interactive widget has a `Semantics` label
  (`coding-standards.md §11`).
- Tap targets ≥ 48 dp (Material) / 44 dp (HIG).
- `textScaler` 1.5x renders without overflow on smallest device
  (iPhone SE 3 / 375 dp).
- Color contrast ≥ 4.5:1 verified via design-system tokens.
- `Semantics(button: true, label: ...)` on every `IconButton`.

### i18n (`flutter-engineer` — i18n dimension)

- Every key present in one locale JSON under `lib/i18n/` has a peer in
  every other locale JSON (identical key sets across all locales).
- No hard-coded user-facing strings in `lib/` widgets that bypass
  slang's `t.X.y` accessor.
- Dates and numbers use `intl` with the appropriate locale.
- ICU plurals used where appropriate.

## Synthesis

After all agents return, write the merged report to
`docs/specs/audit-<date>/report.md` with this structure:

```
# Compliance Audit — <date>

## Headline
- P0 (blocks release): N
- P1 (degrades quality): N
- P2 (nice-to-have): N
- Total files scanned: N

## P0 — must fix before merging
- <file:line> — description. Standards § cited. Suggested fix.

## P1 — fix before release
- ...

## P2 — fix when convenient
- ...

## Per-dimension scorecard
| Dimension | Pass rate | Worst offenders |
|---|---|---|
| ... | ... | ... |

## Top 5 systemic patterns to fix
1. ...

## How to consume this report
- P0 blocks the MR until fixed or explicitly accepted by a human owner.
- P1 should become a linked fix task before release, unless explicitly
  deferred.
- P2 can sit in the backlog with an owner and status.
- For each finding, record a stable finding ID, severity, evidence, status, and
  `fix_task` when a separate task/issue is created.
- Link the report and finding-to-fix mapping from the feature's
  `traceability.yaml`; do not duplicate or overwrite the original product
  task's generator-owned sections.
```

If `--write` was passed:

1. `git checkout -b audit/<date>`
2. `git add docs/specs/audit-<date>/report.md`
3. `git commit -m "audit: <date> read-only compliance report"`

Stop. Do not fix anything — that's a separate PR (use `/ship-feature
audit-fixes-<date>` or invoke `flutter-engineer` agent with the report
as input).

## Anti-patterns to refuse

- Making any code change. This command is strictly read-only.
- Auto-merging the audit branch. Always halt at human gate.
- Citing findings without `file:line` evidence — the agents must back
  every claim.
- Quoting more than 15 words from any external source.

## Exit message template

```
✓ Audit <date> complete.
   Scope: <full|architecture|clean-code|...>
   Findings: <N> P0, <N> P1, <N> P2 across <N> files.
   Report: docs/specs/audit-<date>/report.md
   Branch: audit/<date> (if --write)
   Next:
      - Create/link fix tasks for confirmed findings, then fix with:
        /ship-feature audit-fixes-<date>
     - Or invoke flutter-engineer agent with the report as input.
```

## References

- Existing commands that this one composes: `/review`, `/security-review`,
  `/test`, `/lint`.
- Existing agents: `architect`, `flutter-engineer`, `reviewer`, `qa`,
  `security`, `release`.
- Existing skills (auto-trigger on keywords): `mobile-accessibility`,
  `mobile-security`, `mobile-performance`, `responsive-layout`,
  `clean-architecture`, `bloc-pattern`, `secure-storage`,
  `threat-modeling`.

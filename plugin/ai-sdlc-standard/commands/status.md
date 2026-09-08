---
description: Quick status — current model pin, session token totals so far, last subagent dispatch, hook health.
argument-hint: [--verbose]
allowed-tools: Read, Bash
---

# /status $ARGUMENTS

A one-shot snapshot of the AI loop's current state. Designed to answer
the question "what model is running right now and how much have I spent
this session?" without having to dig through logs.

Per the user's runtime-monitoring ask (2026-06-11).

## Output shape

```
Stockbook — AI session status
=============================

Model pin:           claude-opus-4-7
Settings source:     .claude/settings.json
Session ID:          <CLAUDE_SESSION_ID>
Started:             2026-06-11T09:14:02Z (1h 23m ago)

Last 5 dispatches (.claude/.metrics/agent-usage.jsonl):
  09:42:11Z  <subagent>          OK    21,400 → 4,802 tokens   18.2s
  09:39:55Z  reviewer            OK     8,910 → 1,201 tokens    9.7s
  ...

Session totals:
  Dispatches:        12
  Tokens in:        144,082
  Tokens out:        21,019
  Failed:             1 (8%)

Hook health:
  log-agent-usage.sh   wired   (PostToolUse:Task)
  <overlay hooks, if any overlay plugin is installed, listed here>

Self-test (if .claude/hooks/_self_test.sh exists): 15/15 passing
```

## Implementation steps

1. **Resolve the model pin.**
   ```bash
   jq -r '.model // "inherit"' .claude/settings.json
   ```
   If `inherit`, also read `~/.claude.json` for the per-user pin.
2. **Show the session ID** from `$CLAUDE_SESSION_ID` (or
   `$CLAUDE_CODE_SESSION_ID` — Claude Code emits one of these).
3. **Compute session start** = the earliest `ts` in
   `.claude/.metrics/agent-usage.jsonl` whose `session_id` matches.
4. **Render last N dispatches** (default 5; `--verbose` → 20).
5. **Compute session totals** via `jq -s` over the matching records.
6. **Verify hooks** by parsing `.claude/settings.json` and checking
   each referenced script exists + is executable.
7. **Run the self-test if present** — `.claude/hooks/_self_test.sh` is
   shipped by some overlay plugins, not by Standard alone. If it exists,
   run it and render the pass/fail summary; otherwise omit that section.

## Pre-flight

- If the metrics log doesn't exist yet, print "no dispatches in this
  session" and skip the totals — but still render the model pin and
  hook health.

## Refuse if

- Run outside a repo with `.claude/`. Print "this command must be run
  in a project root with a `.claude/` config".

## See also

- `.claude/commands/agent-metrics.md` — multi-day rollups + by-subagent
  breakdown.
- `.claude/hooks/log-agent-usage.sh` — the producer of the data.
- 
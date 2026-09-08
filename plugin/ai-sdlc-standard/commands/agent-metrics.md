---
description: Summarize agent dispatch metrics (count, tokens, duration) over a window. Companion to the PostToolUse:Task log hook.
argument-hint: [--since=<7d|today|all>] [--by=subagent|model|day] [--out=summary.md]
allowed-tools: Read, Bash, Write
---

# /agent-metrics $ARGUMENTS

Read the local `.claude/.metrics/agent-usage.jsonl` log (populated
by the `PostToolUse:Task` hook) and emit a summary — dispatch
counts, token totals per subagent/model, average duration, fail
rate. Local file, no network, no cross-machine aggregation.

## Pre-flight

1. Confirm the log exists:
   ```bash
   test -f .claude/.metrics/agent-usage.jsonl
   ```
2. Confirm `jq` is on PATH (the hook writes JSON; the summary reads it).
3. Resolve `--since` window:
   - `today` → midnight UTC of today.
   - `7d` (default) → 7 × 24h ago.
   - `30d` → 30 × 24h ago.
   - `all` → no filter.

## Phase 1 — filter

Resolve `$since` to an ISO-8601 UTC cutoff. Uses Python so the
command works on both macOS (BSD `date`, no `-d` flag) and Linux
(GNU `date`) without branching:

```bash
since_iso="$(python3 - <<PY
from datetime import datetime, timedelta, timezone
import re, sys
s = "$since"
now = datetime.now(timezone.utc)
if s == "today":
    cutoff = now.replace(hour=0, minute=0, second=0, microsecond=0)
elif s == "all":
    cutoff = datetime(1970, 1, 1, tzinfo=timezone.utc)
elif m := re.fullmatch(r"(\d+)d", s):
    cutoff = now - timedelta(days=int(m.group(1)))
elif m := re.fullmatch(r"(\d+)h", s):
    cutoff = now - timedelta(hours=int(m.group(1)))
else:
    print(f"Unrecognised --since={s!r}. Expected: today|Nd|Nh|all.",
          file=sys.stderr)
    sys.exit(2)
print(cutoff.strftime("%Y-%m-%dT%H:%M:%SZ"))
PY
)"

jq -c --arg s "$since_iso" 'select(.ts >= $s)' \
  .claude/.metrics/agent-usage.jsonl > /tmp/agent.filtered
```

## Phase 2 — aggregate

```bash
jq -s '
  {
    total_invocations: length,
    failed:            map(select(.ok == false)) | length,
    tokens_in_total:   map(.tokens_in // 0) | add,
    tokens_out_total:  map(.tokens_out // 0) | add,
    avg_duration_ms:   ([.[] | select(.duration_ms != null) | .duration_ms] | add)
                       / ([.[] | select(.duration_ms != null)] | length),
    by_subagent:
      group_by(.subagent)
      | map({
          subagent:   (.[0].subagent // "<inline>"),
          n:          length,
          tokens_in:  map(.tokens_in // 0) | add,
          tokens_out: map(.tokens_out // 0) | add,
          fail_rate:  ([.[] | select(.ok == false)] | length) / length
        })
      | sort_by(-.tokens_out),
    by_model:
      group_by(.model)
      | map({model: .[0].model, n: length, tokens_out: map(.tokens_out // 0) | add})
  }
' /tmp/agent.filtered
```

## Phase 3 — render

Format as a small markdown table:

```
# Agent metrics — last <since>

- Total dispatches:    <N>
- Failed:              <N> (<pct>%)
- Tokens in / out:     <in> / <out>
- Avg duration:        <ms> ms
- Pinned model:        <from settings.json>

## By subagent

| Subagent          | N  | Tokens out | Fail % |
| ----------------- | -- | ---------- | ------ |
| <subagent-name>   | 12 | 84 012     | 0%     |
...
```

When `--out=<file>` is set, write that markdown to the file. Otherwise
print to chat.

## What this surfaces

- Whether one subagent dominates token cost (in a Flutter project,
  often the implementation-heavy agent, e.g. Stockbook's
  `flutter-engineer`; consider tiering it to Sonnet by editing the
  agent's `model:` frontmatter).
- Whether `failed` rate is creeping up (prompt drift after a model
  bump).
- Whether `/audit --scope=full` is busting weekly cost expectations.

## Refuse if

- The log is empty. Tell the user to run a `/ship-feature` first so
  there's something to summarize.
- `jq` is missing. Print the install command.

## See also

- `.claude/hooks/log-agent-usage.sh` — the producer.
- `.claude/commands/status.md` — live "what's running right now" view.

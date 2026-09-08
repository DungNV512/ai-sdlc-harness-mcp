#!/usr/bin/env bash
# PostToolUse hook fired after every Task tool call (sub-agent dispatch).
# Appends one JSONL record per invocation to .claude/.metrics/agent-usage.jsonl.
#
# Record schema:
#   {
#     "ts":           "<ISO-8601 UTC>",
#     "session_id":   "<derived from CLAUDE_SESSION_ID env or 'unknown'>",
#     "tool":         "Task",
#     "subagent":     "<value of .tool_input.subagent_type>",
#     "description":  "<short, .tool_input.description — truncated to 96 chars>",
#     "model":        "<settings.json model pin>",
#     "tokens_in":    <int|null>,
#     "tokens_out":   <int|null>,
#     "duration_ms":  <int|null>,
#     "ok":           true|false
#   }
#
# Rewritten 2026-07-30:
# - Single jq invocation per hook fire (was ~14 subprocesses across
#   jq/python/printf spawns; O(sub-agent × 300-800ms cold-start)).
# - Fail-fast when jq is absent — the python fallback introduced
#   shell-interpolation risk and was never exercised on dev boxes.
# - Description truncated to 96 chars server-side to bound PII drift
#   and keep the JSONL grep-friendly.
# - Weekly rotation: files older than 8 days get renamed with an
#   .archived-<yyyy-ww> suffix on hook fire (cheap, no cron needed).
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "log-agent-usage: jq not on PATH; skipping usage log." >&2
  exit 0
fi

script_dir="$(dirname "$0")"
metrics_dir="$script_dir/../.metrics"
out="$metrics_dir/agent-usage.jsonl"
mkdir -p "$metrics_dir"

payload="$(cat -)"

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
session_id="${CLAUDE_SESSION_ID:-${CLAUDE_CODE_SESSION_ID:-unknown}}"

# Resolve model from settings.json (project). Defaults to "inherit"
# when neither is pinned.
model="inherit"
if [[ -f "$script_dir/../settings.json" ]]; then
  pinned="$(jq -r '.model // empty' "$script_dir/../settings.json" 2>/dev/null || echo "")"
  [[ -n "$pinned" ]] && model="$pinned"
fi

# Weekly rotation: if the log's mtime is > 8 days old, archive it and
# start fresh. Zero-cost when the file is young.
if [[ -f "$out" ]]; then
  now="$(date +%s)"
  mtime="$(stat -f %m "$out" 2>/dev/null || stat -c %Y "$out" 2>/dev/null || echo "$now")"
  age_days=$(( (now - mtime) / 86400 ))
  if (( age_days > 8 )); then
    week_tag="$(date -u +%Y-W%V)"
    mv "$out" "$out.archived-$week_tag"
  fi
fi

# Build the record in ONE jq call. Reads the payload as JSON, pulls
# each field, truncates description, adds env-derived + timestamp
# fields, and emits compact JSON.
printf '%s' "$payload" \
  | jq -c \
      --arg ts "$ts" \
      --arg sid "$session_id" \
      --arg model "$model" \
      '{
        ts: $ts,
        session_id: $sid,
        tool: .tool_name,
        subagent: .tool_input.subagent_type,
        description: (.tool_input.description // "" | .[0:96]),
        model: $model,
        tokens_in: (.tool_response.usage.input_tokens // null),
        tokens_out: (.tool_response.usage.output_tokens // null),
        duration_ms: (.tool_response.duration_ms // null),
        ok: ((.tool_response.is_error // false) | not)
      }' \
  >> "$out"

exit 0

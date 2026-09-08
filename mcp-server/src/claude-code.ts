/**
 * Claude Code trigger tool -- spawns a real `claude` CLI process to run a
 * headless (non-interactive) command against a target repo checkout.
 *
 * This is the "b" half of the user's decision that "Claude Code
 * integration" means both: (a) the plugin's .mcp.json auto-wires this
 * server in on install, and (b) a dedicated tool that can trigger a
 * Claude Code run from *outside* the editor (e.g. from a Teams message or
 * a CI job).
 *
 * Flags verified against the official docs (code.claude.com/docs/en/headless,
 * code.claude.com/docs/en/cli-reference), fetched directly during planning --
 * NOT guessed, and NOT taken from this sandbox's `claude` binary, which is a
 * restricted stub (`only claude -p "<prompt>" is supported in this
 * environment`), not a real install:
 *
 *   - `claude -p "<prompt>" --output-format json` is the non-interactive
 *     invocation. `--output-format json` returns a parseable
 *     {result, session_id, total_cost_usd, ...} payload, unlike default
 *     `text` output.
 *   - There is NO `--cwd` flag. The target repo is selected by the
 *     process's actual working directory -- so this sets `cwd` on
 *     child_process.spawn, not a CLI arg.
 *   - Deliberately does NOT default to `--bare`. Bare mode skips discovery
 *     of hooks, skills, custom commands, subagents, plugins, MCP servers,
 *     auto memory, and CLAUDE.md -- exactly the AI-SDLC harness machinery
 *     this whole repo exists to make installable and triggerable. Defaulting
 *     it on would silently run the prompt with none of that loaded: a
 *     correctness bug, not a style choice. It's exposed as an opt-in `bare`
 *     input instead, off by default.
 *   - `--allowedTools` / `--permission-mode` are required for anything
 *     non-interactive to avoid hanging on a permission prompt with nobody to
 *     answer it. Exposed as caller-supplied inputs rather than a hardcoded
 *     policy, since the right one depends on what the caller trusts the
 *     triggered command to do (e.g. `/status` needs almost nothing;
 *     `/ship-feature` needs a lot).
 *   - Exit codes: 0 success, non-zero failure, 143 if SIGTERM'd mid-run.
 *     Surfaced as `exitCode` in the result rather than throwing on non-zero,
 *     so a caller can distinguish "Claude Code ran and reported a failure
 *     result" from "the process itself never completed."
 *
 * Execution environment note (see mcp-server/README.md): this tool needs a
 * real `claude` CLI on PATH and a writable checkout at `cwd`. That means it
 * only makes sense configured on a machine that already has both -- it does
 * NOT run inside the cloud container this server was developed in, which
 * has no `claude` CLI and no persistent repo checkout.
 */

import { spawn } from "node:child_process";

export interface RunClaudeCodeCommandInput {
  cwd: string;
  prompt: string;
  outputFormat?: "text" | "json";
  allowedTools?: string[];
  permissionMode?: string;
  bare?: boolean;
  continueSession?: boolean;
  resumeSessionId?: string;
}

export interface RunClaudeCodeCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function buildArgs(input: RunClaudeCodeCommandInput): string[] {
  const args: string[] = ["-p", input.prompt, "--output-format", input.outputFormat ?? "json"];

  if (input.allowedTools && input.allowedTools.length > 0) {
    args.push("--allowedTools", ...input.allowedTools);
  }
  if (input.permissionMode) {
    args.push("--permission-mode", input.permissionMode);
  }
  if (input.bare) {
    args.push("--bare");
  }
  if (input.continueSession) {
    args.push("--continue");
  }
  if (input.resumeSessionId) {
    args.push("--resume", input.resumeSessionId);
  }

  return args;
}

/**
 * Spawns `claude` with `cwd` set to the target repo checkout. Never rejects
 * on a non-zero exit code -- that is a legitimate "Claude Code ran and
 * failed" result the caller should see, not a thrown MCP tool error masking
 * the actual stdout/stderr. Only rejects if the process itself could not be
 * spawned at all (e.g. `claude` not found on PATH).
 */
export function runClaudeCodeCommand(
  input: RunClaudeCodeCommandInput
): Promise<RunClaudeCodeCommandResult> {
  return new Promise((resolve, reject) => {
    const args = buildArgs(input);
    const child = spawn("claude", args, { cwd: input.cwd });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to spawn 'claude': ${err.message}. Is Claude Code installed and on PATH?`));
    });

    child.on("close", (code, signal) => {
      // A SIGTERM'd run surfaces as exit code 143, matching the documented
      // behavior, rather than as a null/undefined code.
      const exitCode = code ?? (signal === "SIGTERM" ? 143 : -1);
      resolve({ exitCode, stdout, stderr });
    });
  });
}

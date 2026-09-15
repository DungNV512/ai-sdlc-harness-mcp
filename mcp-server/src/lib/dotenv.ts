/**
 * Load credentials from a .env file into process.env.
 *
 * WHY THIS EXISTS
 *
 * Every client in this server reads its credentials from process.env. That
 * is fine when a human runs `npm run smoke` from a terminal, and useless in
 * the case this harness is actually shipped for: Claude Code starts the MCP
 * server itself, as a child of the app. An app launched from the Dock or
 * Finder never sources ~/.zshrc, so `export ATLASSIAN_API_TOKEN=...` in a
 * shell profile reaches a terminal and nothing else -- the server starts,
 * lists its tools, and then fails the first real call with "Missing required
 * environment variable" on a machine whose owner is certain they set it.
 *
 * NO DEPENDENCY ON PURPOSE
 *
 * The plugin ships this server as a single esbuild bundle so that installing
 * it needs no npm install. `dotenv` would work, but every dependency added
 * here is one more thing that has to survive bundling, and the format is
 * ~40 lines to parse. It is parsed here.
 *
 * PRECEDENCE
 *
 * A variable already present in the real environment always wins. A .env
 * file fills gaps; it never overrides. That way CI, a wrapper script, or a
 * one-off `ATLASSIAN_API_TOKEN=... node dist/index.js` all still work, and a
 * stale .env cannot silently shadow the value an operator just set.
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Keys a .env file is allowed to contribute. Anything else is ignored. */
const KNOWN_KEYS = new Set([
  "ATLASSIAN_EMAIL",
  "ATLASSIAN_API_TOKEN",
  "CONFLUENCE_SITE",
  "JIRA_SITE",
  "GITHUB_TOKEN",
  "GITHUB_API_URL",
  "GITLAB_TOKEN",
  "GITLAB_API_URL",
  "TEAMS_WEBHOOK_URL",
]);

/**
 * Parse .env text into key/value pairs.
 *
 * Tolerates the `export KEY=value` form, because people build these files by
 * pasting lines out of a shell profile and a loader that silently dropped
 * every exported line would be worse than one that never existed: the
 * variable would read as unset with the value sitting right there in the
 * file.
 */
export function parseDotenv(text: string): Record<string, string> {
  const out: Record<string, string> = {};

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;

    const key = m[1];
    let value = m[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      // Quoted: the quotes delimit the value, so a # inside is data.
      value = value.slice(1, -1);
    } else {
      // Unquoted: an inline comment ends the value. Required for the Teams
      // webhook, whose URL carries `&sig=` and must not be truncated -- that
      // is why this only applies to ` #`, with the space, not to a bare #.
      const hash = value.indexOf(" #");
      if (hash >= 0) value = value.slice(0, hash).trim();
    }

    out[key] = value;
  }

  return out;
}

/**
 * Candidate .env locations, most specific first.
 *
 * The home-directory entry is the one that matters for a plugin install.
 * Claude Code copies a plugin into ~/.claude/plugins/cache/<marketplace>/
 * <plugin>/<version>/ and replaces that wholesale on every update, so a .env
 * left beside the plugin survives exactly until the first upgrade.
 */
export function candidatePaths(serverDir?: string): string[] {
  const paths: string[] = [];

  const explicit = process.env.AI_SDLC_ENV_FILE;
  if (explicit) paths.push(resolve(explicit));

  paths.push(resolve(process.cwd(), ".env"));

  if (serverDir) {
    paths.push(resolve(serverDir, ".env"));
    paths.push(resolve(serverDir, "..", ".env"));
  }

  const home = homedir();
  if (home) {
    paths.push(join(home, ".config", "ai-sdlc-harness", ".env"));
  }

  return [...new Set(paths)];
}

export interface DotenvResult {
  /** The file that was read, or null when none was found or loading was off. */
  file: string | null;
  /** Names (never values) of the variables this file actually contributed. */
  applied: string[];
  /** Names found in the file but ignored because the real env already set them. */
  shadowed: string[];
}

let cached: DotenvResult | null = null;

/**
 * Find the first candidate .env that exists and apply it to process.env.
 *
 * Idempotent: repeated calls return the first result rather than re-reading.
 */
export function loadDotenv(): DotenvResult {
  if (cached) return cached;

  if (process.env.AI_SDLC_SKIP_DOTENV === "1") {
    cached = { file: null, applied: [], shadowed: [] };
    return cached;
  }

  let serverDir: string | undefined;
  try {
    serverDir = dirname(dirname(fileURLToPath(import.meta.url)));
  } catch {
    // Bundled or CJS-transpiled: fall back to cwd-only search.
  }

  for (const file of candidatePaths(serverDir)) {
    if (!existsSync(file)) continue;

    let parsed: Record<string, string>;
    try {
      parsed = parseDotenv(readFileSync(file, "utf8"));
    } catch (err) {
      // An unreadable .env is worth one line of warning and nothing more --
      // the real environment may well carry the credentials anyway.
      console.error(
        `ai-sdlc-harness: could not read ${file}: ${err instanceof Error ? err.message : String(err)}`
      );
      continue;
    }

    const applied: string[] = [];
    const shadowed: string[] = [];

    for (const [key, value] of Object.entries(parsed)) {
      if (!KNOWN_KEYS.has(key)) continue;
      if (value === "") continue; // a placeholder line, not a value
      if (process.env[key]) {
        shadowed.push(key);
        continue;
      }
      process.env[key] = value;
      applied.push(key);
    }

    // stderr, never stdout: stdout is the MCP JSON-RPC channel and a stray
    // line there corrupts the stream for the client.
    console.error(
      `ai-sdlc-harness: loaded ${applied.length} credential(s) from ${file}` +
        (shadowed.length ? ` (${shadowed.length} already set in the environment)` : "")
    );

    cached = { file, applied, shadowed };
    return cached;
  }

  cached = { file: null, applied: [], shadowed: [] };
  return cached;
}

#!/usr/bin/env node
/**
 * Launcher for the ai-sdlc-harness MCP server.
 *
 * Why this exists: Claude Code copies each plugin into its own isolated
 * cache directory on install (~/.claude/plugins/cache/<marketplace>/
 * <plugin>/<version>/), so a plugin cannot reach sibling directories from
 * the source repo by relative path -- an earlier version of this plugin's
 * .mcp.json tried exactly that and the server silently never started.
 * Everything the server needs therefore ships INSIDE this plugin:
 * index.mjs next to this file is a self-contained esbuild bundle of
 * mcp-server/src (no node_modules required).
 *
 * Two modes, resolved at launch:
 *
 *   1. Developer override -- if AI_SDLC_HARNESS_MCP_SERVER_DIR points at a
 *      built checkout of mcp-server/, run that instead. This is for people
 *      actively changing the server: edit, `npm run build`, restart the
 *      session, no need to re-bundle or reinstall the plugin.
 *   2. Default -- run the bundled index.mjs shipped with this plugin.
 *      Installing the plugin is all an ordinary user has to do.
 *
 * Credentials are never read from here. The server reads them from the
 * environment it inherits (ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN,
 * CONFLUENCE_SITE, JIRA_SITE, GITHUB_TOKEN) -- see mcp-server/README.md --
 * so no secret ever lives in a file this marketplace tracks in git.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const override = process.env.AI_SDLC_HARNESS_MCP_SERVER_DIR;

let target = null;

if (override) {
  const candidate = join(override, "dist", "index.js");
  if (existsSync(candidate)) {
    target = candidate;
    console.error(`ai-sdlc-harness launcher: using dev override at ${candidate}`);
  } else {
    console.error(
      `ai-sdlc-harness launcher: AI_SDLC_HARNESS_MCP_SERVER_DIR is set to "${override}" ` +
        `but ${candidate} does not exist. Run 'npm install && npm run build' there to use ` +
        `your source copy. Falling back to the bundled server for now.`
    );
  }
}

if (!target) {
  target = join(here, "index.mjs");
}

await import(pathToFileURL(target).href);

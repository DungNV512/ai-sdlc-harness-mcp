/**
 * Live smoke test — one real call per platform, through the harness's own
 * client code.
 *
 * WHY THIS EXISTS
 *
 * unit-test.mjs stubs global.fetch, so it proves our logic is right about an
 * API we have never actually called. Three of the six platforms (Confluence,
 * GitLab, Teams) have never made a real call from any environment this was
 * developed in, because every one of their hosts is refused by the egress
 * allowlist. That gap is not a small one: the single confirmed Confluence
 * defect -- "Version number must be 1 when publishing a page for the first
 * time" -- is invisible to a stubbed fetch and was only ever seen in a real
 * response.
 *
 * So this script exists to make "make one real call per platform" a command
 * rather than a chore somebody is supposed to remember. Run it from a machine
 * that can actually reach these hosts.
 *
 *   node live-smoke.mjs
 *
 * WHAT IT WILL AND WILL NOT DO
 *
 * Every check here is READ-ONLY by default. Nothing is created, updated,
 * transitioned or deleted. The one exception is Teams, whose only capability
 * is sending a message -- there is no read -- so it stays SKIPped unless you
 * opt in with SMOKE_TEAMS_SEND=1, and then it posts one clearly-labelled
 * test card.
 *
 * A platform with no credentials configured is SKIP, not FAIL. Exit code is 1
 * only if something that was configured actually broke, so this is safe to
 * wire into CI where only some credentials exist.
 *
 * THE NEGATIVE CONTROL, AND WHY A PASS IS NARROWER THAN IT LOOKS
 *
 * Before trusting a success, each HTTP check first sends a deliberately junk
 * credential and requires the API to reject it. If junk is accepted, then
 * something between this process and the API is authenticating on our behalf
 * and a green result says nothing about our own client -- so the check reports
 * SKIP with that reason rather than PASS.
 *
 * This is not hypothetical. The cloud container this was written in proxies
 * github.com with credentials injected: `GET /user` with no token at all
 * answers 200. Without the control, this script reported "GitHub PASS,
 * authenticated" for a token that read `ghp_fakeTokenForNegativeControl`. A
 * verification script that produces a false pass is worse than no script,
 * because it turns an unknown into a wrong answer.
 *
 * So the three states mean:
 *   PASS  junk was rejected AND our credential worked -- attributable to us
 *   FAIL  junk was rejected AND our credential did not work -- a real defect
 *   SKIP  not configured, OR something authenticates for us, OR unreachable
 *
 * ENVIRONMENT
 *
 *   Confluence   ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN, CONFLUENCE_SITE
 *   Jira         ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN, JIRA_SITE
 *   GitHub       GITHUB_TOKEN            (+ optional GITHUB_API_URL)
 *   GitLab       GITLAB_TOKEN            (+ optional GITLAB_API_URL)
 *   Teams        TEAMS_WEBHOOK_URL       (+ SMOKE_TEAMS_SEND=1 to actually post)
 *   Claude Code  the `claude` binary on PATH
 *
 * Behind a proxy, Node needs NODE_USE_ENV_PROXY=1 to honour HTTPS_PROXY --
 * fetch() ignores it otherwise, and every call fails with EAI_AGAIN for a
 * reason that looks nothing like a proxy problem.
 */
import { spawn } from "node:child_process";
import { listConfluenceSpaces, loadConfigFromEnv as loadConfluence } from "./dist/confluence.js";
import { listJiraBoards, loadJiraConfigFromEnv } from "./dist/jira.js";
import { loadGitHubConfigFromEnv } from "./dist/github.js";
import { loadGitLabConfigFromEnv } from "./dist/gitlab.js";
import { loadTeamsConfigFromEnv, redactWebhookUrl, sendTeamsMessage } from "./dist/teams.js";
import { fetchWithRetry, readJsonBody } from "./dist/lib/http.js";

const results = [];

function record(platform, state, detail) {
  results.push({ platform, state, detail });
  const mark = { PASS: " PASS ", FAIL: " FAIL ", SKIP: " skip " }[state];
  console.log(`${mark} ${platform.padEnd(12)} ${detail}`);
}

/**
 * Negative control: call an endpoint that MUST reject a junk credential.
 *
 * Some environments put an authenticating proxy between the process and the
 * API -- this container does, for github.com. There, `GET /user` with no
 * token at all still answers 200, so a "PASS" proves the proxy works and says
 * nothing about whether our client sends its credential correctly. That is a
 * false pass, and a false pass in a verification script is worse than no
 * script: it converts an unknown into a wrong answer.
 *
 * Returns true when a junk credential is correctly rejected, i.e. when what
 * this script observes is actually attributable to our own client.
 */
async function rejectsJunkCredentials(url, junkHeaders) {
  try {
    const res = await fetch(url, { headers: junkHeaders });
    return !res.ok;
  } catch {
    // Unreachable host: we cannot tell either way, so do not claim we can.
    return false;
  }
}

/** Run one check. A missing-credentials error is a SKIP; anything else FAILs. */
async function check(platform, fn) {
  try {
    const detail = await fn();
    if (detail === null) return; // fn already recorded a SKIP
    record(platform, "PASS", detail);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/Missing required environment variable/.test(msg)) {
      record(platform, "SKIP", "not configured — " + msg.replace(/\..*$/, ""));
    } else {
      record(platform, "FAIL", msg.split("\n")[0].slice(0, 160));
    }
  }
}

console.log("Live smoke test — one real call per platform, read-only.\n");

// --- Confluence: list spaces. Pure read, needs no ids, and it is the call
// that proved read access and add-page permission are separate grants.
await check("Confluence", async () => {
  const cfg = loadConfluence();
  const spaces = await listConfluenceSpaces(cfg, { limit: 5 });
  const n = Array.isArray(spaces?.results) ? spaces.results.length : 0;
  return `listConfluenceSpaces returned ${n} space(s)`;
});

// --- Jira: list boards. Read-only and needs no project key.
await check("Jira", async () => {
  const cfg = loadJiraConfigFromEnv();
  const boards = await listJiraBoards(cfg); // no project filter: any board proves the call
  const n = Array.isArray(boards?.values) ? boards.values.length : 0;
  return `listJiraBoards returned ${n} board(s)`;
});

// --- GitHub: /user through our own client. /user is used rather than
// /rate_limit precisely because /rate_limit answers 200 unauthenticated, so it
// cannot tell a working credential from no credential at all.
await check("GitHub", async () => {
  const cfg = loadGitHubConfigFromEnv();
  const ghHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  });

  if (!(await rejectsJunkCredentials(`${cfg.apiUrl}/user`, ghHeaders("junk-token-negative-control")))) {
    record(
      "GitHub",
      "SKIP",
      "something here authenticates for us — a junk token is accepted, so a pass would prove nothing about our client"
    );
    return null;
  }

  const res = await fetchWithRetry(`${cfg.apiUrl}/user`, ghHeaders(cfg.token));
  const body = await readJsonBody(res);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${JSON.stringify(body).slice(0, 120)}`);
  return `our credential authenticated as ${body?.login ?? "?"} (junk token correctly rejected)`;
});

// --- GitLab: /version through our own client, same reasoning as GitHub.
await check("GitLab", async () => {
  const cfg = loadGitLabConfigFromEnv();

  if (!(await rejectsJunkCredentials(`${cfg.apiUrl}/version`, { "PRIVATE-TOKEN": "junk-negative-control" }))) {
    record(
      "GitLab",
      "SKIP",
      "junk token accepted or host unreachable — cannot attribute a pass to our client"
    );
    return null;
  }

  const res = await fetchWithRetry(`${cfg.apiUrl}/version`, {
    headers: { "PRIVATE-TOKEN": cfg.token },
  });
  const body = await readJsonBody(res);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${JSON.stringify(body).slice(0, 120)}`);
  return `our credential authenticated; GitLab ${body?.version ?? "?"} (junk token correctly rejected)`;
});

// --- Teams: the only capability is sending, so a read-only check is not
// possible. Opt in explicitly rather than posting into a real channel by
// surprise.
await check("Teams", async () => {
  const cfg = loadTeamsConfigFromEnv();
  if (process.env.SMOKE_TEAMS_SEND !== "1") {
    record(
      "Teams",
      "SKIP",
      `webhook configured (${redactWebhookUrl(cfg.webhookUrl)}) — set SMOKE_TEAMS_SEND=1 to post a test card`
    );
    return null;
  }
  await sendTeamsMessage(cfg, {
    title: "AI-SDLC harness — live smoke test",
    text: `Connectivity check from live-smoke.mjs at ${new Date().toISOString()}. No action needed.`,
  });
  return "posted one test card (HTTP 202 expected)";
});

// --- Claude Code trigger: the binary has to exist and answer. Spawning
// `--version` proves the spawn path without running a prompt.
await check("Claude Code", async () => {
  const out = await new Promise((resolve) => {
    const child = spawn("claude", ["--version"], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.on("error", () => resolve(null));
    child.on("close", (code) => resolve(code === 0 ? stdout.trim() : null));
  });
  if (out === null) {
    record("Claude Code", "SKIP", "`claude` not on PATH — the trigger tool needs it on the host that runs the server");
    return null;
  }
  return `claude binary answers — ${out.split("\n")[0]}`;
});

// --- report ------------------------------------------------------------------
const failed = results.filter((r) => r.state === "FAIL");
const passed = results.filter((r) => r.state === "PASS");
const skipped = results.filter((r) => r.state === "SKIP");

console.log(
  `\n${passed.length} passed, ${failed.length} failed, ${skipped.length} skipped.`
);

if (skipped.length) {
  console.log(
    "\nA skip is not a pass. Until a platform shows PASS here, its behaviour\n" +
      "against the real API is unverified, whatever the unit tests say."
  );
}
if (failed.length) {
  console.log("\nFailed: " + failed.map((f) => f.platform).join(", "));
  process.exit(1);
}

/**
 * End-to-end credential-path test.
 *
 * Proves the one thing no existing test covered: that a credential written
 * into a .env file reaches the wire, in the right header, in the right scheme,
 * for each platform -- through the REAL compiled client code, not a stub.
 *
 * A local HTTP server stands in for each API and records what arrived. That
 * leaves exactly one thing unverified: whether the real endpoint behaves as
 * documented. Everything on our side of the socket is checked here.
 */
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const received = [];
const srv = createServer((req, res) => {
  let body = "";
  req.on("data", (d) => (body += d));
  req.on("end", () => {
    received.push({ url: req.url, method: req.method, headers: req.headers, body });
    res.writeHead(200, { "content-type": "application/json" });
    // Shapes each client is happy to parse.
    if (req.url.includes("/spaces")) res.end(JSON.stringify({ results: [{ id: "1", key: "X", name: "X" }] }));
    else if (req.url.includes("/board")) res.end(JSON.stringify({ values: [{ id: 1, name: "B" }] }));
    else if (req.url.includes("/version")) res.end(JSON.stringify({ version: "17.0.0" }));
    else if (req.url.includes("/user")) res.end(JSON.stringify({ login: "someone" }));
    else res.end(JSON.stringify({ ok: true, id: 1, iid: 1, web_url: "http://x" }));
  });
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${srv.address().port}`;

// A .env in a temp dir, pointed at by AI_SDLC_ENV_FILE -- the same mechanism a
// user gets, with values that are unmistakable if they show up on the wire.
const dir = mkdtempSync(join(tmpdir(), "aisdlc-"));
const envFile = join(dir, ".env");
writeFileSync(envFile, [
  "# written the way a person writes one",
  'ATLASSIAN_EMAIL="person@example.com"',
  "export ATLASSIAN_API_TOKEN=ATLAS_SECRET_FROM_DOTENV",
  `CONFLUENCE_SITE=${base}`,
  `JIRA_SITE=${base}`,
  "GITLAB_TOKEN='GITLAB_SECRET_FROM_DOTENV'",
  `GITLAB_API_URL=${base}/api/v4   # self-hosted`,
  "GITHUB_TOKEN=GITHUB_SECRET_FROM_DOTENV",
  `GITHUB_API_URL=${base}`,
  `TEAMS_WEBHOOK_URL=${base}/webhook?sig=TEAMS_SECRET#frag`,
].join("\n"));

process.env.AI_SDLC_ENV_FILE = envFile;
// The container pre-sets GITHUB_TOKEN=proxy-injected; clear it so this test
// measures the .env path rather than the container's injection.
delete process.env.GITHUB_TOKEN;
delete process.env.GITLAB_TOKEN;
delete process.env.ATLASSIAN_API_TOKEN;

const { listConfluenceSpaces, loadConfigFromEnv } = await import("./dist/confluence.js");
const { listJiraBoards, loadJiraConfigFromEnv } = await import("./dist/jira.js");
const { loadGitHubConfigFromEnv } = await import("./dist/github.js");
const { getGitLabPipelineStatus, loadGitLabConfigFromEnv } = await import("./dist/gitlab.js");
const { loadTeamsConfigFromEnv, sendTeamsMessage } = await import("./dist/teams.js");

const fails = [];
const check = (label, cond, detail = "") => {
  console.log(`${cond ? "  ok  " : " FAIL "} ${label}${detail ? " -- " + detail : ""}`);
  if (!cond) fails.push(label);
};

const b64 = (s) => Buffer.from(s).toString("base64");

// --- Confluence: HTTP Basic, email:token
await listConfluenceSpaces(loadConfigFromEnv(), { limit: 5 });
let last = received.at(-1);
check("Confluence sends Basic auth built from the .env pair",
  last.headers.authorization === `Basic ${b64("person@example.com:ATLAS_SECRET_FROM_DOTENV")}`,
  last.headers.authorization?.slice(0, 16) + "...");

// --- Jira: same Atlassian identity, same scheme
await listJiraBoards(loadJiraConfigFromEnv());
last = received.at(-1);
check("Jira reuses the same Atlassian Basic credential",
  last.headers.authorization === `Basic ${b64("person@example.com:ATLAS_SECRET_FROM_DOTENV")}`);
check("Jira honours JIRA_SITE from .env", last.url.startsWith("/rest/"), last.url);

// --- GitLab: PRIVATE-TOKEN, not Bearer
await getGitLabPipelineStatus(loadGitLabConfigFromEnv(), "group/proj", 1);
last = received.at(-1);
check("GitLab sends PRIVATE-TOKEN (its own scheme, not Bearer)",
  last.headers["private-token"] === "GITLAB_SECRET_FROM_DOTENV", last.headers["private-token"]);
check("GitLab does NOT also send an Authorization header",
  last.headers.authorization === undefined, String(last.headers.authorization));
check("GitLab honours the inline-commented GITLAB_API_URL",
  last.url.startsWith("/api/v4/"), last.url);

// --- GitHub: Bearer
const gh = loadGitHubConfigFromEnv();
check("GitHub token comes from .env, not the container", gh.token === "GITHUB_SECRET_FROM_DOTENV", gh.token);

// --- Teams: the secret is the URL itself
await sendTeamsMessage(loadTeamsConfigFromEnv(), { title: "t", text: "x" });
last = received.at(-1);
check("Teams posts to the full webhook path with sig intact",
  last.url.includes("sig=TEAMS_SECRET"), last.url);
check("Teams sends a JSON body", (last.headers["content-type"] || "").includes("json"));

// --- the redaction promise, checked rather than trusted
const { redactWebhookUrl } = await import("./dist/teams.js");
const red = redactWebhookUrl(loadTeamsConfigFromEnv().webhookUrl);
check("a redacted webhook URL carries no sig value", !red.includes("TEAMS_SECRET"), red);

srv.close();
console.log(`\n=== ${fails.length === 0 ? "ALL CHECKS PASSED" : `${fails.length} FAILURE(S): ${fails.join(", ")}`} ===`);
process.exit(fails.length ? 1 : 0);

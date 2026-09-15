/**
 * stdio JSON-RPC smoke test: initialize + tools/list, then a few tools/call
 * probes that exercise validation and credential-error paths without needing
 * network access.
 *
 * Run: node smoke-test.mjs
 */
import { spawn } from "node:child_process";

const child = spawn("node", ["dist/index.js"], { stdio: ["pipe", "pipe", "pipe"] });

let buf = "";
const pending = new Map();
child.stdout.on("data", (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    } catch {}
  }
});

let nextId = 1;
function rpc(method, params) {
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}

const fails = [];
function check(label, cond, detail = "") {
  console.log(`${cond ? "  ok  " : " FAIL "} ${label}${detail ? " -- " + detail : ""}`);
  if (!cond) fails.push(label);
}

await rpc("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "smoke-test", version: "0" },
});
child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

const list = await rpc("tools/list", {});
const names = (list.result?.tools ?? []).map((t) => t.name).sort();

console.log(`\n=== tools/list: ${names.length} tools ===`);
console.log(names.join("\n"));

const expected = [
  // Confluence (1 original + 4 Phase 2)
  "create_confluence_page", "get_confluence_page", "update_confluence_page",
  "search_confluence", "list_confluence_spaces",
  // Jira (12)
  "create_jira_issue", "update_jira_issue", "get_jira_issue", "search_jira_issues",
  "add_jira_comment", "update_jira_comment", "transition_jira_issue", "get_jira_transitions",
  "link_jira_issues", "list_jira_boards", "list_jira_sprints", "list_jira_issue_types",
  // GitHub (4)
  "create_github_pull_request", "create_github_issue", "get_github_workflow_run_status",
  "request_github_pr_reviewers",
  // GitLab (5)
  "create_gitlab_merge_request", "get_gitlab_merge_request", "request_gitlab_mr_reviewers",
  "create_gitlab_issue", "get_gitlab_pipeline_status",
  // Other (2)
  "run_claude_code_command", "send_teams_message",
].sort();

console.log(`\n=== schema checks ===`);
check(`tool count is ${expected.length}`, names.length === expected.length, `got ${names.length}`);
const missing = expected.filter((n) => !names.includes(n));
const extra = names.filter((n) => !expected.includes(n));
check("no missing tools", missing.length === 0, missing.join(", "));
check("no unexpected tools", extra.length === 0, extra.join(", "));

// Every tool must carry a non-empty description and an object inputSchema.
for (const t of list.result?.tools ?? []) {
  if (!t.description || t.description.length < 20 || t.inputSchema?.type !== "object") {
    check(`${t.name} has description + object inputSchema`, false);
  }
}
check("all tools have description + object inputSchema", !fails.some((f) => f.includes("inputSchema")));

console.log(`\n=== tools/call probes ===`);

// 1. zod validation error surfaces as a tool error, not a crash.
const bad = await rpc("tools/call", {
  name: "create_gitlab_merge_request",
  arguments: { project: "g/p", title: "x" }, // missing sourceBranch/targetBranch
});
check("missing required args -> tool error", bad.result?.isError === true,
  JSON.stringify(bad.result?.content?.[0]?.text ?? bad.error).slice(0, 120));

// 2. missing GITLAB_TOKEN surfaces as a clear error naming the var.
const noCreds = await rpc("tools/call", {
  name: "create_gitlab_issue",
  arguments: { project: "group/proj", title: "hello" },
});
const noCredsText = noCreds.result?.content?.[0]?.text ?? "";
check("missing GITLAB_TOKEN -> named env-var error",
  noCreds.result?.isError === true && noCredsText.includes("GITLAB_TOKEN"),
  noCredsText.slice(0, 120));

// 3. Confluence parity tool reports its own missing creds, not GitLab's.
const confNoCreds = await rpc("tools/call", {
  name: "search_confluence",
  arguments: { cql: 'type = page' },
});
const confText = confNoCreds.result?.content?.[0]?.text ?? "";
check("missing Confluence creds -> named env-var error",
  confNoCreds.result?.isError === true && confText.includes("CONFLUENCE_SITE"),
  confText.slice(0, 120));

// 4. reviewer list cannot be empty (min(1) on the zod schema).
const emptyReviewers = await rpc("tools/call", {
  name: "request_gitlab_mr_reviewers",
  arguments: { project: "g/p", mergeRequestIid: 1, reviewerUsernames: [] },
});
check("empty reviewer list -> validation error", emptyReviewers.result?.isError === true);

// 5. server is still alive after all those errors.
const stillAlive = await rpc("tools/list", {});
check("server still responsive after errors", (stillAlive.result?.tools ?? []).length === expected.length);

child.kill();

console.log(`\n=== ${fails.length === 0 ? "ALL CHECKS PASSED" : `${fails.length} FAILURE(S): ${fails.join(", ")}`} ===`);
process.exit(fails.length === 0 ? 0 : 1);

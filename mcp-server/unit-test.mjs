/**
 * Unit tests for the logic that is NOT a thin pass-through to an API --
 * the places gitlab.ts and confluence.ts had to make a real decision, where a
 * silent bug would produce a tool that reports success while doing the wrong
 * thing. global.fetch is stubbed, so these run with no network at all.
 *
 * Run: node unit-test.mjs
 */
import {
  applyDraftPrefix,
  createGitLabMergeRequest,
  encodeProjectId,
  requestGitLabMrReviewers,
  resolveUserIds,
} from "./dist/gitlab.js";
import { updateConfluencePage } from "./dist/confluence.js";

const fails = [];
function check(label, cond, detail = "") {
  console.log(`${cond ? "  ok  " : " FAIL "} ${label}${detail ? " -- " + detail : ""}`);
  if (!cond) fails.push(label);
}

const GL = { apiUrl: "https://gitlab.example.com/api/v4", token: "t" };
const CF = { site: "https://x.atlassian.net", email: "e@x", apiToken: "t" };

/** Stub fetch with an ordered list of [urlMatcher, responder]. Records calls. */
let calls = [];
function stubFetch(routes) {
  calls = [];
  global.fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ url, method: init.method ?? "GET", body });
    for (const [match, respond] of routes) {
      if (url.includes(match) && (!respond.method || respond.method === (init.method ?? "GET"))) {
        return {
          ok: respond.ok ?? true,
          status: respond.status ?? 200,
          statusText: "",
          text: async () => JSON.stringify(respond.data ?? {}),
        };
      }
    }
    throw new Error(`unstubbed fetch: ${init.method ?? "GET"} ${url}`);
  };
}

console.log("=== pure helpers ===");
check("numeric project id passes through", encodeProjectId("12345") === "12345");
check("path project id is fully URL-encoded", encodeProjectId("group/sub/proj") === "group%2Fsub%2Fproj",
  encodeProjectId("group/sub/proj"));
check("draft prefix added", applyDraftPrefix("Fix login", true) === "Draft: Fix login");
check("draft prefix is idempotent", applyDraftPrefix("Draft: Fix login", true) === "Draft: Fix login");
check("draft prefix case-insensitive", applyDraftPrefix("draft: Fix login", true) === "draft: Fix login");
check("no prefix when draft falsy", applyDraftPrefix("Fix login", false) === "Fix login");
check("no prefix when draft undefined", applyDraftPrefix("Fix login", undefined) === "Fix login");

console.log("\n=== resolveUserIds ===");
stubFetch([["/users?username=alice", { data: [{ id: 7, username: "alice" }] }]]);
check("resolves username to numeric id", (await resolveUserIds(GL, ["alice"]))[0] === 7);

stubFetch([["/users?username=ghost", { data: [] }]]);
let threw = null;
try { await resolveUserIds(GL, ["ghost"]); } catch (e) { threw = e; }
check("unknown username throws rather than silently skipping",
  threw !== null && threw.message.includes("ghost"), threw?.message?.slice(0, 80));

console.log("\n=== createGitLabMergeRequest payload ===");
stubFetch([
  ["/users?username=bob", { data: [{ id: 9, username: "bob" }] }],
  ["/merge_requests", { method: "POST", data: { iid: 42, title: "Draft: T", web_url: "u" } }],
]);
await createGitLabMergeRequest(GL, {
  project: "group/proj", title: "T", sourceBranch: "feat/x", targetBranch: "main",
  description: "d", draft: true, reviewerUsernames: ["bob"],
});
const created = calls.find((c) => c.method === "POST");
check("MR POST hits the encoded project path",
  created.url.includes("/projects/group%2Fproj/merge_requests"), created.url);
check("MR payload uses GitLab's snake_case branch fields",
  created.body.source_branch === "feat/x" && created.body.target_branch === "main");
check("MR title carries the Draft: prefix (no draft field)",
  created.body.title === "Draft: T" && created.body.draft === undefined);
check("reviewer usernames became numeric reviewer_ids",
  JSON.stringify(created.body.reviewer_ids) === "[9]", JSON.stringify(created.body.reviewer_ids));

console.log("\n=== requestGitLabMrReviewers: the union-vs-replace trap ===");
// MR already has reviewer id 1. Adding 'bob' (id 9) must keep BOTH.
stubFetch([
  ["/users?username=bob", { data: [{ id: 9, username: "bob" }] }],
  ["/merge_requests/5", { method: "GET", data: { iid: 5, reviewers: [{ id: 1 }] } }],
  ["/merge_requests/5", { method: "PUT", data: { iid: 5, reviewers: [{ id: 1 }, { id: 9 }] } }],
]);
await requestGitLabMrReviewers(GL, { project: "g/p", mergeRequestIid: 5, reviewerUsernames: ["bob"] });
let put = calls.find((c) => c.method === "PUT");
check("default adds without dropping the existing reviewer",
  JSON.stringify([...put.body.reviewer_ids].sort()) === "[1,9]", JSON.stringify(put.body.reviewer_ids));

stubFetch([
  ["/users?username=bob", { data: [{ id: 9, username: "bob" }] }],
  ["/merge_requests/5", { method: "PUT", data: { iid: 5, reviewers: [{ id: 9 }] } }],
]);
await requestGitLabMrReviewers(GL, {
  project: "g/p", mergeRequestIid: 5, reviewerUsernames: ["bob"], replace: true,
});
put = calls.find((c) => c.method === "PUT");
check("replace:true replaces the list", JSON.stringify(put.body.reviewer_ids) === "[9]");
check("replace:true skips the read entirely", !calls.some((c) => c.method === "GET" && c.url.includes("/merge_requests/5")));

console.log("\n=== updateConfluencePage version handling ===");
stubFetch([
  ["/pages/123?body-format", { method: "GET", data: { id: "123", title: "Old", status: "current", version: { number: 4 } } }],
  ["/pages/123", { method: "PUT", data: { id: "123", title: "New", version: { number: 5 } } }],
]);
await updateConfluencePage(CF, { pageId: "123", title: "New", bodyHtml: "<p>x</p>" });
const cfPut = calls.find((c) => c.method === "PUT");
check("update sends current version + 1", cfPut.body.version.number === 5, String(cfPut.body.version.number));
check("update carries id, title, storage body",
  cfPut.body.id === "123" && cfPut.body.title === "New" && cfPut.body.body.representation === "storage");

stubFetch([
  ["/pages/123?body-format", { method: "GET", data: { id: "123", title: "Old", status: "current", version: { number: 7 } } }],
]);
threw = null;
try {
  await updateConfluencePage(CF, { pageId: "123", title: "N", bodyHtml: "x", expectedCurrentVersion: 4 });
} catch (e) { threw = e; }
check("stale expectedCurrentVersion refuses the write",
  threw !== null && threw.message.includes("version 7"), threw?.message?.slice(0, 90));
check("refused write sent no PUT", !calls.some((c) => c.method === "PUT"));

console.log(`\n=== ${fails.length === 0 ? "ALL CHECKS PASSED" : `${fails.length} FAILURE(S): ${fails.join(", ")}`} ===`);
process.exit(fails.length === 0 ? 0 : 1);

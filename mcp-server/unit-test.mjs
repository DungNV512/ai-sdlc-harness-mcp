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
import { candidatePaths, parseDotenv } from "./dist/lib/dotenv.js";

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

// Regression: publishing a draft for the first time. Confluence answers
// "Version number must be 1 when publishing a page for the first time.
// Provided version: 2" if we increment here. Recorded from a real failed call,
// see the block comment in confluence.ts and SBV2 page 450823289.
stubFetch([
  ["/pages/77?body-format", { method: "GET", data: { id: "77", title: "D", status: "draft", version: { number: 1 } } }],
  ["/pages/77", { method: "PUT", data: { id: "77", title: "D", version: { number: 1 } } }],
]);
await updateConfluencePage(CF, { pageId: "77", title: "D", bodyHtml: "<p>x</p>", status: "current" });
const draftPut = calls.find((c) => c.method === "PUT");
check("first publish of a draft sends version 1, not 2",
  draftPut.body.version.number === 1, String(draftPut.body.version.number));
check("first publish of a draft sets status current", draftPut.body.status === "current");

// ...and the narrow fix must not change a normal edit of an already-draft page
// that stays a draft.
stubFetch([
  ["/pages/78?body-format", { method: "GET", data: { id: "78", title: "D", status: "draft", version: { number: 3 } } }],
  ["/pages/78", { method: "PUT", data: { id: "78", title: "D", version: { number: 4 } } }],
]);
await updateConfluencePage(CF, { pageId: "78", title: "D", bodyHtml: "<p>x</p>", status: "draft" });
const draftEdit = calls.find((c) => c.method === "PUT");
check("editing a draft that stays a draft still increments",
  draftEdit.body.version.number === 4, String(draftEdit.body.version.number));

// --- .env parsing -----------------------------------------------------------
//
// These shapes are not hypothetical: every one of them came out of a real
// credentials file a user assembled by pasting lines from a shell profile and
// from this repo's own .env.example. A parser that quietly dropped any of
// them would report the variable as unset with the value sitting in the file
// two inches from the error message.

const parsed = parseDotenv([
  '# comment line',
  'ATLASSIAN_EMAIL="a@b.com"',
  'ATLASSIAN_API_TOKEN=ATATT3x_has=equals=inside=7DCF85F0',
  'export GITLAB_TOKEN="glft-abc123"',
  'GITLAB_API_URL=https://gl.example/api/v4  # trailing note',
  "CONFLUENCE_SITE='https://single.atlassian.net'",
  'TEAMS_WEBHOOK_URL="https://x.com/invoke?sp=%2Ftriggers&sig=abc#frag"',
  'EMPTY=',
  '   SPACED   =   value with spaces',
].join('\n'));

check("quoted value loses its quotes", parsed.ATLASSIAN_EMAIL === "a@b.com", parsed.ATLASSIAN_EMAIL);
check("unquoted value keeps every = after the first",
  parsed.ATLASSIAN_API_TOKEN === "ATATT3x_has=equals=inside=7DCF85F0", parsed.ATLASSIAN_API_TOKEN);
check("`export KEY=` is accepted, not skipped",
  parsed.GITLAB_TOKEN === "glft-abc123", parsed.GITLAB_TOKEN);
check("an unquoted inline comment is stripped",
  parsed.GITLAB_API_URL === "https://gl.example/api/v4", parsed.GITLAB_API_URL);
check("single quotes work too",
  parsed.CONFLUENCE_SITE === "https://single.atlassian.net", parsed.CONFLUENCE_SITE);
// The one that matters most: the Teams webhook's `sig` IS its authentication,
// and a # inside the quoted URL is data. Truncating there yields a URL that
// looks fine and posts nowhere.
check("a # inside a quoted URL is not treated as a comment",
  parsed.TEAMS_WEBHOOK_URL === "https://x.com/invoke?sp=%2Ftriggers&sig=abc#frag",
  parsed.TEAMS_WEBHOOK_URL);
check("an empty value parses as empty, not undefined", parsed.EMPTY === "");
check("whitespace around key and value is trimmed",
  parsed.SPACED === "value with spaces", JSON.stringify(parsed.SPACED));

const paths = candidatePaths("/srv/mcp-server/dist");
check("cwd/.env is searched", paths.some((p) => p.endsWith("/.env")));
check("the home-dir location a plugin upgrade cannot delete is searched",
  paths.some((p) => p.includes(".config/ai-sdlc-harness/.env")), paths.join(" | "));
check("candidate list has no duplicates", new Set(paths).size === paths.length);

console.log(`\n=== ${fails.length === 0 ? "ALL CHECKS PASSED" : `${fails.length} FAILURE(S): ${fails.join(", ")}`} ===`);
process.exit(fails.length === 0 ? 0 : 1);

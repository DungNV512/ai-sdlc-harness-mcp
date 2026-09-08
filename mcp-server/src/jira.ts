/**
 * Jira Cloud REST API v3 (+ Agile API v1.0) client.
 *
 * Every function here is a 1:1 port of one bin/*.sh script from the
 * stockbookapp repo (endpoint, method and payload shape copied exactly),
 * ported to TypeScript so the same operations are usable as MCP tools from
 * anywhere -- not just via the Bash tool inside that one repo. See each
 * function's doc comment for which script it mirrors.
 *
 * Deliberately NOT included: a delete-issue operation. stockbookapp's
 * .claude/settings.json carries a standing deny-rule ("Org policy forbids
 * deleting Jira issues") and the repo has no such script by design -- this
 * client respects that policy instead of treating "full parity" as license
 * to exceed it.
 *
 * Auth: same Atlassian account email + API token as confluence.ts (Jira
 * Cloud and Confluence Cloud share one Atlassian identity).
 */

import { basicAuthHeader, fetchWithRetry, readJsonBody } from "./lib/http.js";

export interface JiraConfig {
  site: string; // e.g. https://your-site.atlassian.net (no trailing slash)
  email: string;
  apiToken: string;
}

export function loadJiraConfigFromEnv(): JiraConfig {
  const site = process.env.JIRA_SITE || "https://ipas-tech.atlassian.net";
  const email = process.env.ATLASSIAN_EMAIL;
  const apiToken = process.env.ATLASSIAN_API_TOKEN;

  const missing = [!email && "ATLASSIAN_EMAIL", !apiToken && "ATLASSIAN_API_TOKEN"].filter(
    Boolean
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. See .env.example.`
    );
  }

  return { site, email: email!, apiToken: apiToken! };
}

function authHeaders(cfg: JiraConfig): Record<string, string> {
  return {
    Authorization: basicAuthHeader(cfg.email, cfg.apiToken),
    Accept: "application/json",
  };
}

async function request(
  cfg: JiraConfig,
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = `${cfg.site.replace(/\/$/, "")}${path}`;
  const res = await fetchWithRetry(url, {
    ...init,
    headers: { ...authHeaders(cfg), ...(init.headers ?? {}) },
  });
  const data = await readJsonBody(res);
  return { ok: res.ok, status: res.status, data };
}

function assertOk(result: { ok: boolean; status: number; data: unknown }, action: string): void {
  if (!result.ok) {
    throw new Error(
      `Jira API request failed for ${action}: HTTP ${result.status}\n${JSON.stringify(result.data)}`
    );
  }
}

/** A single-paragraph ADF (Atlassian Document Format) doc from plain text. */
function adfSingleParagraph(text: string): object {
  return {
    type: "doc",
    version: 1,
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

/**
 * Multi-paragraph ADF, splitting on newlines (blank lines become empty
 * paragraphs). Mirrors update-jira-comment.sh's paragraph-per-line
 * behavior exactly -- add-jira-comment.sh does NOT do this (single
 * paragraph only), so the two comment functions below intentionally build
 * ADF differently, matching their respective scripts.
 */
function adfMultiParagraph(text: string): object {
  const paragraphs = text.split("\n").map((line) =>
    line.trim() === ""
      ? { type: "paragraph", content: [] }
      : { type: "paragraph", content: [{ type: "text", text: line }] }
  );
  return { type: "doc", version: 1, content: paragraphs };
}

// ---------------------------------------------------------------------------
// create_jira_issue — mirrors bin/create-jira-issue.sh (POST /rest/api/3/issue)
// ---------------------------------------------------------------------------
export interface CreateIssueInput {
  projectKey: string;
  issueType?: string; // default "Task"
  summary: string;
  description?: string;
  assigneeId?: string;
  priorityId?: string;
  labels?: string[];
}

export async function createJiraIssue(
  cfg: JiraConfig,
  input: CreateIssueInput
): Promise<{ key: string; id: string; self: string }> {
  const fields: Record<string, unknown> = {
    project: { key: input.projectKey },
    issuetype: { name: input.issueType ?? "Task" },
    summary: input.summary,
  };
  if (input.description) fields.description = adfSingleParagraph(input.description);
  if (input.assigneeId) fields.assignee = { id: input.assigneeId };
  if (input.priorityId) fields.priority = { id: input.priorityId };
  if (input.labels && input.labels.length > 0) fields.labels = input.labels;

  const result = await request(cfg, "/rest/api/3/issue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  assertOk(result, `create issue in ${input.projectKey}`);
  const data = result.data as { key: string; id: string; self: string };
  return data;
}

// ---------------------------------------------------------------------------
// update_jira_issue — mirrors bin/update-jira-issue.sh (PUT /rest/api/3/issue/{key})
// Passthrough by design, exactly like the script (JIRA_UPDATE_BODY/-FILE):
// the caller supplies the full Jira "edit issue" payload (fields/update),
// this function does not attempt to build it.
// ---------------------------------------------------------------------------
export async function updateJiraIssue(
  cfg: JiraConfig,
  issueKey: string,
  body: Record<string, unknown>
): Promise<void> {
  const result = await request(cfg, `/rest/api/3/issue/${issueKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  assertOk(result, `update issue ${issueKey}`);
}

// ---------------------------------------------------------------------------
// get_jira_issue — mirrors bin/fetch-jira-issue.sh (GET /rest/api/3/issue/{key})
// ---------------------------------------------------------------------------
export async function getJiraIssue(
  cfg: JiraConfig,
  issueKey: string,
  fields = "*all",
  expand?: string
): Promise<unknown> {
  let path = `/rest/api/3/issue/${issueKey}?fields=${encodeURIComponent(fields)}`;
  if (expand) path += `&expand=${encodeURIComponent(expand)}`;
  const result = await request(cfg, path);
  assertOk(result, `fetch issue ${issueKey}`);
  return result.data;
}

// ---------------------------------------------------------------------------
// search_jira_issues — mirrors bin/search-jira-issues.sh (POST /rest/api/3/search/jql)
// ---------------------------------------------------------------------------
export interface SearchIssuesInput {
  jql: string;
  maxResults?: number; // default 50
  fields?: string[]; // default summary,status,assignee,issuetype,priority
  nextPageToken?: string;
}

export async function searchJiraIssues(cfg: JiraConfig, input: SearchIssuesInput): Promise<unknown> {
  const body: Record<string, unknown> = {
    jql: input.jql,
    maxResults: input.maxResults ?? 50,
    fields: input.fields ?? ["summary", "status", "assignee", "issuetype", "priority"],
  };
  if (input.nextPageToken) body.nextPageToken = input.nextPageToken;

  const result = await request(cfg, "/rest/api/3/search/jql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  assertOk(result, "search issues");
  return result.data;
}

// ---------------------------------------------------------------------------
// add_jira_comment — mirrors bin/add-jira-comment.sh (POST .../comment)
// Single ADF paragraph -- does NOT split on newlines (unlike update, below).
// ---------------------------------------------------------------------------
export async function addJiraComment(
  cfg: JiraConfig,
  issueKey: string,
  text: string
): Promise<{ id: string }> {
  const result = await request(cfg, `/rest/api/3/issue/${issueKey}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: adfSingleParagraph(text) }),
  });
  assertOk(result, `add comment on ${issueKey}`);
  return result.data as { id: string };
}

// ---------------------------------------------------------------------------
// update_jira_comment — mirrors bin/update-jira-comment.sh (PUT .../comment/{id})
// Multi-paragraph ADF, one paragraph per newline (matches the script).
// ---------------------------------------------------------------------------
export async function updateJiraComment(
  cfg: JiraConfig,
  issueKey: string,
  commentId: string,
  text: string
): Promise<{ id: string }> {
  const result = await request(cfg, `/rest/api/3/issue/${issueKey}/comment/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: adfMultiParagraph(text) }),
  });
  assertOk(result, `update comment ${commentId} on ${issueKey}`);
  return result.data as { id: string };
}

// ---------------------------------------------------------------------------
// transition_jira_issue — mirrors bin/transition-jira-issue.sh (POST .../transitions)
// ---------------------------------------------------------------------------
export async function transitionJiraIssue(
  cfg: JiraConfig,
  issueKey: string,
  opts: { transitionId?: string; transitionName?: string; resolution?: string }
): Promise<void> {
  if (!opts.transitionId && !opts.transitionName) {
    throw new Error("Either transitionId or transitionName is required.");
  }
  const transition: Record<string, unknown> = {};
  if (opts.transitionId) transition.id = opts.transitionId;
  else if (opts.transitionName) transition.name = opts.transitionName;

  const body: Record<string, unknown> = { transition };
  if (opts.resolution) body.fields = { resolution: { name: opts.resolution } };

  const result = await request(cfg, `/rest/api/3/issue/${issueKey}/transitions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  assertOk(result, `transition ${issueKey}`);
}

// ---------------------------------------------------------------------------
// get_jira_transitions — mirrors bin/get-jira-transitions.sh (GET .../transitions)
// ---------------------------------------------------------------------------
export async function getJiraTransitions(cfg: JiraConfig, issueKey: string): Promise<unknown> {
  const result = await request(cfg, `/rest/api/3/issue/${issueKey}/transitions`);
  assertOk(result, `list transitions for ${issueKey}`);
  return result.data;
}

// ---------------------------------------------------------------------------
// link_jira_issues — mirrors bin/link-jira-issues.sh (POST /rest/api/3/issueLink)
// ---------------------------------------------------------------------------
export async function linkJiraIssues(
  cfg: JiraConfig,
  outwardKey: string,
  inwardKey: string,
  linkType = "Relates"
): Promise<void> {
  const result = await request(cfg, "/rest/api/3/issueLink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      outwardIssue: { key: outwardKey },
      inwardIssue: { key: inwardKey },
      type: { name: linkType },
    }),
  });
  assertOk(result, `link ${outwardKey} -> ${inwardKey}`);
}

// ---------------------------------------------------------------------------
// list_jira_boards — mirrors bin/list-jira-boards.sh (GET /rest/agile/1.0/board)
// ---------------------------------------------------------------------------
export async function listJiraBoards(
  cfg: JiraConfig,
  projectKey?: string,
  boardType?: string
): Promise<unknown> {
  const params = new URLSearchParams();
  if (projectKey) params.set("projectKeyOrId", projectKey);
  if (boardType) params.set("type", boardType);
  const qs = params.toString();
  const result = await request(cfg, `/rest/agile/1.0/board${qs ? `?${qs}` : ""}`);
  assertOk(result, "list boards");
  return result.data;
}

// ---------------------------------------------------------------------------
// list_jira_sprints — mirrors bin/list-jira-sprints.sh (GET /rest/agile/1.0/board/{id}/sprint)
// ---------------------------------------------------------------------------
export async function listJiraSprints(
  cfg: JiraConfig,
  boardId: string,
  state?: string
): Promise<unknown> {
  const qs = state ? `?state=${encodeURIComponent(state)}` : "";
  const result = await request(cfg, `/rest/agile/1.0/board/${boardId}/sprint${qs}`);
  assertOk(result, `list sprints for board ${boardId}`);
  return result.data;
}

// ---------------------------------------------------------------------------
// list_jira_issue_types — mirrors bin/list-jira-issue-types.sh
// (GET /rest/api/3/issue/createmeta/{projectKey}/issuetypes)
// ---------------------------------------------------------------------------
export async function listJiraIssueTypes(cfg: JiraConfig, projectKey: string): Promise<unknown> {
  const result = await request(cfg, `/rest/api/3/issue/createmeta/${projectKey}/issuetypes`);
  assertOk(result, `list issue types for ${projectKey}`);
  return result.data;
}

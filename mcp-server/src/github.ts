/**
 * GitHub REST API v3 client.
 *
 * Scope, by design (see the plan's "don't exceed what's asked" discipline,
 * already applied to Jira's excluded delete-issue tool): a read+create
 * surface only. Three tools, each mirroring a long-stable, versioned
 * endpoint (X-GitHub-Api-Version: 2022-11-28) -- no delete/merge/close
 * tools.
 *
 * Auth: Authorization: Bearer <PAT> -- distinct from Atlassian's HTTP
 * Basic (email + API token). New env vars: GITHUB_TOKEN (required),
 * GITHUB_API_URL (optional, defaults to https://api.github.com; lets this
 * point at a GitHub Enterprise instance later without a code change,
 * mirroring the *_SITE override pattern already used for Confluence/Jira).
 */

import { fetchWithRetry, readJsonBody } from "./lib/http.js";

export interface GitHubConfig {
  apiUrl: string; // e.g. https://api.github.com (no trailing slash)
  token: string;
}

export function loadGitHubConfigFromEnv(): GitHubConfig {
  const apiUrl = (process.env.GITHUB_API_URL || "https://api.github.com").replace(/\/$/, "");
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("Missing required environment variable(s): GITHUB_TOKEN. See .env.example.");
  }

  return { apiUrl, token };
}

function authHeaders(cfg: GitHubConfig): Record<string, string> {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function request(
  cfg: GitHubConfig,
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = `${cfg.apiUrl}${path}`;
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
      `GitHub API request failed for ${action}: HTTP ${result.status}\n${JSON.stringify(result.data)}`
    );
  }
}

export interface CreateGitHubPullRequestInput {
  owner: string;
  repo: string;
  title: string;
  head: string; // branch to merge from (or "owner:branch" for a cross-repo PR)
  base: string; // branch to merge into
  body?: string;
  draft?: boolean;
}

/** POST /repos/{owner}/{repo}/pulls */
export async function createGitHubPullRequest(
  cfg: GitHubConfig,
  input: CreateGitHubPullRequestInput
): Promise<unknown> {
  const { owner, repo, ...payload } = input;
  const result = await request(cfg, `/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assertOk(result, `create pull request in ${owner}/${repo}`);
  return result.data;
}

export interface CreateGitHubIssueInput {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}

/** POST /repos/{owner}/{repo}/issues */
export async function createGitHubIssue(
  cfg: GitHubConfig,
  input: CreateGitHubIssueInput
): Promise<unknown> {
  const { owner, repo, ...payload } = input;
  const result = await request(cfg, `/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assertOk(result, `create issue in ${owner}/${repo}`);
  return result.data;
}

/** GET /repos/{owner}/{repo}/actions/runs/{run_id} */
export async function getGitHubWorkflowRunStatus(
  cfg: GitHubConfig,
  owner: string,
  repo: string,
  runId: string
): Promise<unknown> {
  const result = await request(cfg, `/repos/${owner}/${repo}/actions/runs/${runId}`, {
    method: "GET",
  });
  assertOk(result, `get workflow run status for ${owner}/${repo}#${runId}`);
  const data = result.data as Record<string, unknown>;
  return {
    status: data.status,
    conclusion: data.conclusion,
    html_url: data.html_url,
  };
}

export interface RequestGitHubPrReviewersInput {
  owner: string;
  repo: string;
  pullNumber: number;
  reviewers?: string[];
  teamReviewers?: string[];
}

/**
 * POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers
 *
 * Deliberately still within the read+create surface this client committed
 * to: requesting a review creates a review request, it does not approve,
 * merge, or close anything. GitHub refuses a request naming the PR's own
 * author (you cannot review your own PR) with a 422 -- that surfaces here
 * as a clear assertOk failure rather than being silently swallowed, since
 * "the reviewer was never actually assigned" is exactly the state a
 * notification must not claim to have happened.
 */
export async function requestGitHubPrReviewers(
  cfg: GitHubConfig,
  input: RequestGitHubPrReviewersInput
): Promise<unknown> {
  const { owner, repo, pullNumber, reviewers, teamReviewers } = input;
  const payload: Record<string, unknown> = {};
  if (reviewers && reviewers.length > 0) payload.reviewers = reviewers;
  if (teamReviewers && teamReviewers.length > 0) payload.team_reviewers = teamReviewers;

  if (Object.keys(payload).length === 0) {
    throw new Error("requestGitHubPrReviewers needs at least one of `reviewers` or `teamReviewers`.");
  }

  const result = await request(cfg, `/repos/${owner}/${repo}/pulls/${pullNumber}/requested_reviewers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assertOk(result, `request reviewers on ${owner}/${repo}#${pullNumber}`);
  const data = result.data as Record<string, unknown>;
  return {
    number: data.number,
    html_url: data.html_url,
    requested_reviewers: data.requested_reviewers,
  };
}

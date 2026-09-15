/**
 * GitLab REST API v4 client.
 *
 * Scope, by design: the same read+create surface `github.ts` committed to --
 * no delete, no merge, no close. The Jira client excludes delete-issue for
 * the same reason (an org policy removed that capability on purpose); this
 * client does not reintroduce an admin surface just because "parity with
 * GitHub" could be read as license to.
 *
 * Auth: `PRIVATE-TOKEN: <PAT>` -- GitLab's own header, not GitHub's
 * `Authorization: Bearer` and not Atlassian's HTTP Basic. Env vars:
 * GITLAB_TOKEN (required), GITLAB_API_URL (optional, defaults to
 * https://gitlab.com/api/v4; a self-hosted instance sets it to
 * https://<host>/api/v4, mirroring the *_SITE / GITHUB_API_URL override
 * pattern already used by every other client here).
 *
 * Three places GitLab is NOT shaped like GitHub. Each is handled explicitly
 * rather than papered over, because a silent mismatch here produces the
 * worst possible failure mode: a tool that reports success while the
 * reviewer was never assigned or the MR was never marked draft.
 *
 *   1. A project is addressed by numeric ID *or* by its full path
 *      ("group/subgroup/project"), and the path must be URL-encoded into a
 *      single segment. `encodeProjectId` does that.
 *   2. There is no `draft: true` field. A draft MR is one whose title starts
 *      with "Draft: " (GitLab 14+ dropped the older "WIP:" prefix).
 *      `applyDraftPrefix` does that, and is idempotent.
 *   3. Reviewers are set by numeric user ID, not username, and the update
 *      endpoint REPLACES the reviewer list rather than appending to it --
 *      the opposite of GitHub's add-semantics. Calling a naive port twice
 *      would silently drop the first reviewer. `requestGitLabMrReviewers`
 *      therefore resolves usernames to IDs, unions them with whoever is
 *      already assigned, and only replaces when `replace: true` is passed.
 */

import { fetchWithRetry, readJsonBody } from "./lib/http.js";

export interface GitLabConfig {
  apiUrl: string; // e.g. https://gitlab.com/api/v4 (no trailing slash)
  token: string;
}

export function loadGitLabConfigFromEnv(): GitLabConfig {
  const apiUrl = (process.env.GITLAB_API_URL || "https://gitlab.com/api/v4").replace(/\/$/, "");
  const token = process.env.GITLAB_TOKEN;

  if (!token) {
    throw new Error("Missing required environment variable(s): GITLAB_TOKEN. See .env.example.");
  }

  return { apiUrl, token };
}

function authHeaders(cfg: GitLabConfig): Record<string, string> {
  return {
    "PRIVATE-TOKEN": cfg.token,
    Accept: "application/json",
  };
}

/**
 * A GitLab project is either a numeric ID ("12345") or a full namespace path
 * ("group/subgroup/project"). The path form must be URL-encoded into ONE
 * path segment -- slashes included -- or the API reads it as extra routing
 * segments and 404s.
 */
export function encodeProjectId(project: string): string {
  if (/^\d+$/.test(project)) return project;
  return encodeURIComponent(project);
}

/**
 * GitLab has no boolean draft flag; a draft MR is one titled "Draft: ...".
 * Idempotent, and case-insensitive on the existing prefix so a caller who
 * already wrote "Draft: Fix login" does not end up with "Draft: Draft: ...".
 */
export function applyDraftPrefix(title: string, draft: boolean | undefined): string {
  const alreadyDraft = /^draft:\s*/i.test(title);
  if (draft) {
    return alreadyDraft ? title : `Draft: ${title}`;
  }
  return title;
}

async function request(
  cfg: GitLabConfig,
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
      `GitLab API request failed for ${action}: HTTP ${result.status}\n${JSON.stringify(result.data)}`
    );
  }
}

/* -------------------------------------------------------------------------
 * Merge requests
 * ---------------------------------------------------------------------- */

export interface CreateGitLabMergeRequestInput {
  project: string; // numeric ID or "group/project"
  title: string;
  sourceBranch: string;
  targetBranch: string;
  description?: string;
  draft?: boolean;
  removeSourceBranch?: boolean;
  squash?: boolean;
  reviewerUsernames?: string[];
}

/** POST /projects/:id/merge_requests */
export async function createGitLabMergeRequest(
  cfg: GitLabConfig,
  input: CreateGitLabMergeRequestInput
): Promise<unknown> {
  const payload: Record<string, unknown> = {
    title: applyDraftPrefix(input.title, input.draft),
    source_branch: input.sourceBranch,
    target_branch: input.targetBranch,
  };
  if (input.description !== undefined) payload.description = input.description;
  if (input.removeSourceBranch !== undefined) payload.remove_source_branch = input.removeSourceBranch;
  if (input.squash !== undefined) payload.squash = input.squash;

  // Reviewers are IDs, not usernames -- resolve before the create call so a
  // bad username fails loudly here rather than producing an MR with no
  // reviewer and a success message.
  if (input.reviewerUsernames && input.reviewerUsernames.length > 0) {
    payload.reviewer_ids = await resolveUserIds(cfg, input.reviewerUsernames);
  }

  const result = await request(cfg, `/projects/${encodeProjectId(input.project)}/merge_requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assertOk(result, `create merge request in ${input.project}`);

  const data = result.data as Record<string, unknown>;
  return {
    iid: data.iid,
    id: data.id,
    title: data.title,
    state: data.state,
    draft: data.draft,
    web_url: data.web_url,
    source_branch: data.source_branch,
    target_branch: data.target_branch,
    reviewers: data.reviewers,
  };
}

/** GET /projects/:id/merge_requests/:merge_request_iid */
export async function getGitLabMergeRequest(
  cfg: GitLabConfig,
  project: string,
  mergeRequestIid: number
): Promise<unknown> {
  const result = await request(
    cfg,
    `/projects/${encodeProjectId(project)}/merge_requests/${mergeRequestIid}`,
    { method: "GET" }
  );
  assertOk(result, `get merge request ${project}!${mergeRequestIid}`);

  const data = result.data as Record<string, unknown>;
  return {
    iid: data.iid,
    title: data.title,
    state: data.state,
    draft: data.draft,
    merged_at: data.merged_at,
    merge_status: data.merge_status,
    web_url: data.web_url,
    source_branch: data.source_branch,
    target_branch: data.target_branch,
    reviewers: data.reviewers,
    author: data.author,
  };
}

/* -------------------------------------------------------------------------
 * Users / reviewers
 * ---------------------------------------------------------------------- */

/**
 * GET /users?username=<name>, once per name.
 *
 * A username that resolves to nothing throws. It would be easy to skip it and
 * assign the rest, but "review requested" is a claim the notification layer
 * repeats to humans -- a partially-applied reviewer list reported as success
 * is precisely the failure `/skill-submit` must never make.
 */
export async function resolveUserIds(cfg: GitLabConfig, usernames: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const username of usernames) {
    const result = await request(cfg, `/users?username=${encodeURIComponent(username)}`, {
      method: "GET",
    });
    assertOk(result, `look up GitLab user '${username}'`);
    const users = result.data as Array<{ id: number; username: string }>;
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error(
        `GitLab user '${username}' not found. Reviewer usernames must be GitLab usernames, not display names or emails.`
      );
    }
    ids.push(users[0].id);
  }
  return ids;
}

export interface RequestGitLabMrReviewersInput {
  project: string;
  mergeRequestIid: number;
  reviewerUsernames: string[];
  /**
   * false (default) unions the named reviewers with whoever is already on the
   * MR, matching GitHub's add-semantics. true replaces the list outright,
   * which is what GitLab's endpoint does natively.
   */
  replace?: boolean;
}

/**
 * PUT /projects/:id/merge_requests/:merge_request_iid  { reviewer_ids }
 *
 * GitLab replaces the reviewer list on every update. Defaulting to that
 * behaviour would mean the second call to this tool silently un-assigns the
 * reviewer the first call added -- the same class of silent-loss bug as the
 * version-bump race. Default is therefore additive.
 */
export async function requestGitLabMrReviewers(
  cfg: GitLabConfig,
  input: RequestGitLabMrReviewersInput
): Promise<unknown> {
  if (!input.reviewerUsernames || input.reviewerUsernames.length === 0) {
    throw new Error("requestGitLabMrReviewers needs at least one reviewer username.");
  }

  const requestedIds = await resolveUserIds(cfg, input.reviewerUsernames);

  let finalIds = requestedIds;
  if (!input.replace) {
    const current = (await getGitLabMergeRequest(cfg, input.project, input.mergeRequestIid)) as {
      reviewers?: Array<{ id: number }>;
    };
    const existingIds = (current.reviewers ?? []).map((r) => r.id);
    finalIds = Array.from(new Set([...existingIds, ...requestedIds]));
  }

  const result = await request(
    cfg,
    `/projects/${encodeProjectId(input.project)}/merge_requests/${input.mergeRequestIid}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewer_ids: finalIds }),
    }
  );
  assertOk(result, `request reviewers on ${input.project}!${input.mergeRequestIid}`);

  const data = result.data as Record<string, unknown>;
  return {
    iid: data.iid,
    web_url: data.web_url,
    reviewers: data.reviewers,
  };
}

/* -------------------------------------------------------------------------
 * Issues
 * ---------------------------------------------------------------------- */

export interface CreateGitLabIssueInput {
  project: string;
  title: string;
  description?: string;
  labels?: string[];
  assigneeUsernames?: string[];
}

/** POST /projects/:id/issues */
export async function createGitLabIssue(
  cfg: GitLabConfig,
  input: CreateGitLabIssueInput
): Promise<unknown> {
  const payload: Record<string, unknown> = { title: input.title };
  if (input.description !== undefined) payload.description = input.description;
  // GitLab takes labels as one comma-separated string, not a JSON array.
  if (input.labels && input.labels.length > 0) payload.labels = input.labels.join(",");
  if (input.assigneeUsernames && input.assigneeUsernames.length > 0) {
    payload.assignee_ids = await resolveUserIds(cfg, input.assigneeUsernames);
  }

  const result = await request(cfg, `/projects/${encodeProjectId(input.project)}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assertOk(result, `create issue in ${input.project}`);

  const data = result.data as Record<string, unknown>;
  return {
    iid: data.iid,
    id: data.id,
    title: data.title,
    state: data.state,
    web_url: data.web_url,
    labels: data.labels,
    assignees: data.assignees,
  };
}

/* -------------------------------------------------------------------------
 * Pipelines
 * ---------------------------------------------------------------------- */

/**
 * GET /projects/:id/pipelines/:pipeline_id
 *
 * GitLab's counterpart to get_github_workflow_run_status. GitLab folds
 * GitHub's two fields (status + conclusion) into one `status` value
 * (created/pending/running/success/failed/canceled/skipped/manual), so the
 * shapes are deliberately not forced to match -- returning a fake
 * `conclusion` key would invent data the API never sent.
 */
export async function getGitLabPipelineStatus(
  cfg: GitLabConfig,
  project: string,
  pipelineId: number
): Promise<unknown> {
  const result = await request(
    cfg,
    `/projects/${encodeProjectId(project)}/pipelines/${pipelineId}`,
    { method: "GET" }
  );
  assertOk(result, `get pipeline status for ${project}#${pipelineId}`);

  const data = result.data as Record<string, unknown>;
  return {
    id: data.id,
    status: data.status,
    ref: data.ref,
    sha: data.sha,
    web_url: data.web_url,
    created_at: data.created_at,
    finished_at: data.finished_at,
  };
}

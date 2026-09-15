/**
 * Confluence Cloud REST API client.
 *
 * This mirrors the logic of the bin/*-confluence-*.sh scripts from the
 * stockbookapp repo, re-implemented in TypeScript so it can be exposed as MCP
 * tools. It exists specifically because Atlassian's own hosted Rovo MCP
 * server's `createConfluencePage` tool returned a persistent 404 across every
 * parameter combination we tried (multiple spaces, both key and numeric
 * spaceId, contentFormat html/markdown, parentId present/absent, status
 * current/draft, two separate Rovo MCP connector instances) while every
 * read-only Rovo operation on the same OAuth session succeeded and the
 * write:page:confluence scope was present. A manual page creation via the
 * real Confluence UI, with the same account, succeeded -- proving the blocker
 * is specific to that hosted route, not a permissions problem.
 *
 * Auth: HTTP Basic with an Atlassian account email + API token
 * (https://id.atlassian.com/manage-profile/security/api-tokens), exactly like
 * the shell scripts this replaces.
 *
 * API-version note, deliberate and not an inconsistency: pages and spaces use
 * the v2 API (`/wiki/api/v2/...`), but CQL search uses v1
 * (`/wiki/rest/api/search`). Atlassian has not shipped a v2 CQL search
 * endpoint; using v1 there is the documented route, not a fallback to a
 * deprecated path for convenience.
 */

import { basicAuthHeader, fetchWithRetry, readJsonBody } from "./lib/http.js";

export interface ConfluenceConfig {
  site: string; // e.g. https://your-site.atlassian.net (no trailing slash)
  email: string;
  apiToken: string;
}

export interface CreatePageInput {
  spaceId: string; // numeric space ID, or a space key to be resolved
  title: string;
  bodyHtml: string; // Confluence "storage format" HTML
  parentId?: string;
  status?: "current" | "draft";
}

export interface CreatePageResult {
  id: string;
  title: string;
  version: number;
  url: string;
  raw: unknown;
}

function authHeaders(cfg: ConfluenceConfig): Record<string, string> {
  return {
    Authorization: basicAuthHeader(cfg.email, cfg.apiToken),
    Accept: "application/json",
  };
}

/**
 * Now routed through the shared fetchWithRetry (Phase 2 refactor) rather than
 * a bare fetch(), so Confluence gets the same transient-failure policy as
 * every other client here: retry only timeout/429/5xx, never a 4xx, fixed
 * 2s/5s backoff, 3 attempts.
 */
async function confluenceFetch(
  cfg: ConfluenceConfig,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = `${cfg.site.replace(/\/$/, "")}${path}`;
  return fetchWithRetry(url, {
    ...init,
    headers: { ...authHeaders(cfg), ...(init.headers ?? {}) },
  });
}

async function requestJson(
  cfg: ConfluenceConfig,
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await confluenceFetch(cfg, path, init);
  const data = await readJsonBody(res);
  return { ok: res.ok, status: res.status, data };
}

function assertOk(
  result: { ok: boolean; status: number; data: unknown },
  action: string
): void {
  if (!result.ok) {
    throw new Error(
      `Confluence API request failed for ${action}: HTTP ${result.status}\n${JSON.stringify(result.data)}`
    );
  }
}

function webUrl(cfg: ConfluenceConfig, links: unknown): string {
  const webui = (links as { webui?: string } | undefined)?.webui ?? "";
  return webui ? cfg.site.replace(/\/$/, "") + webui : "";
}

/**
 * Resolve a Confluence space key (e.g. "DAS") to its numeric space ID.
 * If spaceIdOrKey is already numeric, returns it unchanged.
 */
export async function resolveSpaceId(
  cfg: ConfluenceConfig,
  spaceIdOrKey: string
): Promise<string> {
  if (/^\d+$/.test(spaceIdOrKey)) {
    return spaceIdOrKey;
  }
  const result = await requestJson(
    cfg,
    `/wiki/api/v2/spaces?keys=${encodeURIComponent(spaceIdOrKey)}`
  );
  assertOk(result, `resolve space key '${spaceIdOrKey}'`);
  const data = result.data as { results?: Array<{ id: string }> };
  const id = data.results?.[0]?.id;
  if (!id) {
    throw new Error(`Could not resolve space key '${spaceIdOrKey}' to a numeric ID.`);
  }
  return id;
}

export async function createConfluencePage(
  cfg: ConfluenceConfig,
  input: CreatePageInput
): Promise<CreatePageResult> {
  const spaceId = await resolveSpaceId(cfg, input.spaceId);

  const payload: Record<string, unknown> = {
    spaceId,
    status: input.status ?? "current",
    title: input.title,
    body: {
      representation: "storage",
      value: input.bodyHtml,
    },
  };
  if (input.parentId) {
    payload.parentId = input.parentId;
  }

  const result = await requestJson(cfg, "/wiki/api/v2/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assertOk(result, `create page '${input.title}'`);

  const data = result.data as {
    id: string;
    title: string;
    version?: { number: number };
    _links?: { webui?: string };
  };

  return {
    id: data.id,
    title: data.title,
    version: data.version?.number ?? 0,
    url: webUrl(cfg, data._links),
    raw: data,
  };
}

/* -------------------------------------------------------------------------
 * Phase 2 -- read/update/search parity
 * ---------------------------------------------------------------------- */

export interface GetPageInput {
  pageId: string;
  /** "storage" (default) returns the raw editable HTML; "atlas_doc_format"
   *  and "view" are the other shapes Confluence can render. */
  bodyFormat?: "storage" | "atlas_doc_format" | "view";
}

/** GET /wiki/api/v2/pages/{id} */
export async function getConfluencePage(
  cfg: ConfluenceConfig,
  input: GetPageInput
): Promise<unknown> {
  const fmt = input.bodyFormat ?? "storage";
  const result = await requestJson(
    cfg,
    `/wiki/api/v2/pages/${encodeURIComponent(input.pageId)}?body-format=${fmt}`
  );
  assertOk(result, `get page ${input.pageId}`);

  const data = result.data as Record<string, any>;
  return {
    id: data.id,
    title: data.title,
    status: data.status,
    spaceId: data.spaceId,
    parentId: data.parentId,
    version: data.version?.number,
    body: data.body?.[fmt]?.value ?? data.body?.storage?.value ?? null,
    url: webUrl(cfg, data._links),
  };
}

export interface UpdatePageInput {
  pageId: string;
  title: string;
  bodyHtml: string;
  status?: "current" | "draft";
  /**
   * Optional. Confluence rejects an update whose version is not exactly
   * current + 1. Left unset (the normal case) this client reads the page's
   * current version first and increments it. Set it explicitly only to make
   * an update fail deliberately when someone else has edited the page since
   * you read it -- optimistic concurrency, the same contract memory writes
   * use.
   */
  expectedCurrentVersion?: number;
  versionMessage?: string;
}

/**
 * PUT /wiki/api/v2/pages/{id}
 *
 * The version dance is the whole reason this is not a one-liner. Confluence
 * requires the NEW version number, which must be exactly current + 1; sending
 * the current number, or omitting it, fails. Reading the current version here
 * rather than making every caller do it is what keeps `/pull-confluence` and
 * the doc-ingest skills from each reimplementing the same increment slightly
 * differently.
 */
export async function updateConfluencePage(
  cfg: ConfluenceConfig,
  input: UpdatePageInput
): Promise<CreatePageResult> {
  const current = (await getConfluencePage(cfg, { pageId: input.pageId })) as {
    version?: number;
    status?: string;
  };
  const currentVersion = current.version ?? 0;

  if (
    input.expectedCurrentVersion !== undefined &&
    input.expectedCurrentVersion !== currentVersion
  ) {
    throw new Error(
      `Confluence page ${input.pageId} is at version ${currentVersion}, not the expected ${input.expectedCurrentVersion}. ` +
        `Someone edited it since you read it -- re-read the page, merge your change, and retry.`
    );
  }

  const payload: Record<string, unknown> = {
    id: input.pageId,
    status: input.status ?? current.status ?? "current",
    title: input.title,
    body: {
      representation: "storage",
      value: input.bodyHtml,
    },
    version: {
      number: currentVersion + 1,
      ...(input.versionMessage ? { message: input.versionMessage } : {}),
    },
  };

  const result = await requestJson(cfg, `/wiki/api/v2/pages/${encodeURIComponent(input.pageId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assertOk(result, `update page ${input.pageId}`);

  const data = result.data as {
    id: string;
    title: string;
    version?: { number: number };
    _links?: { webui?: string };
  };

  return {
    id: data.id,
    title: data.title,
    version: data.version?.number ?? currentVersion + 1,
    url: webUrl(cfg, data._links),
    raw: data,
  };
}

export interface SearchConfluenceInput {
  cql: string; // e.g. 'space = "DAS" AND type = page AND text ~ "onboarding"'
  limit?: number;
}

/**
 * GET /wiki/rest/api/search?cql=...
 *
 * v1 on purpose -- see the API-version note at the top of this file.
 */
export async function searchConfluence(
  cfg: ConfluenceConfig,
  input: SearchConfluenceInput
): Promise<unknown> {
  const limit = input.limit ?? 25;
  const result = await requestJson(
    cfg,
    `/wiki/rest/api/search?cql=${encodeURIComponent(input.cql)}&limit=${limit}`
  );
  assertOk(result, `search with CQL '${input.cql}'`);

  const data = result.data as { results?: Array<Record<string, any>>; size?: number };
  return {
    size: data.size ?? data.results?.length ?? 0,
    results: (data.results ?? []).map((r) => ({
      id: r.content?.id ?? r.id,
      type: r.content?.type ?? r.entityType,
      title: r.content?.title ?? r.title,
      spaceKey: r.resultGlobalContainer?.title ?? r.space?.key,
      excerpt: r.excerpt,
      url: r.url ? cfg.site.replace(/\/$/, "") + "/wiki" + r.url : undefined,
    })),
  };
}

export interface ListSpacesInput {
  keys?: string[];
  limit?: number;
}

/** GET /wiki/api/v2/spaces */
export async function listConfluenceSpaces(
  cfg: ConfluenceConfig,
  input: ListSpacesInput = {}
): Promise<unknown> {
  const params = new URLSearchParams();
  if (input.keys && input.keys.length > 0) params.set("keys", input.keys.join(","));
  params.set("limit", String(input.limit ?? 50));

  const result = await requestJson(cfg, `/wiki/api/v2/spaces?${params.toString()}`);
  assertOk(result, "list spaces");

  const data = result.data as { results?: Array<Record<string, any>> };
  return {
    results: (data.results ?? []).map((s) => ({
      id: s.id,
      key: s.key,
      name: s.name,
      type: s.type,
      status: s.status,
      homepageId: s.homepageId,
    })),
  };
}

export function loadConfigFromEnv(): ConfluenceConfig {
  const site = process.env.CONFLUENCE_SITE;
  const email = process.env.ATLASSIAN_EMAIL;
  const apiToken = process.env.ATLASSIAN_API_TOKEN;

  const missing = [
    !site && "CONFLUENCE_SITE",
    !email && "ATLASSIAN_EMAIL",
    !apiToken && "ATLASSIAN_API_TOKEN",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. See .env.example.`
    );
  }

  return { site: site!, email: email!, apiToken: apiToken! };
}

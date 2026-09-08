/**
 * Minimal Confluence Cloud REST API v2 client.
 *
 * This mirrors the logic of bin/create-confluence-page.sh from the
 * stockbookapp repo (a curl+python script written earlier in the same
 * investigation), re-implemented in TypeScript so it can be exposed as an
 * MCP tool. It exists specifically because Atlassian's own hosted Rovo MCP
 * server's `createConfluencePage` tool returned a persistent 404 across
 * every parameter combination we tried (multiple spaces, both key and
 * numeric spaceId, contentFormat html/markdown, parentId present/absent,
 * status current/draft, two separate Rovo MCP connector instances) while
 * every read-only Rovo operation on the same OAuth session succeeded and
 * the write:page:confluence scope was present. A manual page creation via
 * the real Confluence UI, with the same account, succeeded -- proving the
 * blocker is specific to that hosted route, not a permissions problem.
 *
 * Auth: HTTP Basic with an Atlassian account email + API token
 * (https://id.atlassian.com/manage-profile/security/api-tokens), exactly
 * like the shell script this replaces.
 */

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

function authHeader(cfg: ConfluenceConfig): string {
  const basic = Buffer.from(`${cfg.email}:${cfg.apiToken}`).toString("base64");
  return `Basic ${basic}`;
}

async function confluenceFetch(
  cfg: ConfluenceConfig,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = `${cfg.site.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: authHeader(cfg),
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
  return res;
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
  const res = await confluenceFetch(
    cfg,
    `/wiki/api/v2/spaces?keys=${encodeURIComponent(spaceIdOrKey)}`
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Confluence API request failed resolving space key '${spaceIdOrKey}': ${res.status} ${res.statusText}\n${body}`
    );
  }
  const data = (await res.json()) as { results?: Array<{ id: string }> };
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

  const res = await confluenceFetch(cfg, "/wiki/api/v2/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Confluence API request failed creating page '${input.title}': ${res.status} ${res.statusText}\n${JSON.stringify(raw)}`
    );
  }

  const data = raw as {
    id: string;
    title: string;
    version?: { number: number };
    _links?: { webui?: string };
  };

  const webui = data._links?.webui ?? "";
  const url = webui ? cfg.site.replace(/\/$/, "") + webui : "";

  return {
    id: data.id,
    title: data.title,
    version: data.version?.number ?? 0,
    url,
    raw: data,
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

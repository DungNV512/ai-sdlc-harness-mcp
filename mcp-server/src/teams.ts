/**
 * Microsoft Teams notification client (Phase 4).
 *
 * IMPORTANT -- which Teams mechanism this uses, and why:
 *
 * Microsoft RETIRED the classic Office 365 Connector "Incoming Webhook".
 * The current supported path is the **Workflows** app (Power Automate):
 * in a channel or chat, More options -> Workflows -> a "webhook alerts"
 * template -> Save -> copy the generated URL. That URL looks like
 * https://<env>.environment.api.powerplatform.com/powerautomate/... and
 * accepts the same JSON body shape as the old connector, including the
 * `type: "message"` + `attachments[]` Adaptive Card envelope used below.
 * This file targets that current path, not the retired one.
 *
 * Auth: the webhook URL IS the credential -- it carries a `sig=` signature
 * query parameter, so anyone holding the URL can post to that chat. It is
 * therefore read from the TEAMS_WEBHOOK_URL environment variable and is
 * NEVER committed to this repository (which is public) and NEVER echoed
 * back in an error message -- see redactWebhookUrl below.
 *
 * Documented platform limits applied here:
 *   - message size 28 KB max (exceeding it triggers an opaque error), so
 *     this checks the size itself and fails with a clear message instead.
 *   - >4 requests/second is throttled; fetchWithRetry already retries 429
 *     with backoff.
 */

import { fetchWithRetry } from "./lib/http.js";

const MAX_PAYLOAD_BYTES = 28 * 1024;

export type TeamsSeverity = "info" | "success" | "warning" | "danger";

/** Adaptive Card TextBlock colors. Maps our severity vocabulary to theirs. */
const SEVERITY_COLOR: Record<TeamsSeverity, string> = {
  info: "accent",
  success: "good",
  warning: "warning",
  danger: "attention",
};

export interface TeamsConfig {
  webhookUrl: string;
}

export function loadTeamsConfigFromEnv(): TeamsConfig {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error(
      "Missing required environment variable(s): TEAMS_WEBHOOK_URL. See .env.example. " +
        "Create it in Teams via: channel/chat -> More options -> Workflows -> a webhook-alert template -> Save -> copy URL."
    );
  }
  return { webhookUrl };
}

/**
 * Strips the `sig` query parameter before a URL can reach an error message,
 * a log line, or an MCP tool result. Without this, one failed request would
 * leak a working post-to-our-chat credential into a transcript.
 */
export function redactWebhookUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.has("sig")) u.searchParams.set("sig", "REDACTED");
    return u.toString();
  } catch {
    return "<unparseable webhook url>";
  }
}

export interface TeamsFact {
  name: string;
  value: string;
}

export interface TeamsAction {
  title: string;
  url: string;
}

export interface SendTeamsMessageInput {
  title: string;
  text: string;
  severity?: TeamsSeverity;
  facts?: TeamsFact[];
  actions?: TeamsAction[];
}

/** Builds the Workflows-compatible Adaptive Card envelope. */
export function buildAdaptiveCardPayload(input: SendTeamsMessageInput): unknown {
  const severity = input.severity ?? "info";
  const body: unknown[] = [
    {
      type: "TextBlock",
      text: input.title,
      weight: "Bolder",
      size: "Medium",
      wrap: true,
      color: SEVERITY_COLOR[severity],
    },
    { type: "TextBlock", text: input.text, wrap: true },
  ];

  if (input.facts && input.facts.length > 0) {
    body.push({
      type: "FactSet",
      facts: input.facts.map((f) => ({ title: f.name, value: f.value })),
    });
  }

  const card: Record<string, unknown> = {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
    body,
  };

  if (input.actions && input.actions.length > 0) {
    card.actions = input.actions.map((a) => ({
      type: "Action.OpenUrl",
      title: a.title,
      url: a.url,
    }));
  }

  return {
    type: "message",
    attachments: [
      { contentType: "application/vnd.microsoft.card.adaptive", content: card },
    ],
  };
}

export interface SendTeamsMessageResult {
  status: number;
  ok: boolean;
  /** Response body, when the endpoint returns one. Workflows often returns 202 with an empty body. */
  body: string;
}

export async function sendTeamsMessage(
  cfg: TeamsConfig,
  input: SendTeamsMessageInput
): Promise<SendTeamsMessageResult> {
  const payload = buildAdaptiveCardPayload(input);
  const serialized = JSON.stringify(payload);
  const bytes = Buffer.byteLength(serialized, "utf8");

  if (bytes > MAX_PAYLOAD_BYTES) {
    throw new Error(
      `Teams message is ${bytes} bytes, over the documented ${MAX_PAYLOAD_BYTES}-byte limit. ` +
        "Shorten `text`, or move detail behind an Action.OpenUrl link."
    );
  }

  let res: Response;
  try {
    res = await fetchWithRetry(cfg.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: serialized,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Teams webhook request failed (network/timeout) for ${redactWebhookUrl(cfg.webhookUrl)}: ${reason}`
    );
  }

  const body = await res.text();

  if (!res.ok) {
    throw new Error(
      `Teams webhook returned HTTP ${res.status} for ${redactWebhookUrl(cfg.webhookUrl)}: ${body.slice(0, 500)}`
    );
  }

  return { status: res.status, ok: true, body };
}

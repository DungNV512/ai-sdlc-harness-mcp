/**
 * Shared HTTP helpers for every platform client in this server.
 *
 * fetchWithRetry mirrors bin/lib/retry.sh from the stockbookapp repo
 * exactly, on purpose (see that file's own comments for the reasoning):
 *
 *   - Retries ONLY transient failure classes: a network/timeout failure
 *     (fetch throws before an HTTP status comes back -- retry.sh's "000"),
 *     HTTP 429 (rate limited), and HTTP 5xx (upstream server error).
 *   - NEVER retries 4xx other than 429 -- those are real errors and
 *     retrying only delays a correct failure.
 *   - Backoff is a fixed (2s, 5s) pair, not exponential. 3 attempts max,
 *     7s of added delay worst case -- a bulk run must not stall on one
 *     bad request.
 */

const RETRY_DELAYS_MS = [2000, 5000];
const MAX_ATTEMPTS = 1 + RETRY_DELAYS_MS.length; // 3

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

export async function fetchWithRetry(url: string, init: RequestInit = {}): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok || !isTransientStatus(res.status)) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status} ${res.statusText}`);
      if (attempt === MAX_ATTEMPTS - 1) {
        return res; // exhausted retries; let the caller inspect the final response
      }
    } catch (err) {
      lastError = err;
      if (attempt === MAX_ATTEMPTS - 1) {
        throw err;
      }
    }
    await sleep(RETRY_DELAYS_MS[attempt]);
  }

  // Unreachable, but keeps TypeScript satisfied.
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export function basicAuthHeader(user: string, token: string): string {
  return `Basic ${Buffer.from(`${user}:${token}`).toString("base64")}`;
}

export async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

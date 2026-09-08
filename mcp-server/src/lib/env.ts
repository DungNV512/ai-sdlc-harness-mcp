/**
 * Shared environment-variable loading/validation for every platform client
 * in this server. Mirrors bin/lib/auth.sh's contract from the stockbookapp
 * repo (fail loudly, name exactly which var is missing) rather than
 * inventing a new convention.
 */

export function requireEnv(names: string[]): Record<string, string> {
  const values: Record<string, string> = {};
  const missing: string[] = [];

  for (const name of names) {
    const v = process.env[name];
    if (!v) {
      missing.push(name);
    } else {
      values[name] = v;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. See .env.example.`
    );
  }

  return values;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

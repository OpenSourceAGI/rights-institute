import { env as cfEnv } from "cloudflare:workers";

/** The Cloudflare Worker runtime env, or an empty object outside Workers. */
function runtimeEnv(): Record<string, unknown> {
  try {
    return (cfEnv ?? {}) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function getEnv(key: string): string | undefined {
  const value = runtimeEnv()[key];
  if (typeof value === "string") return value;
  try {
    return process.env[key];
  } catch {
    return undefined;
  }
}

/**
 * A Cloudflare *binding* (D1, KV, R2, a service…) from the Worker runtime env.
 *
 * Bindings are live objects, not strings, so getEnv() can never return one.
 * They also differ from vars and secrets in a way that matters here: a binding
 * is part of the deployed Worker's configuration in `wrangler.jsonc`, so it is
 * always present in a deployed build and cannot be lost the way a dashboard
 * variable can. That is why the database is read from the `DB` binding first.
 */
export function getBinding<T = unknown>(key: string): T | undefined {
  const value = runtimeEnv()[key];
  return value && typeof value === "object" ? (value as T) : undefined;
}

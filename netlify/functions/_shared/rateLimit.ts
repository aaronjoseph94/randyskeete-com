/** Failed-login throttle keyed by a hash of the client IP. */
import { createHash } from "node:crypto";
import { LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS } from "./constants";
import { readJson, writeJson } from "./store";

type Bucket = {
  count: number;
  resetAt: number;
};

function bucketKey(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function loginAllowed(ip: string) {
  const bucket = await readJson<Bucket>("rate-limit", bucketKey(ip));
  if (!bucket || Date.now() > bucket.resetAt) return { ok: true as const };
  if (bucket.count >= LOGIN_MAX_ATTEMPTS) {
    return { ok: false as const, retryAfter: Math.ceil((bucket.resetAt - Date.now()) / 1000) };
  }
  return { ok: true as const };
}

export async function recordLoginFailure(ip: string) {
  const key = bucketKey(ip);
  const current = await readJson<Bucket>("rate-limit", key);
  const now = Date.now();
  if (!current || now > current.resetAt) {
    await writeJson("rate-limit", key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  await writeJson("rate-limit", key, { count: current.count + 1, resetAt: current.resetAt });
}

export async function clearLoginFailures(ip: string) {
  await writeJson("rate-limit", bucketKey(ip), { count: 0, resetAt: 0 });
}

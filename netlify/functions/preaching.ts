/**
 * /api/preaching
 * GET  — public preaching location
 * POST — one-shot password + text update (rate-limited; no lasting session)
 */
import type { Config, Context } from "@netlify/functions";
import { DEFAULT_PREACHING_TEXT, MAX_PREACHING_CHARS } from "./_shared/constants";
import { env } from "./_shared/env";
import { clientIp, jsonNoStore, originAllowed, readJsonBody } from "./_shared/http";
import { passwordMatches } from "./_shared/password";
import { clearLoginFailures, loginAllowed, recordLoginFailure } from "./_shared/rateLimit";
import { readJson, writeJson } from "./_shared/store";
import type { PreachingRecord } from "./_shared/types";

const EMPTY: PreachingRecord = {
  text: DEFAULT_PREACHING_TEXT,
  updatedAt: null,
};

/** Strip control chars (except tab/LF/CR) and trim. */
function sanitizeText(input: string) {
  let cleaned = "";
  for (const character of input) {
    const code = character.codePointAt(0) ?? 0;
    if (code === 9 || code === 10 || code === 13 || code >= 32) cleaned += character;
  }
  return cleaned.trim();
}

async function saveLocation(textRaw: string) {
  const text = sanitizeText(textRaw);
  if (!text) return { ok: false as const, error: "Please enter this week’s location.", status: 400 };
  if (text.length > MAX_PREACHING_CHARS) {
    return { ok: false as const, error: "That message is too long.", status: 400 };
  }
  const record: PreachingRecord = { text, updatedAt: new Date().toISOString() };
  await writeJson("site-content", "preaching", record);
  return { ok: true as const, record };
}

export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const record = (await readJson<PreachingRecord>("site-content", "preaching")) ?? EMPTY;
    return jsonNoStore({ text: record.text, updatedAt: record.updatedAt ?? null });
  }

  if (req.method !== "POST") {
    return jsonNoStore({ error: "Method not allowed." }, 405, { Allow: "GET, POST" });
  }

  if (!originAllowed(req)) {
    return jsonNoStore({ error: "Forbidden." }, 403);
  }

  const ip = context.ip || clientIp(req);
  const secret = env("ADMIN_PASSWORD");
  if (!secret) return jsonNoStore({ error: "Editor is not configured." }, 500);

  const limited = await loginAllowed(ip);
  if (!limited.ok) {
    return jsonNoStore({ error: "Too many attempts. Try again later." }, 429, {
      "Retry-After": String(limited.retryAfter),
    });
  }

  const parsed = await readJsonBody<{ password?: string; text?: string }>(req);
  if (!parsed.ok) return jsonNoStore({ error: parsed.error }, 400);

  const password = typeof parsed.body.password === "string" ? parsed.body.password : "";
  const text = typeof parsed.body.text === "string" ? parsed.body.text : "";

  if (!password || !passwordMatches(password, secret)) {
    if (password) await recordLoginFailure(ip);
    return jsonNoStore({ error: "Incorrect password." }, 401);
  }

  await clearLoginFailures(ip);

  const saved = await saveLocation(text);
  if (!saved.ok) return jsonNoStore({ error: saved.error }, saved.status);
  return jsonNoStore(saved.record);
};

export const config: Config = {
  path: "/api/preaching",
  method: ["GET", "POST"],
};

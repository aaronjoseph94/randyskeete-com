/**
 * /api/preaching
 * GET  — public location text
 * POST — login (password) OR one-shot update ({ password, text })
 * PUT  — save text with session cookie
 * DELETE — clear session cookie
 */
import type { Config, Context } from "@netlify/functions";
import { DEFAULT_PREACHING_TEXT, MAX_PREACHING_CHARS } from "./_shared/constants";
import { env } from "./_shared/env";
import { clientIp, jsonNoStore, originAllowed, readJsonBody } from "./_shared/http";
import { passwordMatches } from "./_shared/password";
import { clearLoginFailures, loginAllowed, recordLoginFailure } from "./_shared/rateLimit";
import {
  createSession,
  readCookie,
  sessionClearCookie,
  sessionSetCookie,
  verifySession,
} from "./_shared/session";
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

  if (!originAllowed(req)) {
    return jsonNoStore({ error: "Forbidden." }, 403);
  }

  const ip = context.ip || clientIp(req);
  const secret = env("ADMIN_PASSWORD");
  if (!secret) return jsonNoStore({ error: "Editor is not configured." }, 500);

  if (req.method === "DELETE") {
    return jsonNoStore({ ok: true }, 200, { "Set-Cookie": sessionClearCookie(req) });
  }

  if (req.method === "POST") {
    const parsed = await readJsonBody<{ password?: string; text?: string }>(req);
    if (!parsed.ok) return jsonNoStore({ error: parsed.error }, 400);

    // Confirm existing session without a password.
    if (!parsed.body.password && verifySession(readCookie(req), secret)) {
      return jsonNoStore({ ok: true });
    }

    const limited = await loginAllowed(ip);
    if (!limited.ok) {
      return jsonNoStore({ error: "Too many attempts. Try again later." }, 429, {
        "Retry-After": String(limited.retryAfter),
      });
    }

    const password = parsed.body.password ?? "";
    if (!password || !passwordMatches(password, secret)) {
      if (password) await recordLoginFailure(ip);
      return jsonNoStore({ error: "Incorrect password." }, 401);
    }

    await clearLoginFailures(ip);

    // One-shot update from the footer editor (password + text together).
    if (typeof parsed.body.text === "string") {
      const saved = await saveLocation(parsed.body.text);
      if (!saved.ok) return jsonNoStore({ error: saved.error }, saved.status);
      return jsonNoStore(saved.record);
    }

    return jsonNoStore({ ok: true }, 200, { "Set-Cookie": sessionSetCookie(createSession(secret), req) });
  }

  if (req.method === "PUT") {
    if (!verifySession(readCookie(req), secret)) {
      return jsonNoStore({ error: "Please log in again." }, 401);
    }

    const parsed = await readJsonBody<{ text?: string }>(req);
    if (!parsed.ok) return jsonNoStore({ error: parsed.error }, 400);

    const saved = await saveLocation(parsed.body.text ?? "");
    if (!saved.ok) return jsonNoStore({ error: saved.error }, saved.status);
    return jsonNoStore(saved.record);
  }

  return jsonNoStore({ error: "Method not allowed." }, 405, { Allow: "GET, POST, PUT, DELETE" });
};

export const config: Config = {
  path: "/api/preaching",
  method: ["GET", "POST", "PUT", "DELETE"],
};

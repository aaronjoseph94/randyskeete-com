/**
 * JSON responses, body parsing, client IP, and same-origin checks for mutations.
 */
import { MAX_BODY_BYTES } from "./constants";

const API_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

/** Allowed hostnames for mutating Origin (browser CSRF mitigation). */
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8888",
  "http://127.0.0.1:8888",
  "https://randyskeete.com",
  "https://www.randyskeete.com",
]);

export function json(data: unknown, status = 200, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...API_HEADERS,
      "Cache-Control": status === 200 ? "public, max-age=0, must-revalidate" : "no-store",
      ...extra,
    },
  });
}

export function jsonNoStore(data: unknown, status = 200, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...API_HEADERS,
      "Cache-Control": "no-store",
      ...extra,
    },
  });
}

/**
 * Require an explicit Origin for mutations.
 * Preview deploys under *.netlify.app are allowed when they match this project slug.
 */
export function originAllowed(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "https:") return false;
    return hostname === "famous-griffin-b0f5c9.netlify.app" || hostname.endsWith("--famous-griffin-b0f5c9.netlify.app");
  } catch {
    return false;
  }
}

export async function readJsonBody<T>(req: Request): Promise<{ ok: true; body: T } | { ok: false; error: string }> {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return { ok: false, error: "Request is too large." };
  if (!raw) return { ok: true, body: {} as T };
  try {
    return { ok: true, body: JSON.parse(raw) as T };
  } catch {
    return { ok: false, error: "Invalid request." };
  }
}

export function clientIp(req: Request, fallback = "unknown") {
  const forwarded = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for");
  if (!forwarded) return fallback;
  return forwarded.split(",")[0]?.trim() || fallback;
}

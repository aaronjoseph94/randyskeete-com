/** JSON responses and same-origin checks for mutating routes. */
import { MAX_BODY_BYTES } from "./constants";

const API_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

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

export function originAllowed(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "randyskeete.com" ||
      hostname === "www.randyskeete.com" ||
      hostname.endsWith(".netlify.app")
    );
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

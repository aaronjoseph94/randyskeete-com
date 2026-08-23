/**
 * Client helpers for the preaching-location API.
 * The footer editor uses a one-shot POST (password + text) — no password is stored in the browser.
 */
import type { PreachingRecord } from "../lib/types";

const JSON_HEADERS = { "Content-Type": "application/json" };

async function parse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

/** Public read of the current location string. */
export async function getPreaching(signal?: AbortSignal) {
  const response = await fetch("/api/preaching", { signal });
  return parse<PreachingRecord>(response);
}

/**
 * Password-gated location update for the footer editor.
 * Rate-limited on the server; does not create a lasting browser session.
 */
export async function updateLocation(password: string, text: string) {
  const response = await fetch("/api/preaching", {
    method: "POST",
    credentials: "include",
    headers: JSON_HEADERS,
    body: JSON.stringify({ password, text }),
  });
  return parse<PreachingRecord>(response);
}

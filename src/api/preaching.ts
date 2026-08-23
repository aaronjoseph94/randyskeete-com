import type { PreachingRecord } from "../lib/types";

const JSON_HEADERS = { "Content-Type": "application/json" };

async function parse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export async function getPreaching(signal?: AbortSignal) {
  const response = await fetch("/api/preaching", { signal });
  return parse<PreachingRecord>(response);
}

export async function confirmEditorSession() {
  const response = await fetch("/api/preaching", {
    method: "POST",
    credentials: "include",
    headers: JSON_HEADERS,
    body: "{}",
  });
  if (response.status === 401) return false;
  await parse<{ ok: boolean }>(response);
  return true;
}

export async function loginEditor(password: string) {
  const response = await fetch("/api/preaching", {
    method: "POST",
    credentials: "include",
    headers: JSON_HEADERS,
    body: JSON.stringify({ password }),
  });
  await parse<{ ok: boolean }>(response);
}

export async function savePreaching(text: string) {
  const response = await fetch("/api/preaching", {
    method: "PUT",
    credentials: "include",
    headers: JSON_HEADERS,
    body: JSON.stringify({ text }),
  });
  return parse<PreachingRecord>(response);
}

export async function logoutEditor() {
  await fetch("/api/preaching", { method: "DELETE", credentials: "include" });
}

/** Fetch the playlist sermons from the Netlify Function. */
import type { Sermon } from "../lib/types";

export async function fetchSermons(signal?: AbortSignal): Promise<Sermon[]> {
  const response = await fetch("/api/sermons", { signal });
  const data = (await response.json()) as { sermons?: Sermon[]; error?: string };
  if (!response.ok) throw new Error(data.error || "Unable to load sermons.");
  return data.sermons ?? [];
}

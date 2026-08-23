import type { Config } from "@netlify/functions";
import { env } from "./_shared/env";
import { readJson, writeJson } from "./_shared/store";

const PLAYLIST_ID = "PLEHUwFohE59Y-dMNNWFzFn1c7lfNYKzXt";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const SKIP_TITLES = new Set(["private video", "deleted video"]);

export type Sermon = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
};

type CachePayload = {
  fetchedAt: number;
  sermons: Sermon[];
};

type PlaylistItem = {
  snippet?: {
    title?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
    resourceId?: { videoId?: string };
    videoOwnerChannelTitle?: string;
    videoOwnerChannelId?: string;
  };
};

type PlaylistResponse = {
  items?: PlaylistItem[];
  nextPageToken?: string;
  error?: { message?: string };
};

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": status === 200 ? "public, max-age=300" : "no-store",
      ...extraHeaders,
    },
  });
}

function mapItem(item: PlaylistItem): Sermon | null {
  const snippet = item.snippet;
  const id = snippet?.resourceId?.videoId;
  const title = snippet?.title?.trim();
  if (!id || !title || SKIP_TITLES.has(title.toLowerCase())) return null;

  const channelName = snippet.videoOwnerChannelTitle?.trim() ?? "";
  const channelId = snippet.videoOwnerChannelId?.trim() ?? "";

  return {
    id,
    title,
    publishedAt: snippet.publishedAt ?? "",
    thumbnail:
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    channelName,
    channelId,
  };
}

async function fetchPlaylist(apiKey: string): Promise<Sermon[]> {
  const sermons: Sermon[] = [];
  let pageToken = "";

  for (let page = 0; page < 20; page += 1) {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", PLAYLIST_ID);
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { Referer: "https://randyskeete.com/" },
    });
    const payload = (await response.json()) as PlaylistResponse;

    if (!response.ok) {
      throw new Error(payload.error?.message || `YouTube API error (${response.status})`);
    }

    for (const item of payload.items ?? []) {
      const sermon = mapItem(item);
      if (sermon) sermons.push(sermon);
    }

    if (!payload.nextPageToken) break;
    pageToken = payload.nextPageToken;
  }

  return sermons;
}

export default async () => {
  const cached = await readJson<CachePayload>("sermons", "playlist");
  const fresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;

  if (fresh) {
    return json({ sermons: cached.sermons, cached: true });
  }

  const apiKey = env("YOUTUBE_API_KEY");
  if (!apiKey) {
    if (cached?.sermons?.length) return json({ sermons: cached.sermons, cached: true });
    return json({ error: "YouTube API key is not configured." }, 500);
  }

  try {
    const sermons = await fetchPlaylist(apiKey);
    await writeJson("sermons", "playlist", { fetchedAt: Date.now(), sermons });
    return json({ sermons, cached: false });
  } catch (error) {
    if (cached?.sermons?.length) return json({ sermons: cached.sermons, cached: true });
    const message = error instanceof Error ? error.message : "Unable to load sermons.";
    return json({ error: message }, 502);
  }
};

export const config: Config = {
  path: "/api/sermons",
  method: "GET",
};

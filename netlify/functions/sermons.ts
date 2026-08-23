/**
 * GET /api/sermons — playlist items with the *uploader* credited, never the playlist owner.
 * Cached in Blobs; stale responses are served instantly while refresh runs in the background.
 */
import type { Config, Context } from "@netlify/functions";
import { CACHE_TTL_MS, CACHE_VERSION, PLAYLIST_ID, YOUTUBE_REFERER } from "./_shared/constants";
import { env } from "./_shared/env";
import { json } from "./_shared/http";
import { deleteKey, readJson, writeJson } from "./_shared/store";
import type { Sermon } from "./_shared/types";

const SKIP_TITLES = new Set(["private video", "deleted video"]);
const VIDEO_ID = /^[\w-]{11}$/;
const CHANNEL_ID = /^UC[\w-]{21,}$/;

/** CDN + browser caching for the public sermon list. */
const SERMON_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
  "Netlify-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

type CachePayload = {
  version: number;
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

function thumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function mapItem(item: PlaylistItem): Sermon | null {
  const snippet = item.snippet;
  const id = snippet?.resourceId?.videoId ?? "";
  const title = snippet?.title?.trim() ?? "";
  if (!VIDEO_ID.test(id) || !title || SKIP_TITLES.has(title.toLowerCase())) return null;

  const channelId = snippet?.videoOwnerChannelId?.trim() ?? "";
  const channelName = snippet?.videoOwnerChannelTitle?.trim() ?? "";

  return {
    id,
    title,
    publishedAt: snippet?.publishedAt ?? "",
    thumbnail: thumbnailUrl(id),
    channelName,
    channelId: CHANNEL_ID.test(channelId) ? channelId : "",
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

    const response = await fetch(url, { headers: { Referer: YOUTUBE_REFERER } });
    const payload = (await response.json()) as PlaylistResponse;
    if (!response.ok) throw new Error("YouTube playlist is unavailable.");

    for (const item of payload.items ?? []) {
      const sermon = mapItem(item);
      if (sermon) sermons.push(sermon);
    }

    if (!payload.nextPageToken) break;
    pageToken = payload.nextPageToken;
  }

  return sermons;
}

function sortByPublishedDesc(sermons: Sermon[]) {
  return [...sermons].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

function isFresh(cached: CachePayload | null) {
  return Boolean(
    cached &&
      cached.version === CACHE_VERSION &&
      Array.isArray(cached.sermons) &&
      Date.now() - cached.fetchedAt < CACHE_TTL_MS,
  );
}

async function refreshPlaylist(apiKey: string) {
  const sermons = sortByPublishedDesc(await fetchPlaylist(apiKey));
  await writeJson("sermons", "playlist", {
    version: CACHE_VERSION,
    fetchedAt: Date.now(),
    sermons,
  });
  return sermons;
}

function serve(sermons: Sermon[]) {
  return json({ sermons }, 200, SERMON_CACHE_HEADERS);
}

export default async (_req: Request, context: Context) => {
  const cached = await readJson<CachePayload>("sermons", "playlist");

  if (isFresh(cached)) {
    return serve(cached!.sermons);
  }

  if (cached && cached.version !== CACHE_VERSION) {
    await deleteKey("sermons", "playlist");
  }

  const apiKey = env("YOUTUBE_API_KEY");

  // Serve stale data immediately; refresh in the background so users never wait on YouTube.
  if (cached?.sermons?.length && cached.version === CACHE_VERSION) {
    if (apiKey) {
      context.waitUntil(refreshPlaylist(apiKey).catch(() => undefined));
    }
    return serve(cached.sermons);
  }

  if (!apiKey) {
    if (cached?.sermons?.length) return serve(cached.sermons);
    return json({ error: "Sermons are temporarily unavailable." }, 500);
  }

  try {
    return serve(await refreshPlaylist(apiKey));
  } catch {
    if (cached?.sermons?.length) return serve(cached.sermons);
    return json({ error: "Sermons are temporarily unavailable." }, 502);
  }
};

export const config: Config = {
  path: "/api/sermons",
  method: "GET",
};

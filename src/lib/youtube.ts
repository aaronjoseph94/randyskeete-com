/**
 * Allow only YouTube video/channel IDs in URLs we render.
 * Playlist-owner channel IDs are never used — only the uploader's channelId.
 */
const VIDEO_ID = /^[\w-]{11}$/;
const CHANNEL_ID = /^UC[\w-]{21,}$/;

export function embedUrl(videoId: string) {
  if (!VIDEO_ID.test(videoId)) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}

export function channelUrl(channelId: string) {
  if (!CHANNEL_ID.test(channelId)) return null;
  return `https://www.youtube.com/channel/${channelId}`;
}

export function safeThumbnail(url: string, videoId: string) {
  const fallback = VIDEO_ID.test(videoId) ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return fallback;
    if (parsed.hostname !== "i.ytimg.com" && parsed.hostname !== "img.youtube.com") return fallback;
    return url;
  } catch {
    return fallback;
  }
}

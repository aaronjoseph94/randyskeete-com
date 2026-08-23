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

/** Lightweight grid thumbnail (mqdefault) for faster page loads. */
export function safeThumbnail(_url: string, videoId: string) {
  return VIDEO_ID.test(videoId) ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : "";
}

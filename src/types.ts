export type Sermon = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
};

export function channelUrl(channelId: string) {
  return channelId ? `https://www.youtube.com/channel/${channelId}` : "https://www.youtube.com";
}

export function formatDate(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

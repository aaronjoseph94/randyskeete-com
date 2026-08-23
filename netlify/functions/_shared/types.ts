/** Shared sermon shape returned by /api/sermons. */
export type Sermon = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
};

export type PreachingRecord = {
  text: string;
  updatedAt: string | null;
};

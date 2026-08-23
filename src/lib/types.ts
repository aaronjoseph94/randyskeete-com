/** Public sermon record used by the player and grid. */
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

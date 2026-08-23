import { channelUrl } from "../lib/youtube";

type Props = {
  channelName: string;
  channelId: string;
  date?: string;
};

/** Credits the YouTube channel that uploaded the video — never the playlist curator. */
export function ChannelCredit({ channelName, channelId, date }: Props) {
  const href = channelName ? channelUrl(channelId) : null;
  const credit = href ? (
    <>
      Posted on YouTube by{" "}
      <a href={href} target="_blank" rel="noopener noreferrer">
        {channelName}
      </a>
    </>
  ) : channelName ? (
    <>Posted on YouTube by {channelName}</>
  ) : (
    "Posted on YouTube"
  );

  return (
    <>
      {credit}
      {date ? ` · ${date}` : null}
    </>
  );
}

import { formatDate } from "../lib/format";
import type { Sermon } from "../lib/types";
import { embedUrl } from "../lib/youtube";
import { ChannelCredit } from "./ChannelCredit";

type Props = {
  sermon: Sermon | null;
};

export function VideoPlayer({ sermon }: Props) {
  const src = sermon ? embedUrl(sermon.id) : null;

  if (!sermon || !src) {
    return (
      <section className="player-block" aria-live="polite">
        <div className="player-frame empty">
          <p>Choose a sermon below to begin.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="player-block" aria-live="polite">
      <div className="player-frame">
        <iframe
          title={sermon.title}
          src={src}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="player-meta">
        <h2>{sermon.title}</h2>
        <p>
          <ChannelCredit
            channelName={sermon.channelName}
            channelId={sermon.channelId}
            date={formatDate(sermon.publishedAt)}
          />
        </p>
      </div>
    </section>
  );
}

import { channelUrl, formatDate, type Sermon } from "../types";

type Props = {
  sermon: Sermon | null;
};

export function VideoPlayer({ sermon }: Props) {
  if (!sermon) {
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
          src={`https://www.youtube.com/embed/${sermon.id}?rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="player-meta">
        <h2>{sermon.title}</h2>
        <p>
          {sermon.channelName ? (
            <>
              Posted on YouTube by{" "}
              <a href={channelUrl(sermon.channelId)} target="_blank" rel="noreferrer">
                {sermon.channelName}
              </a>
            </>
          ) : (
            "Posted on YouTube"
          )}
          {sermon.publishedAt ? ` · ${formatDate(sermon.publishedAt)}` : null}
        </p>
      </div>
    </section>
  );
}

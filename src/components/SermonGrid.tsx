import { formatDate } from "../lib/format";
import type { Sermon } from "../lib/types";
import { safeThumbnail } from "../lib/youtube";
import { ChannelCredit } from "./ChannelCredit";

type Props = {
  sermons: Sermon[];
  selectedId: string | null;
  onSelect: (sermon: Sermon) => void;
  loading: boolean;
  error: string | null;
};

/** Grid of the latest playlist sermons; selecting one scrolls to the player. */
export function SermonGrid({ sermons, selectedId, onSelect, loading, error }: Props) {
  return (
    <section id="sermons" className="sermons">
      <div className="section-heading">
        <h2>Latest Sermons</h2>
      </div>

      {loading ? <p className="status">Loading sermons…</p> : null}
      {error ? <p className="status error">{error}</p> : null}

      {!loading && !error && sermons.length === 0 ? (
        <p className="status">No sermons available yet.</p>
      ) : null}

      {!loading && !error ? (
        <ul className="sermon-grid">
          {sermons.map((sermon) => {
            const selected = sermon.id === selectedId;
            const thumbnail = safeThumbnail(sermon.thumbnail, sermon.id);
            return (
              <li key={sermon.id}>
                <article className={selected ? "sermon-card selected" : "sermon-card"}>
                  <button type="button" className="sermon-hit" onClick={() => onSelect(sermon)}>
                    {thumbnail ? <img src={thumbnail} alt="" /> : <span className="thumb-fallback" />}
                    <span className="sermon-copy">
                      <strong>{sermon.title}</strong>
                      {sermon.publishedAt ? (
                        <span className="date">{formatDate(sermon.publishedAt)}</span>
                      ) : null}
                    </span>
                  </button>
                  <p className="credit">
                    <ChannelCredit channelName={sermon.channelName} channelId={sermon.channelId} />
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

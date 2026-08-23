import { formatDate } from "../lib/format";
import type { Sermon } from "../lib/types";
import { safeThumbnail } from "../lib/youtube";
import { ChannelCredit } from "./ChannelCredit";

type Props = {
  sermons: Sermon[];
  selectedId: string | null;
  query: string;
  totalCount: number;
  onQueryChange: (value: string) => void;
  onSelect: (sermon: Sermon) => void;
  loading: boolean;
  error: string | null;
};

export function SermonGrid({
  sermons,
  selectedId,
  query,
  totalCount,
  onQueryChange,
  onSelect,
  loading,
  error,
}: Props) {
  return (
    <section id="sermons" className="sermons">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Sermons</p>
          <h2>Listen and watch</h2>
        </div>
        <label className="search">
          <span className="sr-only">Search sermons</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search titles or channels"
            autoComplete="off"
          />
        </label>
      </div>

      {loading ? <p className="status">Loading sermons…</p> : null}
      {error ? <p className="status error">{error}</p> : null}

      {!loading && !error ? (
        <p className="status" aria-live="polite">
          {query.trim()
            ? `${sermons.length} match${sermons.length === 1 ? "" : "es"}`
            : `${totalCount} sermons`}
        </p>
      ) : null}

      {!loading && !error && sermons.length === 0 ? (
        <p className="status">No sermons match that search.</p>
      ) : null}

      <ul className="sermon-grid">
        {sermons.map((sermon, index) => {
          const selected = sermon.id === selectedId;
          const thumbnail = safeThumbnail(sermon.thumbnail, sermon.id);
          return (
            <li key={`${sermon.id}-${index}`}>
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
    </section>
  );
}

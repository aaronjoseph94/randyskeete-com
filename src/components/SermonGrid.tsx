import { channelUrl, formatDate, type Sermon } from "../types";

type Props = {
  sermons: Sermon[];
  selectedId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (sermon: Sermon) => void;
  loading: boolean;
  error: string | null;
};

export function SermonGrid({
  sermons,
  selectedId,
  query,
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
          />
        </label>
      </div>

      {loading ? <p className="status">Loading sermons…</p> : null}
      {error ? <p className="status error">{error}</p> : null}

      {!loading && !error && sermons.length === 0 ? (
        <p className="status">No sermons match that search.</p>
      ) : null}

      <ul className="sermon-grid">
        {sermons.map((sermon) => {
          const selected = sermon.id === selectedId;
          return (
            <li key={sermon.id}>
              <article className={selected ? "sermon-card selected" : "sermon-card"}>
                <button type="button" className="sermon-hit" onClick={() => onSelect(sermon)}>
                  <img src={sermon.thumbnail} alt="" />
                  <span className="sermon-copy">
                    <strong>{sermon.title}</strong>
                    {sermon.publishedAt ? (
                      <span className="date">{formatDate(sermon.publishedAt)}</span>
                    ) : null}
                  </span>
                </button>
                <p className="credit">
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
                </p>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

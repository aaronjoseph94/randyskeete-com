/**
 * Root app shell: loads sermons + preaching location, then composes the page.
 * Location is owned here so the header status line and footer editor stay in sync.
 */
import { useEffect, useMemo, useState } from "react";
import { getPreaching } from "./api/preaching";
import { fetchSermons } from "./api/sermons";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { SermonGrid } from "./components/SermonGrid";
import { VideoPlayer } from "./components/VideoPlayer";
import { messageFromUnknown } from "./lib/format";
import type { PreachingRecord, Sermon } from "./lib/types";

export default function App() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selected, setSelected] = useState<Sermon | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preaching, setPreaching] = useState<PreachingRecord | null>(null);
  const [preachingLoading, setPreachingLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchSermons(controller.signal)
      .then((list) => {
        setSermons(list);
        setSelected(list[0] ?? null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(messageFromUnknown(err, "Unable to load sermons."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    getPreaching(controller.signal)
      .then((record) => setPreaching(record))
      .catch(() => {
        if (controller.signal.aborted) return;
        setPreaching({ text: "TBA", updatedAt: null });
      })
      .finally(() => {
        if (!controller.signal.aborted) setPreachingLoading(false);
      });

    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sermons;
    return sermons.filter((sermon) => {
      return (
        sermon.title.toLowerCase().includes(needle) ||
        sermon.channelName.toLowerCase().includes(needle)
      );
    });
  }, [query, sermons]);

  function handleSelect(sermon: Sermon) {
    setSelected(sermon);
    document.getElementById("watch")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="page">
      <Header location={preaching?.text ?? "TBA"} loading={preachingLoading} />

      <main>
        <section className="hero" id="top">
          <p className="eyebrow">Sermon library</p>
          <h1>Messages by Elder Randy Skeete</h1>
          <p className="lede">
            Watch sermons collected from YouTube. Each video is credited to the
            channel that posted it.
          </p>
        </section>

        <section id="watch" className="watch">
          <VideoPlayer sermon={selected} />
        </section>

        <SermonGrid
          sermons={filtered}
          selectedId={selected?.id ?? null}
          query={query}
          totalCount={sermons.length}
          onQueryChange={setQuery}
          onSelect={handleSelect}
          loading={loading}
          error={error}
        />
      </main>

      <Footer
        location={preaching?.text ?? "TBA"}
        onUpdated={(record) => setPreaching(record)}
      />
    </div>
  );
}

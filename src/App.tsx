import { useEffect, useMemo, useState } from "react";
import { fetchSermons } from "./api/sermons";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { PreachingWidget } from "./components/PreachingWidget";
import { SermonGrid } from "./components/SermonGrid";
import { VideoPlayer } from "./components/VideoPlayer";
import { messageFromUnknown } from "./lib/format";
import type { Sermon } from "./lib/types";

export default function App() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selected, setSelected] = useState<Sermon | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <Header />
      <main>
        <PreachingWidget />

        <section className="hero" id="top">
          <p className="eyebrow">Sermons from the Word</p>
          <h1>Messages by Elder Randy Skeete</h1>
          <p className="lede">
            Watch and listen to sermons collected from YouTube. Each video is
            credited to the channel that posted it.
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
      <Footer />
    </div>
  );
}

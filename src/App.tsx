import { useEffect, useMemo, useState } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { PreachingWidget } from "./components/PreachingWidget";
import { SermonGrid } from "./components/SermonGrid";
import { VideoPlayer } from "./components/VideoPlayer";
import type { Sermon } from "./types";

function App() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selected, setSelected] = useState<Sermon | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sermons")
      .then(async (response) => {
        const data = (await response.json()) as { sermons?: Sermon[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Unable to load sermons.");
        const list = data.sermons ?? [];
        setSermons(list);
        setSelected(list[0] ?? null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load sermons.");
      })
      .finally(() => setLoading(false));
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
        <section className="hero" id="top">
          <p className="eyebrow">Sermons from the Word</p>
          <h1>Messages by Elder Randy Skeete</h1>
          <p className="lede">
            Watch and listen to sermons collected from YouTube. Each video is
            credited to the channel that posted it.
          </p>
        </section>

        <div className="layout">
          <div id="watch">
            <VideoPlayer sermon={selected} />
          </div>
          <PreachingWidget />
        </div>

        <SermonGrid
          sermons={filtered}
          selectedId={selected?.id ?? null}
          query={query}
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

export default App;

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getMusic, type Track } from "@/lib/catalog.functions";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/music")({
  loader: () => getMusic({ data: {} }),
  head: () => ({
    meta: [
      { title: "Music zone — real song previews | CPN Movies" },
      {
        name: "description",
        content:
          "Play real song previews on CPN Movies — afrobeats, movie soundtracks, K-pop, amapiano, hip hop and reggae.",
      },
      { property: "og:title", content: "Music zone — CPN Movies" },
      { property: "og:description", content: "Real song previews across popular genres." },
    ],
  }),
  component: MusicPage,
});

function TrackCard({ track }: { track: Track }) {
  return (
    <div className="w-40 shrink-0 sm:w-48">
      <div className="aspect-square overflow-hidden rounded-xl bg-card ring-1 ring-border">
        {track.artwork ? (
          <img
            src={track.artwork}
            alt={`${track.title} cover art`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <p className="mt-2 truncate text-sm font-medium text-foreground">{track.title}</p>
      <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
      {track.preview ? (
        <audio controls preload="none" src={track.preview} className="mt-2 w-full" />
      ) : null}
      {track.link ? (
        <a
          href={track.link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-xs font-semibold text-primary"
        >
          Get the full song →
        </a>
      ) : null}
    </div>
  );
}

function MusicPage() {
  const rows = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Track[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return setResults(null);
    setLoading(true);
    const { searchMusic } = await import("@/lib/catalog.functions");
    setResults(await searchMusic({ data: { q } }));
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="px-4 pt-8 pb-20 sm:px-8">
        <h1 className="text-3xl font-black text-foreground sm:text-4xl">Music zone</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real songs with playable previews. Full tracks open on their official store.
        </p>

        <form onSubmit={run} className="mt-5 flex max-w-md gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search songs or artists"
            aria-label="Search songs"
            className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            Search
          </button>
        </form>

        {loading ? <p className="mt-6 text-sm text-muted-foreground">Searching…</p> : null}

        {results ? (
          <div className="mt-8 flex flex-wrap gap-5">
            {results.length ? (
              results.map((t) => <TrackCard key={t.id} track={t} />)
            ) : (
              <p className="text-sm text-muted-foreground">No songs found.</p>
            )}
          </div>
        ) : (
          rows.map((row) => (
            <section key={row.label} className="mt-10">
              <h2 className="mb-3 text-lg font-bold text-foreground capitalize">{row.label}</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {row.tracks.map((t) => (
                  <TrackCard key={t.id} track={t} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { listSaved, removeSaved, type SavedFilm } from "@/lib/offline";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "My downloads — watch offline | CPN Movies" },
      { name: "description", content: "Free films you saved in CPN Movies to watch without internet." },
      { property: "og:title", content: "My downloads — CPN Movies" },
      { property: "og:description", content: "Watch your saved free films offline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DownloadsPage,
});

function DownloadsPage() {
  const [films, setFilms] = useState<SavedFilm[] | null>(null);
  const [playing, setPlaying] = useState<{ id: string; url: string } | null>(null);
  const load = () => listSaved().then(setFilms).catch(() => setFilms([]));
  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="px-4 pt-8 pb-20 sm:px-8">
        <h1 className="text-2xl font-black text-foreground sm:text-3xl">My downloads</h1>
        <p className="mt-1 text-sm text-muted-foreground">Free films saved in this app play here without internet.</p>
        {playing ? (
          <video key={playing.id} src={playing.url} controls autoPlay playsInline className="mt-6 aspect-video w-full max-w-4xl rounded-2xl bg-background ring-1 ring-border" />
        ) : null}
        {films === null ? null : films.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">Nothing saved yet. Open a film in "Watch free" and tap "Save offline in app".</p>
        ) : (
          <div className="mt-6 flex flex-wrap gap-4">
            {films.map((f) => (
              <div key={f.id} className="w-40 sm:w-48">
                <button type="button" onClick={() => setPlaying({ id: f.id, url: URL.createObjectURL(f.blob) })} className="block w-full">
                  <img src={f.poster} alt={`${f.title} poster`} className="aspect-[2/3] w-full rounded-xl object-cover ring-1 ring-border" />
                </button>
                <p className="mt-2 truncate text-sm font-medium text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground">{Math.round(f.blob.size / 1048576)} MB</p>
                <button type="button" onClick={async () => { await removeSaved(f.id); load(); }} className="mt-1 text-xs text-primary">Remove</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

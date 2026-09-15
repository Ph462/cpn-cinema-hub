import { createFileRoute } from "@tanstack/react-router";
import { searchTitles, searchMusic } from "@/lib/catalog.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { TitleCard } from "@/components/ui-bits";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    const [titles, tracks] = await Promise.all([
      searchTitles({ data: { q: deps.q } }),
      searchMusic({ data: { q: deps.q } }),
    ]);
    return { titles, tracks, q: deps.q };
  },
  head: () => ({
    meta: [
      { title: "Search movies, series and songs — CPN Movies" },
      {
        name: "description",
        content: "Search real movies, series and songs across CPN Movies in one place.",
      },
      { property: "og:title", content: "Search — CPN Movies" },
      { property: "og:description", content: "Find movies, series and songs instantly." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { titles, tracks, q } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="px-4 pt-8 pb-20 sm:px-8">
        <h1 className="text-2xl font-black text-foreground sm:text-3xl">
          Results for “{q}”
        </h1>

        <h2 className="mt-8 mb-4 text-lg font-bold text-foreground">
          Movies &amp; series ({titles.length})
        </h2>
        <div className="flex flex-wrap gap-4">
          {titles.length ? (
            titles.map((t) => <TitleCard key={t.id} item={t} />)
          ) : (
            <p className="text-sm text-muted-foreground">Nothing found.</p>
          )}
        </div>

        <h2 className="mt-12 mb-4 text-lg font-bold text-foreground">
          Songs ({tracks.length})
        </h2>
        <div className="flex flex-wrap gap-5">
          {tracks.length ? (
            tracks.map((t) => (
              <div key={t.id} className="w-40 sm:w-48">
                <div className="aspect-square overflow-hidden rounded-xl bg-card ring-1 ring-border">
                  {t.artwork ? (
                    <img
                      src={t.artwork}
                      alt={`${t.title} cover art`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <p className="mt-2 truncate text-sm font-medium text-foreground">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
                {t.preview ? (
                  <audio controls preload="none" src={t.preview} className="mt-2 w-full" />
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No songs found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

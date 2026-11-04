import { createFileRoute, Link } from "@tanstack/react-router";
import { getTmdbMovie } from "@/lib/tmdb.functions";
import { searchFreeMovies } from "@/lib/catalog.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { MovieCard } from "@/components/MovieCard";

export const Route = createFileRoute("/movie/$id")({
  loader: async ({ params }) => {
    const movie = await getTmdbMovie({ data: { id: params.id } });
    if (!movie) return null;
    const free = await searchFreeMovies({
      data: { q: `title:("${movie.name.replace(/"/g, "")}")` },
    }).catch(() => []);
    return { movie, freeMatch: free[0] ?? null };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Movie not found — CPN Movies" }, { name: "robots", content: "noindex" }] };
    }
    const m = loaderData.movie;
    const desc = (m.overview || `${m.name} trailer and details on CPN Movies.`).slice(0, 155);
    return {
      meta: [
        { title: `${m.name} (${m.year ?? ""}) — Trailer & details | CPN Movies` },
        { name: "description", content: desc },
        { property: "og:title", content: `${m.name} — CPN Movies` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "video.movie" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(m.backdrop
          ? [
              { property: "og:image", content: m.backdrop },
              { name: "twitter:image", content: m.backdrop },
            ]
          : []),
      ],
    };
  },
  component: MoviePage,
});

function MoviePage() {
  const data = Route.useLoaderData();
  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <p className="p-8 text-muted-foreground">This movie could not be found.</p>
      </div>
    );
  }
  const { movie: m, freeMatch } = data;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="relative h-[45vh] min-h-72 overflow-hidden">
        {m.backdrop ? (
          <img src={m.backdrop} alt={`${m.name} backdrop`} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-hero-fade" />
      </section>

      <main className="-mt-24 px-4 pb-20 sm:px-8">
        <div className="relative flex flex-col gap-6 sm:flex-row">
          {m.poster ? (
            <img src={m.poster} alt={`${m.name} poster`} className="w-40 rounded-xl ring-1 ring-border sm:w-52" />
          ) : null}
          <div className="flex-1">
            <h1 className="text-3xl font-black text-foreground sm:text-4xl">{m.name}</h1>
            {m.tagline ? <p className="mt-1 text-sm italic text-muted-foreground">{m.tagline}</p> : null}
            <p className="mt-2 text-sm text-muted-foreground">
              {[m.year, m.runtime ? `${m.runtime} min` : null, m.genres.join(", ")].filter(Boolean).join(" · ")}
            </p>
            {m.rating ? <p className="mt-1 text-sm font-semibold text-accent">★ {m.rating.toFixed(1)}</p> : null}
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/90">{m.overview}</p>
            {m.cast.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="text-foreground">Cast:</span> {m.cast.join(", ")}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {freeMatch ? (
                <Link
                  to="/watch/$id"
                  params={{ id: freeMatch.id }}
                  className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground"
                >
                  ▶ Watch &amp; ⬇ Download free
                </Link>
              ) : null}
              {m.homepage ? (
                <a
                  href={m.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
                >
                  Official site
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <h2 className="mt-12 mb-4 text-lg font-bold text-foreground">Trailer</h2>
        {m.trailerKey ? (
          <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl ring-1 ring-border">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${m.trailerKey}`}
              title={`${m.name} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No trailer available yet.</p>
        )}

        {m.similar.length ? (
          <>
            <h2 className="mt-14 mb-4 text-lg font-bold text-foreground">More like this</h2>
            <div className="flex flex-wrap gap-4">
              {m.similar.map((s) => (
                <MovieCard key={s.id} item={s} />
              ))}
            </div>
          </>
        ) : null}
        <p className="mt-10 text-xs text-muted-foreground">Movie data and images from TMDB.</p>
      </main>
    </div>
  );
}

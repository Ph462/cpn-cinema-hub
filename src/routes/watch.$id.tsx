import { createFileRoute, Link } from "@tanstack/react-router";
import { getFreeMovie } from "@/lib/catalog.functions";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/watch/$id")({
  loader: ({ params }) => getFreeMovie({ data: { id: params.id } }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Film unavailable — CPN Movies" }, { name: "robots", content: "noindex" }],
      };
    }
    const desc = (
      loaderData.description || `Watch ${loaderData.title} free and download it on CPN Movies.`
    ).slice(0, 155);
    return {
      meta: [
        { title: `Watch ${loaderData.title} free — CPN Movies` },
        { name: "description", content: desc },
        { property: "og:title", content: `Watch ${loaderData.title} — CPN Movies` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "video.movie" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:image", content: loaderData.poster },
        { name: "twitter:image", content: loaderData.poster },
      ],
    };
  },
  component: WatchPage,
});

function WatchPage() {
  const film = Route.useLoaderData();

  if (!film) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <p className="p-8 text-muted-foreground">This film could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="px-4 pb-20 sm:px-8">
        <div className="mx-auto mt-6 max-w-5xl">
          {film.videoUrl ? (
            <video
              key={film.id}
              src={film.videoUrl}
              poster={film.poster}
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full rounded-2xl bg-black ring-1 ring-border"
            />
          ) : (
            <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No playable file is available for this film.
            </p>
          )}

          <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">{film.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[film.year, film.sizeMb ? `${film.sizeMb} MB` : null, "Public domain"]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {film.downloadUrl ? (
              <a
                href={film.downloadUrl}
                download={film.fileName ?? undefined}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
              >
                ⬇ Download movie
              </a>
            ) : null}
            <Link
              to="/free"
              className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
            >
              More free movies
            </Link>
          </div>

          {film.description ? (
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/90">
              {film.description}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

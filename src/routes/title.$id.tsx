import { createFileRoute } from "@tanstack/react-router";
import { getTitle } from "@/lib/catalog.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { TitleCard } from "@/components/ui-bits";

export const Route = createFileRoute("/title/$id")({
  loader: ({ params }) => getTitle({ data: { id: params.id } }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — CPN Movies" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = loaderData.title;
    const desc = (t.summary || `Watch ${t.name} details on CPN Movies.`).slice(0, 155);
    return {
      meta: [
        { title: `${t.name} (${t.year ?? ""}) — CPN Movies` },
        { name: "description", content: desc },
        { property: "og:title", content: `${t.name} — CPN Movies` },
        { property: "og:description", content: desc },
        ...(t.banner
          ? [
              { property: "og:image", content: t.banner },
              { name: "twitter:image", content: t.banner },
            ]
          : []),
      ],
    };
  },
  component: TitlePage,
});

function TitlePage() {
  const data = Route.useLoaderData();
  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <p className="p-8 text-muted-foreground">This title could not be found.</p>
      </div>
    );
  }
  const { title, cast, similar } = data;
  const trailer = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title.name} ${title.year ?? ""} official trailer`,
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative h-[52vh] min-h-80 overflow-hidden">
        {title.banner ? (
          <img
            src={title.banner}
            alt={`${title.name} artwork`}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : null}
        <div className="absolute inset-0 bg-hero-fade" />
      </section>

      <main className="-mt-24 px-4 pb-20 sm:px-8">
        <div className="relative flex flex-col gap-6 sm:flex-row">
          {title.poster ? (
            <img
              src={title.poster}
              alt={`${title.name} poster`}
              className="w-40 rounded-xl ring-1 ring-border sm:w-52"
            />
          ) : null}
          <div className="flex-1">
            <h1 className="text-3xl font-black text-foreground sm:text-4xl">{title.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {[title.year, title.network, title.language, title.genres.join(", ")]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {title.rating ? (
              <p className="mt-1 text-sm font-semibold text-accent">★ {title.rating.toFixed(1)}</p>
            ) : null}
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/90">
              {title.summary}
            </p>
            {cast.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="text-foreground">Cast:</span> {cast.join(", ")}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={trailer}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                ▶ Watch trailer
              </a>
              {title.officialSite ? (
                <a
                  href={title.officialSite}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
                >
                  Watch officially
                </a>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              CPN Movies links to official sources — full films aren't hosted or downloadable here.
            </p>
          </div>
        </div>

        {similar.length ? (
          <>
            <h2 className="mt-14 mb-4 text-lg font-bold text-foreground">More like this</h2>
            <div className="flex flex-wrap gap-4">
              {similar.map((s) => (
                <TitleCard key={s.id} item={s} />
              ))}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

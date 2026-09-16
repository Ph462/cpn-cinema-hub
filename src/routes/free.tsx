import { createFileRoute, Link } from "@tanstack/react-router";
import { getFreeMovies, type FreeMovie } from "@/lib/catalog.functions";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/free")({
  head: () => ({
    meta: [
      { title: "Watch & Download Free Movies — CPN Movies" },
      {
        name: "description",
        content:
          "Stream full public-domain movies right here and download them free — classics, noir, sci-fi, horror and cartoons on CPN Movies.",
      },
      { property: "og:title", content: "Watch & Download Free Movies — CPN Movies" },
      {
        property: "og:description",
        content: "Full films you can play in the browser and download, completely free and legal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getFreeMovies(),
  component: FreePage,
});

export function FreeCard({ item }: { item: FreeMovie }) {
  return (
    <Link
      to="/watch/$id"
      params={{ id: item.id }}
      className="group block w-36 shrink-0 sm:w-44"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-card ring-1 ring-border transition-transform duration-300 group-hover:-translate-y-1 group-hover:ring-primary">
        <img
          src={item.poster}
          alt={`${item.title} poster`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2 left-2 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          FREE
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">{item.title}</p>
      {item.year ? <p className="text-xs text-muted-foreground">{item.year}</p> : null}
    </Link>
  );
}

function FreePage() {
  const rows = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="px-4 pb-20 sm:px-8">
        <h1 className="mt-8 text-3xl font-black text-foreground">Watch &amp; download free</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Full movies that play right here in the site — no external links — and every one can be
          downloaded. These are public-domain and freely licensed films, so watching and keeping
          them is completely legal.
        </p>

        {rows.map((r) => (
          <section key={r.label} className="mt-10">
            <h2 className="mb-3 text-lg font-bold text-foreground">{r.label}</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {r.items.map((m) => (
                <FreeCard key={m.id} item={m} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

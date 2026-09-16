import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getHome } from "@/lib/catalog.functions";
import { SplashScreen } from "@/components/SplashScreen";
import { SiteHeader } from "@/components/SiteHeader";
import { Row } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CPN Movies — Stream Movies, Series & Music" },
      {
        name: "description",
        content:
          "Browse trending movies and series by category — action, K-drama, thrillers and more — plus real song previews on CPN Movies.",
      },
      { property: "og:title", content: "CPN Movies — Stream Movies, Series & Music" },
      {
        property: "og:description",
        content: "Trending movies, series by category and real song previews.",
      },
    ],
  }),
  loader: () => getHome(),
  component: Home,
});

function Home() {
  const { featured, rows } = Route.useLoaderData();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % featured.length), 6000);
    return () => clearInterval(t);
  }, [featured.length]);

  const hero = featured[i];

  return (
    <div className="min-h-screen bg-background">
      <SplashScreen />
      <SiteHeader />

      {hero ? (
        <section className="relative h-[70vh] min-h-105 w-full overflow-hidden">
          {hero.banner ? (
            <img
              key={hero.id}
              src={hero.banner}
              alt={`${hero.name} artwork`}
              className="absolute inset-0 h-full w-full animate-fade-in object-cover object-top"
            />
          ) : null}
          <div className="absolute inset-0 bg-hero-fade" />
          <div className="absolute right-0 bottom-0 left-0 px-4 pb-10 sm:px-8">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-md bg-primary px-2 py-0.5 font-bold text-primary-foreground uppercase">
                {hero.type}
              </span>
              {hero.year ? (
                <span className="rounded-md bg-card px-2 py-0.5 text-muted-foreground">
                  {hero.year}
                </span>
              ) : null}
              {hero.rating ? (
                <span className="font-semibold text-accent">★ {hero.rating.toFixed(1)}</span>
              ) : null}
            </div>
            <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-foreground sm:text-6xl">
              {hero.name}
            </h1>
            <p className="mt-3 line-clamp-3 max-w-xl text-sm text-muted-foreground">
              {hero.summary}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                to="/title/$id"
                params={{ id: String(hero.id) }}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
              >
                ▶ Watch preview
              </Link>
              <div className="flex gap-1.5">
                {featured.map((f, idx) => (
                  <button
                    key={f.id}
                    aria-label={`Show ${f.name}`}
                    onClick={() => setI(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === i ? "w-6 bg-primary" : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <main className="pb-20">
        {rows.map((r) => (
          <Row key={r.slug} label={r.label} slug={r.slug} items={r.items} />
        ))}
        <div className="mt-14 grid gap-4 px-4 sm:grid-cols-2 sm:px-8">
          <Link
            to="/free"
            className="block rounded-2xl border border-primary/50 bg-card p-6 transition-colors hover:border-primary"
          >
            <h2 className="text-lg font-bold text-foreground">Watch &amp; download free movies</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Full films that play right here in the site — and download with one tap.
            </p>
          </Link>
          <Link
            to="/music"
            className="block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <h2 className="text-lg font-bold text-foreground">Music zone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real song previews — afrobeats, soundtracks, K-pop and more.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

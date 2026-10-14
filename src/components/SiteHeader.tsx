import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { searchTitles, searchFreeMovies, searchMusic } from "@/lib/catalog.functions";
import type { Title, FreeMovie, Track } from "@/lib/catalog.functions";

type Sugg = { free: FreeMovie[]; titles: Title[]; tracks: Track[] };

export function SiteHeader() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sugg, setSugg] = useState<Sugg | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setSugg(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const [titles, free, tracks] = await Promise.all([
        searchTitles({ data: { q: term } }).catch(() => []),
        searchFreeMovies({ data: { q: term } }).catch(() => []),
        searchMusic({ data: { q: term } }).catch(() => []),
      ]);
      if (!cancelled) {
        setSugg({ titles: titles.slice(0, 5), free: free.slice(0, 4), tracks: tracks.slice(0, 4) });
        setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const close = () => {
    setOpen(false);
    setQ("");
  };
  const empty = sugg && !sugg.titles.length && !sugg.free.length && !sugg.tracks.length;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
            C
          </span>
          <span className="hidden text-base font-black tracking-tight text-foreground sm:block">
            CPN <span className="text-primary">Movies</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 pl-4 text-sm text-muted-foreground md:flex">
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <Link to="/category/$slug" params={{ slug: "action" }} className="transition-colors hover:text-foreground">Action</Link>
          <Link to="/category/$slug" params={{ slug: "k-drama" }} className="transition-colors hover:text-foreground">K-Drama</Link>
          <Link to="/free" className="font-semibold text-primary transition-colors hover:text-foreground">Watch free</Link>
          <Link to="/music" className="transition-colors hover:text-foreground">Music</Link>
        </nav>

        <div className="relative ml-auto w-full max-w-xs">
          <form
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) {
                navigate({ to: "/search", search: { q: q.trim() } });
                close();
              }
            }}
          >
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              placeholder="Search movies, series, songs"
              aria-label="Search"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="text-xs font-semibold text-primary">Go</button>
          </form>

          {open && q.trim().length >= 2 ? (
            <div className="absolute right-0 mt-2 max-h-[70vh] w-[min(22rem,90vw)] overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-glow">
              {loading && !sugg ? <p className="p-3 text-xs text-muted-foreground">Searching…</p> : null}
              {empty ? <p className="p-3 text-xs text-muted-foreground">Nothing found.</p> : null}
              {sugg?.free.length ? <p className="px-2 pt-2 text-[10px] font-bold uppercase text-primary">Watch & download free</p> : null}
              {sugg?.free.map((f) => (
                <Link key={f.id} to="/watch/$id" params={{ id: f.id }} onClick={close} className="flex items-center gap-3 rounded-lg p-2 hover:bg-background">
                  <img src={f.poster} alt="" className="h-12 w-9 rounded object-cover" />
                  <span className="truncate text-sm text-foreground">{f.title}{f.year ? ` (${f.year})` : ""}</span>
                </Link>
              ))}
              {sugg?.titles.length ? <p className="px-2 pt-2 text-[10px] font-bold uppercase text-muted-foreground">Series</p> : null}
              {sugg?.titles.map((t) => (
                <Link key={t.id} to="/title/$id" params={{ id: String(t.id) }} onClick={close} className="flex items-center gap-3 rounded-lg p-2 hover:bg-background">
                  {t.poster ? <img src={t.poster} alt="" className="h-12 w-9 rounded object-cover" /> : null}
                  <span className="truncate text-sm text-foreground">{t.name}{t.year ? ` (${t.year})` : ""}</span>
                </Link>
              ))}
              {sugg?.tracks.length ? <p className="px-2 pt-2 text-[10px] font-bold uppercase text-muted-foreground">Songs</p> : null}
              {sugg?.tracks.map((t) => (
                <Link key={t.id} to="/search" search={{ q: `${t.title} ${t.artist}` }} onClick={close} className="flex items-center gap-3 rounded-lg p-2 hover:bg-background">
                  {t.artwork ? <img src={t.artwork} alt="" className="h-10 w-10 rounded object-cover" /> : null}
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-foreground">{t.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{t.artist}</span>
                  </span>
                </Link>
              ))}
              <button
                type="button"
                onMouseDown={() => {
                  navigate({ to: "/search", search: { q: q.trim() } });
                  close();
                }}
                className="mt-1 w-full rounded-lg p-2 text-left text-xs font-semibold text-primary hover:bg-background"
              >
                See all results for “{q.trim()}” →
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

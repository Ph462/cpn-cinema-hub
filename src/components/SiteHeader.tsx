import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function SiteHeader() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

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
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link
            to="/category/$slug"
            params={{ slug: "action" }}
            className="transition-colors hover:text-foreground"
          >
            Action
          </Link>
          <Link
            to="/category/$slug"
            params={{ slug: "k-drama" }}
            className="transition-colors hover:text-foreground"
          >
            K-Drama
          </Link>
          <Link to="/music" className="transition-colors hover:text-foreground">
            Music
          </Link>
        </nav>

        <form
          className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search movies, series, songs"
            aria-label="Search"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="text-xs font-semibold text-primary">
            Go
          </button>
        </form>
      </div>
    </header>
  );
}

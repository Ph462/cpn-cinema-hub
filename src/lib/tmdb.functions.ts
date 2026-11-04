import { createServerFn } from "@tanstack/react-start";

export type Movie = {
  id: number;
  name: string;
  poster: string | null;
  backdrop: string | null;
  year: string | null;
  rating: number | null;
  overview: string;
};

export type MovieDetail = Movie & {
  genres: string[];
  runtime: number | null;
  tagline: string | null;
  trailerKey: string | null;
  cast: string[];
  homepage: string | null;
  similar: Movie[];
};

const IMG = "https://image.tmdb.org/t/p/";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function tmdb(path: string, params: Record<string, string> = {}): Promise<any> {
  const key = process.env["TMDB_API_KEY"];
  if (!key) throw new Error("TMDB key missing");
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const headers: Record<string, string> = { accept: "application/json" };
  if (key.length > 40) headers["Authorization"] = `Bearer ${key}`;
  else url.searchParams.set("api_key", key);
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`TMDB ${path} failed [${res.status}]: ${await res.text()}`);
    return null;
  }
  return res.json();
}

function mapMovie(m: any): Movie {
  return {
    id: m.id,
    name: m.title ?? m.name,
    poster: m.poster_path ? `${IMG}w342${m.poster_path}` : null,
    backdrop: m.backdrop_path ? `${IMG}w1280${m.backdrop_path}` : null,
    year: (m.release_date ?? "").slice(0, 4) || null,
    rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
    overview: m.overview ?? "",
  };
}

const list = (j: any) => ((j?.results ?? []) as any[]).map(mapMovie).filter((m) => m.poster);

export const getTmdbHome = createServerFn({ method: "GET" }).handler(async () => {
  const [trending, nowPlaying, popular, topRated] = await Promise.all([
    tmdb("/trending/movie/week"),
    tmdb("/movie/now_playing"),
    tmdb("/movie/popular"),
    tmdb("/movie/top_rated"),
  ]).catch(() => [null, null, null, null]);
  return [
    { label: "Trending movies this week", items: list(trending) },
    { label: "Latest in cinemas", items: list(nowPlaying) },
    { label: "Popular movies", items: list(popular) },
    { label: "Top rated movies", items: list(topRated) },
  ].filter((r) => r.items.length > 0);
});

export const searchTmdb = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return [] as Movie[];
    return list(await tmdb("/search/movie", { query: q }).catch(() => null));
  });

export const getTmdbMovie = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<MovieDetail | null> => {
    if (!/^\d+$/.test(data.id)) return null;
    const m = await tmdb(`/movie/${data.id}`, {
      append_to_response: "videos,credits,similar",
    }).catch(() => null);
    if (!m) return null;
    const vids: any[] = m.videos?.results ?? [];
    const trailer =
      vids.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
      vids.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
      vids.find((v) => v.site === "YouTube");
    return {
      ...mapMovie(m),
      genres: (m.genres ?? []).map((g: any) => g.name),
      runtime: m.runtime ?? null,
      tagline: m.tagline || null,
      trailerKey: trailer?.key ?? null,
      cast: (m.credits?.cast ?? []).slice(0, 8).map((c: any) => c.name),
      homepage: m.homepage || null,
      similar: list(m.similar).slice(0, 12),
    };
  });

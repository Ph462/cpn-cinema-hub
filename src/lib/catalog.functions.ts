import { createServerFn } from "@tanstack/react-start";

export type Title = {
  id: number;
  name: string;
  poster: string | null;
  banner: string | null;
  genres: string[];
  rating: number | null;
  year: string | null;
  language: string | null;
  network: string | null;
  officialSite: string | null;
  summary: string;
  type: string;
};

export type Track = {
  id: number;
  title: string;
  artist: string;
  album: string;
  artwork: string | null;
  preview: string | null;
  link: string | null;
  genre: string | null;
};

export type Category = { slug: string; label: string };

export const CATEGORIES: Category[] = [
  { slug: "action", label: "Action" },
  { slug: "k-drama", label: "K-Drama" },
  { slug: "drama", label: "Drama" },
  { slug: "crime", label: "Crime" },
  { slug: "science-fiction", label: "Sci-Fi" },
  { slug: "thriller", label: "Thriller" },
  { slug: "comedy", label: "Comedy" },
  { slug: "horror", label: "Horror" },
  { slug: "romance", label: "Romance" },
  { slug: "anime", label: "Anime" },
];

function stripHtml(html: string | null | undefined) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapShow(s: any): Title {
  return {
    id: s.id,
    name: s.name,
    poster: s.image?.medium ?? s.image?.original ?? null,
    banner: s.image?.original ?? null,
    genres: s.genres ?? [],
    rating: s.rating?.average ?? null,
    year: s.premiered ? String(s.premiered).slice(0, 4) : null,
    language: s.language ?? null,
    network: s.network?.name ?? s.webChannel?.name ?? null,
    officialSite: s.officialSite ?? null,
    summary: stripHtml(s.summary),
    type: s.type ?? "Scripted",
  };
}

let cache: { at: number; items: Title[] } | null = null;

async function loadCatalog(): Promise<Title[]> {
  if (cache && Date.now() - cache.at < 1000 * 60 * 30) return cache.items;
  const pages = await Promise.all(
    [0, 1, 2].map((p) =>
      fetch(`https://api.tvmaze.com/shows?page=${p}`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ),
  );
  const items = (pages.flat() as any[])
    .map(mapShow)
    .filter((t) => t.poster && t.rating !== null);
  cache = { at: Date.now(), items };
  return items;
}

function inCategory(t: Title, slug: string) {
  if (slug === "k-drama") return t.language === "Korean";
  if (slug === "anime") return t.genres.includes("Anime");
  const label = CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
  const genre = slug === "science-fiction" ? "Science-Fiction" : label;
  return t.genres.some((g) => g.toLowerCase() === genre.toLowerCase());
}

const byRating = (a: Title, b: Title) => (b.rating ?? 0) - (a.rating ?? 0);

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const all = await loadCatalog();
  const featured = all
    .filter((t) => t.banner && t.summary.length > 80)
    .sort(byRating)
    .slice(0, 6);
  const rows = CATEGORIES.map((c) => ({
    ...c,
    items: all.filter((t) => inCategory(t, c.slug)).sort(byRating).slice(0, 14),
  })).filter((r) => r.items.length > 3);
  return { featured, rows };
});

export const getCategory = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const all = await loadCatalog();
    return {
      slug: data.slug,
      label: CATEGORIES.find((c) => c.slug === data.slug)?.label ?? data.slug,
      items: all.filter((t) => inCategory(t, data.slug)).sort(byRating).slice(0, 60),
    };
  });

export const getTitle = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const res = await fetch(`https://api.tvmaze.com/shows/${data.id}?embed=cast`);
    if (!res.ok) return null;
    const show: any = await res.json();
    const title = mapShow(show);
    const cast: string[] = (show._embedded?.cast ?? [])
      .slice(0, 8)
      .map((c: any) => c.person?.name)
      .filter(Boolean);
    const all = await loadCatalog();
    const similar = all
      .filter((t) => t.id !== title.id && t.genres.some((g) => title.genres.includes(g)))
      .sort(byRating)
      .slice(0, 8);
    return { title, cast, similar };
  });

export const searchTitles = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return [] as Title[];
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [] as Title[];
    const rows: any[] = await res.json();
    return rows.map((r) => mapShow(r.show)).filter((t) => t.poster);
  });

function mapTrack(t: any): Track {
  return {
    id: t.trackId ?? t.collectionId,
    title: t.trackName ?? t.collectionName,
    artist: t.artistName,
    album: t.collectionName ?? "",
    artwork: t.artworkUrl100 ? String(t.artworkUrl100).replace("100x100", "400x400") : null,
    preview: t.previewUrl ?? null,
    link: t.trackViewUrl ?? null,
    genre: t.primaryGenreName ?? null,
  };
}

async function itunes(term: string, limit: number): Promise<Track[]> {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=${limit}`,
  );
  if (!res.ok) return [];
  const json: any = await res.json();
  return (json.results ?? []).map(mapTrack).filter((t: Track) => t.preview);
}

export const getMusic = createServerFn({ method: "GET" })
  .inputValidator((data: { term?: string }) => data)
  .handler(async ({ data }) => {
    if (data.term && data.term.trim()) {
      return [{ label: `Results for "${data.term}"`, tracks: await itunes(data.term, 30) }];
    }
    const moods = ["afrobeats", "movie soundtrack", "k-pop", "hip hop", "amapiano", "reggae"];
    const rows = await Promise.all(
      moods.map(async (m) => ({ label: m, tracks: await itunes(m, 12) })),
    );
    return rows.filter((r) => r.tracks.length > 0);
  });

export const searchMusic = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => (data.q.trim() ? itunes(data.q, 18) : ([] as Track[])));

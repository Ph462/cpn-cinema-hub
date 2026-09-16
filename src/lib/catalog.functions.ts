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

const KDRAMA_TITLES = [
  "Squid Game",
  "Crash Landing on You",
  "Goblin",
  "Itaewon Class",
  "Vincenzo",
  "Hospital Playlist",
  "My Mister",
  "Signal",
  "Reply 1988",
  "Sky Castle",
  "Kingdom",
  "Descendants of the Sun",
  "Hometown Cha-Cha-Cha",
  "The Glory",
  "Extraordinary Attorney Woo",
  "Mr. Sunshine",
  "Sweet Home",
  "Alchemy of Souls",
  "Moving",
  "Twenty-Five Twenty-One",
];

let kCache: { at: number; items: Title[] } | null = null;

async function loadKDrama(): Promise<Title[]> {
  if (kCache && Date.now() - kCache.at < 1000 * 60 * 60) return kCache.items;
  const results = await Promise.all(
    KDRAMA_TITLES.map((name) =>
      fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(name)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ),
  );
  const items = (results.filter(Boolean) as any[]).map(mapShow).filter((t) => t.poster);
  kCache = { at: Date.now(), items };
  return items;
}

async function itemsFor(slug: string): Promise<Title[]> {
  if (slug === "k-drama") {
    const [korean, all] = await Promise.all([loadKDrama(), loadCatalog()]);
    const extra = all.filter(
      (t) => t.language === "Korean" && !korean.some((k) => k.id === t.id),
    );
    return [...korean, ...extra].sort(byRating);
  }
  const all = await loadCatalog();
  return all.filter((t) => inCategory(t, slug)).sort(byRating);
}

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const all = await loadCatalog();
  const featured = all
    .filter((t) => t.banner && t.summary.length > 80)
    .sort(byRating)
    .slice(0, 6);
  const rows = await Promise.all(
    CATEGORIES.map(async (c) => ({ ...c, items: (await itemsFor(c.slug)).slice(0, 14) })),
  );
  return { featured, rows: rows.filter((r) => r.items.length > 3) };
});

export const getCategory = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => ({
    slug: data.slug,
    label: CATEGORIES.find((c) => c.slug === data.slug)?.label ?? data.slug,
    items: (await itemsFor(data.slug)).slice(0, 60),
  }));


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

export type FreeMovie = {
  id: string;
  title: string;
  year: number | null;
  description: string;
  poster: string;
};

export type FreeMovieDetail = FreeMovie & {
  videoUrl: string | null;
  downloadUrl: string | null;
  fileName: string | null;
  sizeMb: number | null;
  runtime: string | null;
};

const IA = "https://archive.org";

function mapFree(d: any): FreeMovie {
  return {
    id: d.identifier,
    title: d.title ?? d.identifier,
    year: typeof d.year === "number" ? d.year : d.year ? Number(d.year) : null,
    description: stripHtml(Array.isArray(d.description) ? d.description[0] : d.description).slice(0, 400),
    poster: `${IA}/services/img/${d.identifier}`,
  };
}

async function iaSearch(query: string, rows: number, sort: string): Promise<FreeMovie[]> {
  const url =
    `${IA}/advancedsearch.php?q=${encodeURIComponent(query)}` +
    `&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=year&fl%5B%5D=description` +
    `&sort%5B%5D=${encodeURIComponent(sort)}&rows=${rows}&page=1&output=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json: any = await res.json();
  return (json.response?.docs ?? []).map(mapFree);
}

const FREE_ROWS: { label: string; query: string }[] = [
  { label: "Most watched free films", query: "collection:(feature_films) AND mediatype:(movies) AND format:(MPEG4)" },
  { label: "Classic action & adventure", query: "collection:(feature_films) AND mediatype:(movies) AND format:(MPEG4) AND (action OR adventure)" },
  { label: "Horror & thrillers", query: "collection:(feature_films) AND mediatype:(movies) AND format:(MPEG4) AND (horror OR thriller)" },
  { label: "Sci-fi", query: 'collection:(scifi_horror) AND mediatype:(movies) AND format:(MPEG4)' },
  { label: "Comedy & cartoons", query: "collection:(classic_cartoons) AND mediatype:(movies) AND format:(MPEG4)" },
  { label: "Noir & crime", query: "collection:(film_noir) AND mediatype:(movies) AND format:(MPEG4)" },
];

export const getFreeMovies = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await Promise.all(
    FREE_ROWS.map(async (r) => ({
      label: r.label,
      items: await iaSearch(r.query, 18, "downloads desc"),
    })),
  );
  return rows.filter((r) => r.items.length > 0);
});

export const searchFreeMovies = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return [] as FreeMovie[];
    return iaSearch(
      `mediatype:(movies) AND format:(MPEG4) AND collection:(feature_films OR film_noir OR classic_cartoons OR scifi_horror OR moviesandfilms) AND (${q})`,
      24,
      "downloads desc",
    );
  });

export const getFreeMovie = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<FreeMovieDetail | null> => {
    const res = await fetch(`${IA}/metadata/${encodeURIComponent(data.id)}`);
    if (!res.ok) return null;
    const meta: any = await res.json();
    if (!meta.metadata) return null;
    const m = meta.metadata;
    const files: any[] = meta.files ?? [];
    const playable = files.find((f) => /\.(mp4|m4v|ogv|webm)$/i.test(f.name ?? ""));
    const name = playable?.name ?? null;
    const url = name ? `${IA}/download/${encodeURIComponent(data.id)}/${encodeURI(name)}` : null;
    return {
      id: data.id,
      title: Array.isArray(m.title) ? m.title[0] : (m.title ?? data.id),
      year: m.year ? Number(m.year) : m.date ? Number(String(m.date).slice(0, 4)) : null,
      description: stripHtml(Array.isArray(m.description) ? m.description[0] : m.description),
      poster: `${IA}/services/img/${data.id}`,
      videoUrl: url,
      downloadUrl: url,
      fileName: name,
      sizeMb: playable?.size ? Math.round(Number(playable.size) / 1048576) : null,
      runtime: playable?.length ?? null,
    };
  });

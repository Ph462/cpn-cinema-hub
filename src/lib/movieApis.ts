/**
 * CPN Cinema Hub
 * Movie API service
 *
 * File:
 *   src/lib/movieApis.ts
 *
 * Provider:
 *   DavidCyrilTech Movie APIs
 *
 * IMPORTANT:
 * Use streaming/download functionality only for content
 * that you are legally permitted to access or distribute.
 */

const API_BASE_URL =
  "https://apis.davidcyril.name.ng";

/**
 * API endpoint names used by CPN Cinema Hub.
 *
 * Replace the empty path strings with the exact paths
 * shown in the provider's API documentation.
 */
export const MOVIE_ENDPOINTS = {
  watchMovieStreamsDownload: "",
  naijapreyInfoDownloadUrl: "",
  naijapreyLatest: "",
  naijapreySearch: "",

  nkiriSearch: "",
  nkiriLatest: "",
  nkiriInfo: "",

  streamXInfoStreamLinks: "",
  streamXLatestStreamLinks: "",

  subttSearchInfo: "",

  seriezloadedSearch: "",
  seriezloadedLatest: "",
  seriezloadedInfo: "",

  moviesfoundonlineSearch: "",
  moviesfoundonlineLatest: "",
  moviesfoundonlineInfo: "",
} as const;

export type MovieEndpoint =
  keyof typeof MOVIE_ENDPOINTS;

/**
 * Generic response type.
 *
 * The external API can return different structures,
 * therefore data is intentionally typed as unknown.
 */
export interface MovieApiResponse<T = unknown> {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: T;
  result?: T;
  results?: T;
  [key: string]: unknown;
}

/**
 * Build an API URL with query parameters.
 */
export function buildMovieApiUrl(
  endpoint: MovieEndpoint,
  params: Record<string, string | number | boolean | undefined> = {},
): string {
  const path = MOVIE_ENDPOINTS[endpoint];

  if (!path) {
    throw new Error(
      `No API path has been configured for "${endpoint}". ` +
        `Add the exact path from the provider documentation.`,
    );
  }

  const url = new URL(path, API_BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Generic GET request.
 */
export async function movieApiGet<T = unknown>(
  endpoint: MovieEndpoint,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const url = buildMovieApiUrl(endpoint, params);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Movie API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

/* =========================================================
   NAIJAPREY
   ========================================================= */

export async function naijapreyLatest<T = unknown>() {
  return movieApiGet<T>(
    "naijapreyLatest",
  );
}

export async function naijapreySearch<T = unknown>(
  query: string,
) {
  return movieApiGet<T>(
    "naijapreySearch",
    {
      query,
      q: query,
      search: query,
    },
  );
}

export async function naijapreyInfo<T = unknown>(
  idOrUrl: string,
) {
  return movieApiGet<T>(
    "naijapreyInfoDownloadUrl",
    {
      id: idOrUrl,
      url: idOrUrl,
    },
  );
}

/* =========================================================
   NKIRI
   ========================================================= */

export async function nkiriLatest<T = unknown>() {
  return movieApiGet<T>(
    "nkiriLatest",
  );
}

export async function nkiriSearch<T = unknown>(
  query: string,
) {
  return movieApiGet<T>(
    "nkiriSearch",
    {
      query,
      q: query,
      search: query,
    },
  );
}

export async function nkiriInfo<T = unknown>(
  idOrUrl: string,
) {
  return movieApiGet<T>(
    "nkiriInfo",
    {
      id: idOrUrl,
      url: idOrUrl,
    },
  );
}

/* =========================================================
   STREAM X
   ========================================================= */

export async function streamXLatest<T = unknown>() {
  return movieApiGet<T>(
    "streamXLatestStreamLinks",
  );
}

export async function streamXInfo<T = unknown>(
  idOrUrl: string,
) {
  return movieApiGet<T>(
    "streamXInfoStreamLinks",
    {
      id: idOrUrl,
      url: idOrUrl,
    },
  );
}

/* =========================================================
   SUBTT
   ========================================================= */

export async function subttSearch<T = unknown>(
  query: string,
) {
  return movieApiGet<T>(
    "subttSearchInfo",
    {
      query,
      q: query,
      search: query,
    },
  );
}

/* =========================================================
   SERIEZLOADED
   ========================================================= */

export async function seriezloadedLatest<T = unknown>() {
  return movieApiGet<T>(
    "seriezloadedLatest",
  );
}

export async function seriezloadedSearch<T = unknown>(
  query: string,
) {
  return movieApiGet<T>(
    "seriezloadedSearch",
    {
      query,
      q: query,
      search: query,
    },
  );
}

export async function seriezloadedInfo<T = unknown>(
  idOrUrl: string,
) {
  return movieApiGet<T>(
    "seriezloadedInfo",
    {
      id: idOrUrl,
      url: idOrUrl,
    },
  );
}

/* =========================================================
   MOVIESFOUNDONLINE
   ========================================================= */

export async function moviesfoundonlineLatest<T = unknown>() {
  return movieApiGet<T>(
    "moviesfoundonlineLatest",
  );
}

export async function moviesfoundonlineSearch<T = unknown>(
  query: string,
) {
  return movieApiGet<T>(
    "moviesfoundonlineSearch",
    {
      query,
      q: query,
      search: query,
    },
  );
}

export async function moviesfoundonlineInfo<T = unknown>(
  idOrUrl: string,
) {
  return movieApiGet<T>(
    "moviesfoundonlineInfo",
    {
      id: idOrUrl,
      url: idOrUrl,
    },
  );
}

/* =========================================================
   WATCH / STREAM / DOWNLOAD
   ========================================================= */

export async function watchMovieStreamsDownload<T = unknown>(
  idOrUrl: string,
) {
  return movieApiGet<T>(
    "watchMovieStreamsDownload",
    {
      id: idOrUrl,
      url: idOrUrl,
    },
  );
}

/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

const movieApis = {
  endpoints: MOVIE_ENDPOINTS,

  get: movieApiGet,
  buildUrl: buildMovieApiUrl,

  naijaprey: {
    latest: naijapreyLatest,
    search: naijapreySearch,
    info: naijapreyInfo,
  },

  nkiri: {
    latest: nkiriLatest,
    search: nkiriSearch,
    info: nkiriInfo,
  },

  streamX: {
    latest: streamXLatest,
    info: streamXInfo,
  },

  subtt: {
    search: subttSearch,
  },

  seriezloaded: {
    latest: seriezloadedLatest,
    search: seriezloadedSearch,
    info: seriezloadedInfo,
  },

  moviesfoundonline: {
    latest: moviesfoundonlineLatest,
    search: moviesfoundonlineSearch,
    info: moviesfoundonlineInfo,
  },

  watch: {
    streamsDownload: watchMovieStreamsDownload,
  },
};

export default movieApis;

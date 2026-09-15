/**
 * CPN Cinema Hub media API client.
 *
 * Expected backend routes:
 *
 * GET  /api/media/search?q=...
 * GET  /api/media/latest
 * GET  /api/media/:id
 * GET  /api/media/:id/stream
 * GET  /api/media/:id/download
 *
 * Only publish media that you own or are authorized to distribute.
 */

const API_BASE_URL =
  import.meta.env.VITE_MEDIA_API_URL ||
  "/api";

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  type?: "movie" | "series" | "song" | "video";
  genre?: string;
  year?: number;
  duration?: number;
  streamUrl?: string;
  downloadUrl?: string;
}

export interface MediaSearchResponse {
  success: boolean;
  items: MediaItem[];
  page?: number;
  total?: number;
  hasMore?: boolean;
}

export interface MediaDetailsResponse {
  success: boolean;
  item: MediaItem;
}

export interface MediaStreamResponse {
  success: boolean;
  streamUrl: string;
  mimeType?: string;
  expiresAt?: string;
}

export interface MediaDownloadResponse {
  success: boolean;
  downloadUrl: string;
  fileName?: string;
  expiresAt?: string;
}

async function request<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(path, window.location.origin);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Media API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function searchMedia(
  query: string,
  page = 1,
): Promise<MediaSearchResponse> {
  return request<MediaSearchResponse>(
    `${API_BASE_URL}/media/search`,
    {
      q: query,
      page,
    },
  );
}

export async function getLatestMedia(
  page = 1,
): Promise<MediaSearchResponse> {
  return request<MediaSearchResponse>(
    `${API_BASE_URL}/media/latest`,
    {
      page,
    },
  );
}

export async function getMediaDetails(
  mediaId: string,
): Promise<MediaDetailsResponse> {
  return request<MediaDetailsResponse>(
    `${API_BASE_URL}/media/${encodeURIComponent(mediaId)}`,
  );
}

export async function getMediaStream(
  mediaId: string,
): Promise<MediaStreamResponse> {
  return request<MediaStreamResponse>(
    `${API_BASE_URL}/media/${encodeURIComponent(mediaId)}/stream`,
  );
}

export async function getMediaDownload(
  mediaId: string,
): Promise<MediaDownloadResponse> {
  return request<MediaDownloadResponse>(
    `${API_BASE_URL}/media/${encodeURIComponent(mediaId)}/download`,
  );
}

export function getPosterUrl(
  item: MediaItem,
): string {
  return item.posterUrl || "/placeholder-poster.jpg";
}

export function getStreamUrl(
  response: MediaStreamResponse,
): string {
  return response.streamUrl;
}

export function getDownloadUrl(
  response: MediaDownloadResponse,
): string {
  return response.downloadUrl;
}

const movieApis = {
  searchMedia,
  getLatestMedia,
  getMediaDetails,
  getMediaStream,
  getMediaDownload,
  getPosterUrl,
  getStreamUrl,
  getDownloadUrl,
};

export default movieApis;

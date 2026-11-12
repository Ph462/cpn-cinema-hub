// Saves free public-domain films into the browser (IndexedDB) for offline playback.
export type SavedFilm = { id: string; title: string; poster: string; blob: Blob; savedAt: number };

function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open("cpn-offline", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("films", { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((res, rej) => {
    const req = fn(d.transaction("films", mode).objectStore("films"));
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export const listSaved = () => tx<SavedFilm[]>("readonly", (s) => s.getAll());
export const getSaved = (id: string) => tx<SavedFilm | undefined>("readonly", (s) => s.get(id));
export const removeSaved = (id: string) => tx("readwrite", (s) => s.delete(id));

export async function saveFilm(
  film: { id: string; title: string; poster: string; url: string; name: string },
  onProgress: (pct: number) => void,
) {
  const res = await fetch(`/api/public/download?url=${encodeURIComponent(film.url)}&name=${encodeURIComponent(film.name)}`);
  if (!res.ok || !res.body) throw new Error("Download failed");
  const total = Number(res.headers.get("content-length") || 0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    if (total) onProgress(Math.round((got / total) * 100));
  }
  const blob = new Blob(chunks as BlobPart[], { type: res.headers.get("content-type") || "video/mp4" });
  await tx("readwrite", (s) => s.put({ id: film.id, title: film.title, poster: film.poster, blob, savedAt: Date.now() }));
}

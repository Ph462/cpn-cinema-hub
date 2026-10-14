import { createFileRoute } from "@tanstack/react-router";

// Streams public-domain files from archive.org with an attachment header so the
// browser saves them to the device instead of opening a new tab.
export const Route = createFileRoute("/api/public/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const target = u.searchParams.get("url") ?? "";
        let parsed: URL;
        try {
          parsed = new URL(target);
        } catch {
          return new Response("Bad url", { status: 400 });
        }
        if (parsed.protocol !== "https:" || !/(^|\.)archive\.org$/.test(parsed.hostname) || !parsed.pathname.startsWith("/download/")) {
          return new Response("Not allowed", { status: 403 });
        }
        const upstream = await fetch(parsed.toString(), { redirect: "follow" });
        if (!upstream.ok || !upstream.body) return new Response("Unavailable", { status: 502 });
        const name = (u.searchParams.get("name") || parsed.pathname.split("/").pop() || "movie.mp4").replace(/[^\w.\- ]/g, "_");
        const headers = new Headers({
          "Content-Type": upstream.headers.get("content-type") ?? "video/mp4",
          "Content-Disposition": `attachment; filename="${name}"`,
        });
        const len = upstream.headers.get("content-length");
        if (len) headers.set("Content-Length", len);
        return new Response(upstream.body, { headers });
      },
    },
  },
});

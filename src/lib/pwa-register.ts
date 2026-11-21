// Single service-worker registrar. Refuses dev, iframes and Lovable preview hosts.
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
const LOVABLE = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];

function refused(): boolean {
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;
  const h = window.location.hostname.toLowerCase();
  const label = h.split(".")[0] ?? "";
  if (LOVABLE.some((d) => h.endsWith(d)) && (PREVIEW_LABEL.test(label) || /^project--.+-dev$/.test(label))) return true;
  if (/(^|\.)lovableproject(-dev)?\.com$/.test(h) || /(^|\.)beta\.lovable\.dev$/.test(h)) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

export async function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (refused()) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js") || r.installing?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()),
    );
    return;
  }
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

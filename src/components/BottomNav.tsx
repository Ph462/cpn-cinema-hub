import { Link } from "@tanstack/react-router";

const tabs = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/search", label: "Search", icon: "🔍" },
  { to: "/free", label: "Free", icon: "🎬" },
  { to: "/music", label: "Music", icon: "🎵" },
  { to: "/downloads", label: "Downloads", icon: "📥" },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="App tabs"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((t) => (
          <li key={t.to}>
            <Link
              to={t.to}
              activeOptions={{ exact: t.to === "/" }}
              className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

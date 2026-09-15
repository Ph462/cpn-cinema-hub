import { Link } from "@tanstack/react-router";
import type { Title } from "@/lib/catalog.functions";

export function TitleCard({ item }: { item: Title }) {
  return (
    <Link
      to="/title/$id"
      params={{ id: String(item.id) }}
      className="group relative block w-36 shrink-0 sm:w-44"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-card ring-1 ring-border transition-transform duration-300 group-hover:-translate-y-1 group-hover:ring-primary">
        {item.poster ? (
          <img
            src={item.poster}
            alt={`${item.name} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute top-2 left-2 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-foreground backdrop-blur">
          {item.type}
        </span>
        {item.rating ? (
          <span className="absolute right-2 bottom-2 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-bold text-accent backdrop-blur">
            ★ {item.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 truncate text-sm font-medium text-foreground">{item.name}</p>
      <p className="truncate text-xs text-muted-foreground">
        {[item.year, item.genres[0]].filter(Boolean).join(" · ")}
      </p>
    </Link>
  );
}

export function Row({
  label,
  slug,
  items,
}: {
  label: string;
  slug?: string;
  items: Title[];
}) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-end justify-between px-4 sm:px-8">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">{label}</h2>
        {slug ? (
          <Link
            to="/category/$slug"
            params={{ slug }}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            See more →
          </Link>
        ) : null}
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((i) => (
          <TitleCard key={i.id} item={i} />
        ))}
      </div>
    </section>
  );
}

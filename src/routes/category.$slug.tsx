import { createFileRoute, Link } from "@tanstack/react-router";
import { getCategory, CATEGORIES } from "@/lib/catalog.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { TitleCard } from "@/components/ui-bits";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => getCategory({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const label = loaderData?.label ?? "Category";
    return {
      meta: [
        { title: `${label} movies & series — CPN Movies` },
        {
          name: "description",
          content: `Browse the best ${label} movies and series on CPN Movies, with ratings, cast and previews.`,
        },
        { property: "og:title", content: `${label} movies & series — CPN Movies` },
        {
          property: "og:description",
          content: `Top-rated ${label} titles, updated regularly.`,
        },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { label, items, slug } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="px-4 pt-8 pb-20 sm:px-8">
        <h1 className="text-3xl font-black text-foreground sm:text-4xl">{label}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} titles</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                c.slug === slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          {items.map((t) => (
            <TitleCard key={t.id} item={t} />
          ))}
        </div>
      </main>
    </div>
  );
}

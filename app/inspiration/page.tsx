import Link from "next/link";

const categories = [
  "All",
  "Modern",
  "Sustainable",
  "Minimalist",
  "Industrial",
  "Scandinavian",
  "Luxury",
  "Hospitality",
  "Residential",
];

const articles = [
  {
    title: "Modern Living Room Trends",
    category: "Modern",
    copy: "Warm minimalism, curved furniture, natural textures, and light-driven layouts.",
    image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Sustainable Architecture Guide",
    category: "Sustainable",
    copy: "How material choices, daylight, and passive design shape better buildings.",
    image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Minimalist Kitchen Design",
    category: "Minimalist",
    copy: "Storage, lighting, and quiet surfaces for kitchens that age beautifully.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function InspirationPage() {
  return (
    <main>
      <section className="px-4 py-20 text-center sm:px-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Design <span className="text-primary">Inspiration</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
          Explore projects, expert insights, and design ideas from the ArchiCompass
          community.
        </p>
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-line bg-card px-5 py-4 text-left text-muted shadow-sm">
          Search projects and articles...
        </div>
      </section>

      <section className="border-y border-line bg-card px-4 py-7 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold",
                category === "All"
                  ? "bg-primary text-white"
                  : "border border-line bg-background text-muted",
              ].join(" ")}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Featured</h2>
            <p className="mt-2 text-muted">A starting point for the future content hub.</p>
          </div>
          <Link href="/designers" className="text-sm font-semibold text-primary hover:underline">
            Find a Designer
          </Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.title} className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
              <div
                className="h-60 bg-cover bg-center"
                style={{ backgroundImage: `url(${article.image})` }}
              />
              <div className="p-5">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {article.category}
                </span>
                <h3 className="mt-4 text-xl font-bold">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{article.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

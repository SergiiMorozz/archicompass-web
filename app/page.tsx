import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Find Interior Designers with AI",
  description:
    "Find interior designers and design studios by location, style, services, and portfolio. Turn inspiration photos into a clear AI-assisted project brief.",
  path: "/",
});

export const revalidate = 0;

const heroImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85";

const projectFallbacks = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=82",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=82",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=82",
];

type FeaturedProject = {
  category: string | null;
  id: string;
  image_path: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  title: string | null;
};

type FeaturedArticle = {
  category: string;
  excerpt: string;
  image_url: string | null;
  slug: string;
  title: string;
};

function metricValue(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

async function homeData() {
  const supabase = await createSupabaseServerClient();
  const [designers, studios, projects, profilesWithReviews, studiosWithReviews, featured, articles] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("user_type", "professional"),
      supabase.from("studios").select("id", { count: "exact", head: true }).eq("published", true),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("google_review_count").eq("user_type", "professional"),
      supabase.from("studios").select("google_review_count").eq("published", true),
      supabase
        .from("projects")
        .select("id, title, category, image_url, image_path, image_urls")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("inspiration_articles")
        .select("slug, title, excerpt, category, image_url")
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(3),
    ]);

  const reviewCount = [
    ...(profilesWithReviews.data ?? []),
    ...(studiosWithReviews.data ?? []),
  ].reduce((sum, item) => sum + (Number(item.google_review_count) || 0), 0);

  const featuredProjects = ((featured.data ?? []) as FeaturedProject[]).map((project, index) => {
    const publicStorageUrl = project.image_path
      ? supabase.storage.from("project-images").getPublicUrl(project.image_path).data.publicUrl
      : null;
    return {
      ...project,
      image: project.image_url || project.image_urls?.[0] || publicStorageUrl || projectFallbacks[index],
    };
  });

  return {
    metrics: [
      [metricValue((designers.count ?? 0) + (studios.count ?? 0)), "Designers & studios"],
      [metricValue(projects.count ?? 0), "Published projects"],
      [metricValue(reviewCount), "Linked Google reviews"],
    ],
    featuredProjects,
    featuredArticles: (articles.data ?? []) as FeaturedArticle[],
  };
}

export default async function Home() {
  const { featuredArticles, featuredProjects, metrics } = await homeData();

  return (
    <main>
      <section className="relative min-h-[700px] overflow-hidden bg-foreground text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt="Contemporary living room by an interior design professional"
          width="1800"
          height="1200"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,17,38,0.96)_0%,rgba(52,24,74,0.82)_48%,rgba(27,17,38,0.30)_100%)]" />
        <div className="relative mx-auto flex min-h-[700px] max-w-7xl items-center px-4 py-16 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#48d9c7]" />
              AI-assisted interior designer matching
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.03] sm:text-7xl">
              Find the right interior designer for your project.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
              Turn inspiration photos into a clear project brief, understand your style,
              and compare professionals who fit the real scope of your space.
            </p>

            <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-[1.25fr_0.75fr]">
              <Link
                href="/project-compass"
                className="group rounded-lg border border-[#a57aff] bg-[#7c3aed] px-6 py-5 text-center font-bold text-white shadow-[0_18px_45px_rgba(86,35,168,0.38)] transition hover:bg-[#8b4cf0]"
              >
                <span className="mr-2 rounded-full bg-white px-2 py-1 text-xs font-bold text-primary">AI</span>
                Discover Your Style & Build a Brief
                <span className="ml-2 transition group-hover:translate-x-1">&#8594;</span>
              </Link>
              <Link
                href="/designers"
                className="rounded-lg border border-white/55 bg-white/12 px-6 py-5 text-center font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Find a Designer
              </Link>
            </div>

            <Link href="/get-started" className="mt-5 inline-flex text-sm font-semibold text-white/80 hover:text-white">
              Are you a designer or architect? Join the beta &#8594;
            </Link>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/78">
              <span><b className="text-[#5de1d1]">&#10003;</b> Real portfolios</span>
              <span><b className="text-[#5de1d1]">&#10003;</b> Direct conversations</span>
              <span><b className="text-[#5de1d1]">&#10003;</b> Free during beta</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-card">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-3">
          {metrics.map(([value, label], index) => (
            <div key={label} className="border-b border-line px-6 py-7 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <div className={[
                "text-4xl font-bold",
                index === 0 ? "text-primary" : index === 1 ? "text-accent" : "text-warm",
              ].join(" ")}>{value}</div>
              <div className="mt-1 text-sm font-semibold text-muted">{label}</div>
              <div className="mt-2 text-xs text-muted">Live platform count</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-accent">How it works</p>
          <h2 className="mt-3 text-4xl font-bold">From saved images to a useful first conversation.</h2>
          <p className="mt-4 text-lg leading-8 text-muted">
            ArchiCompass connects visual taste with the information a professional needs:
            scope, rooms, budget, timeline, services, and project status.
          </p>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {[
            ["01", "Add inspiration", "Upload rooms, details, and moods. AI reads recurring visual signals."],
            ["02", "Shape the brief", "Add space, rooms, budget, timing, 3D, and supervision needs."],
            ["03", "Meet the right pro", "Compare portfolio evidence and send a structured request."],
          ].map(([number, title, copy], index) => (
            <article key={title} className="rounded-lg border border-line bg-card p-6 shadow-[0_14px_40px_rgba(54,31,73,0.07)]">
              <div className={[
                "grid h-11 w-11 place-items-center rounded-lg text-sm font-bold text-white",
                index === 0 ? "bg-primary" : index === 1 ? "bg-accent" : "bg-warm",
              ].join(" ")}>{number}</div>
              <h3 className="mt-5 text-2xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-[#261631] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="rounded-full bg-[#4fd8c7] px-3 py-1 text-xs font-bold text-[#173d39]">AI PROJECT COMPASS</span>
            <h2 className="mt-5 text-4xl font-bold">Your photos become more than a moodboard.</h2>
            <p className="mt-4 text-lg leading-8 text-white/72">
              Get a style direction, palette, material clues, and matching signals. Then
              keep building the same brief instead of starting over in another tool.
            </p>
            <Link href="/project-compass" className="mt-7 inline-flex rounded-lg bg-[#7c3aed] px-6 py-4 font-bold text-white shadow-lg shadow-[#7c3aed]/25">
              Analyze inspiration photos &#8594;
            </Link>
          </div>

          <div className="rounded-lg border border-white/15 bg-white p-6 text-foreground shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <div className="text-xs font-bold uppercase text-primary">Example AI direction</div>
                <div className="mt-1 text-3xl font-bold">Warm Japandi</div>
              </div>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">Ready to brief</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Palette", "Cream, clay, warm oak"],
                ["Materials", "Light wood, linen, stone"],
                ["Mood", "Calm, tactile, uncluttered"],
                ["Designer signals", "Residential, joinery, natural finishes"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-lg border border-line bg-background p-4">
                  <div className="text-xs font-bold uppercase text-muted">{title}</div>
                  <div className="mt-2 font-semibold">{copy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-warm">Fresh portfolio work</p>
            <h2 className="mt-2 text-4xl font-bold">Projects on ArchiCompass</h2>
          </div>
          <Link href="/designers" className="font-bold text-primary hover:underline">Browse all professionals &#8594;</Link>
        </div>

        {featuredProjects.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <article key={project.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-[0_14px_40px_rgba(54,31,73,0.08)]">
                <Link href={`/projects/${project.id}`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image}
                    alt={`${project.title || "Interior design project"}${project.category ? ` - ${project.category}` : ""}`}
                    width="1000"
                    height="750"
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-5">
                    <div className="text-xs font-bold uppercase text-accent">{project.category || "Interior project"}</div>
                    <h3 className="mt-2 text-xl font-bold">{project.title || "Untitled project"}</h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-line bg-card p-8 text-center">
            <h3 className="text-xl font-bold">The first public projects will appear here.</h3>
            <p className="mt-2 text-muted">Every published project will immediately update the live counter above.</p>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-card px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase text-accent">Inspiration Hub</p>
              <h2 className="mt-2 text-4xl font-bold">Ideas that help you make better project decisions.</h2>
              <p className="mt-4 text-lg leading-8 text-muted">
                Explore practical guides to styles, materials, rooms, renovation planning,
                and sustainable interiors. Save useful articles to your client workspace.
              </p>
            </div>
            <Link href="/inspiration" className="font-bold text-primary hover:underline">
              Explore Inspiration Hub &#8594;
            </Link>
          </div>

          {featuredArticles.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {featuredArticles.map((article) => (
                <article key={article.slug} className="overflow-hidden rounded-lg border border-line bg-background shadow-sm">
                  <Link href={`/inspiration/${article.slug}`} className="block">
                    {article.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.image_url}
                        alt={article.title}
                        width="1000"
                        height="700"
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-[4/3] bg-primary-soft" aria-hidden="true" />
                    )}
                    <div className="p-5">
                      <div className="text-xs font-bold uppercase text-accent">{article.category}</div>
                      <h3 className="mt-2 text-xl font-bold hover:text-primary">{article.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p>
                      <div className="mt-5 text-sm font-bold text-primary">Read article &#8594;</div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-line bg-background p-7">
              <h3 className="text-xl font-bold">The first inspiration guides are being prepared.</h3>
              <Link href="/inspiration" className="mt-3 inline-flex font-bold text-primary hover:underline">Open the Hub</Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-accent text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-white/65">For designers and studios</p>
            <h2 className="mt-2 text-4xl font-bold">Show strong work. Receive clearer client requests.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/80">Create a public portfolio, connect your Google rating, and manage structured briefs in one workspace.</p>
          </div>
          <Link href="/get-started" className="rounded-lg bg-white px-6 py-4 text-center font-bold text-accent">Join as a Professional</Link>
        </div>
      </section>
    </main>
  );
}

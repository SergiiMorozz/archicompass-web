import type { Metadata } from "next";
import Link from "next/link";
import { applyPolishArticleCopy, homeCopy } from "@/content/pl/copy";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: homeCopy.metadata.title,
  description: homeCopy.metadata.description,
  path: "/",
});

export const revalidate = 0;

const heroImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85";

const aiResultImages = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=86",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=86",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=86",
];

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
  return new Intl.NumberFormat("pl-PL").format(value);
}

const projectCategoryLabels: Record<string, string> = {
  Apartment: "Mieszkanie",
  House: "Dom",
  Loft: "Loft",
  Hospitality: "Hotelarstwo i gastronomia",
  "Rental property": "Nieruchomość na wynajem",
  Kitchen: "Kuchnia",
  "Dining room": "Jadalnia",
  "Home office": "Gabinet domowy",
  Bedroom: "Sypialnia",
  Penthouse: "Penthouse",
  Office: "Biuro",
};

function projectCategoryLabel(value: string | null) {
  if (!value) return "Projekt wnętrza";
  return projectCategoryLabels[value] || value;
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
      [metricValue((designers.count ?? 0) + (studios.count ?? 0)), homeCopy.metrics.designers],
      [metricValue(projects.count ?? 0), homeCopy.metrics.projects],
      [metricValue(reviewCount), homeCopy.metrics.reviews],
    ],
    featuredProjects,
    featuredArticles: ((articles.data ?? []) as FeaturedArticle[]).map(applyPolishArticleCopy),
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
          alt="Współczesny salon zaprojektowany przez specjalistę wnętrz"
          width="1800"
          height="1200"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,17,38,0.96)_0%,rgba(52,24,74,0.82)_48%,rgba(27,17,38,0.30)_100%)]" />
        <div className="relative mx-auto flex min-h-[700px] max-w-7xl items-center px-4 py-16 sm:px-6">
          <div className="max-w-4xl">
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] sm:text-6xl">
              {homeCopy.hero.headline}
            </h1>
            <div className="mt-6 max-w-3xl space-y-2 text-lg font-medium leading-8 text-white sm:text-xl">
              {homeCopy.hero.lead.map((sentence) => (
                <p key={sentence}>{sentence}</p>
              ))}
            </div>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
              {homeCopy.hero.body}
            </p>

            <div className="mt-9 grid max-w-3xl gap-3 sm:grid-cols-[1.25fr_0.75fr]">
              <Link
                href="/project-compass"
                className="group inline-flex min-h-[68px] items-center justify-center gap-3 rounded-xl border border-[#c7a8ff] bg-[#7c3aed] px-5 py-4 text-center text-[15px] font-bold leading-5 text-white shadow-[0_18px_45px_rgba(86,35,168,0.38)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#8b4cf0] hover:shadow-[0_24px_55px_rgba(86,35,168,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-6 sm:text-base"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/16 text-base transition duration-300 group-hover:scale-110 group-hover:rotate-12" aria-hidden="true">✦</span>
                <span>{homeCopy.hero.primaryCta}</span>
                <span className="shrink-0 text-lg transition duration-300 group-hover:translate-x-1" aria-hidden="true">&#8594;</span>
              </Link>
              <Link
                href="/designers"
                className="group inline-flex min-h-[68px] items-center justify-center gap-2 rounded-xl border border-white/55 bg-white/12 px-5 py-4 text-center text-[15px] font-bold leading-5 text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/20 hover:shadow-[0_18px_45px_rgba(16,8,24,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-6 sm:text-base"
              >
                <span className="whitespace-nowrap">{homeCopy.hero.secondaryCta}</span>
                <span className="text-lg transition duration-300 group-hover:translate-x-1" aria-hidden="true">&#8594;</span>
              </Link>
            </div>

            <Link href="/get-started" className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white">
              <span className="grid h-6 w-6 place-items-center rounded-md border border-white/25 bg-white/10 text-xs" aria-hidden="true">+</span>
              {homeCopy.hero.designerCta}
              <span className="transition group-hover:translate-x-1" aria-hidden="true">&#8594;</span>
            </Link>

            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/82">
              {homeCopy.hero.benefits.map((benefit) => (
                <span key={benefit} className="inline-flex items-center gap-2">
                  <b className="grid h-5 w-5 place-items-center rounded-full bg-[#5de1d1]/16 text-xs text-[#5de1d1]">&#10003;</b>
                  {benefit}
                </span>
              ))}
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
              <div className="mt-2 text-xs text-muted">{homeCopy.metrics.caption}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-accent">{homeCopy.howItWorks.eyebrow}</p>
          <h2 className="mt-3 text-4xl font-bold">{homeCopy.howItWorks.headline}</h2>
          <p className="mt-4 text-lg leading-8 text-muted">
            {homeCopy.howItWorks.body}
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {homeCopy.howItWorks.steps.map(({ body, number, title }, index) => (
            <article key={title} className="group relative overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-[0_14px_40px_rgba(54,31,73,0.07)] transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_48px_rgba(54,31,73,0.13)] sm:p-7">
              <div className={[
                "absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-10",
                index === 0 ? "bg-primary" : index === 1 ? "bg-accent" : "bg-warm",
              ].join(" ")} aria-hidden="true" />
              <div className={[
                "relative grid h-12 w-12 place-items-center rounded-xl text-sm font-bold text-white shadow-lg",
                index === 0 ? "bg-primary" : index === 1 ? "bg-accent" : "bg-warm",
              ].join(" ")}>{number}</div>
              <div className="relative mt-6 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold">{title}</h3>
                <span className={[
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold transition group-hover:scale-110",
                  index === 0 ? "border-primary/20 bg-primary-soft text-primary" : index === 1 ? "border-accent/20 bg-accent-soft text-accent" : "border-warm/20 bg-warm-soft text-warm",
                ].join(" ")} aria-hidden="true">{index === 0 ? "+" : index === 1 ? "AI" : "→"}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-primary/15 bg-primary-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20" aria-hidden="true">AI</span>
            <div>
              <h3 className="text-lg font-bold">Precyzyjne dopasowanie zamiast przypadkowego szukania</h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                Z całej bazy projektantów w Polsce otrzymujesz osoby najlepiej dopasowane do Twojego stylu, zakresu prac, budżetu i lokalizacji.
              </p>
            </div>
          </div>
          <Link href="/project-compass" className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Zacznij z AI
            <span className="text-base transition group-hover:translate-x-1" aria-hidden="true">&#8594;</span>
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-[#261631] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#4fd8c7] px-3 py-1.5 text-xs font-bold text-[#173d39]">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#173d39]/12 text-[10px]" aria-hidden="true">AI</span>
              {homeCopy.aiProjectCompass.eyebrow}
            </span>
            <h2 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">{homeCopy.aiProjectCompass.headline}</h2>
            <p className="mt-5 text-lg leading-8 text-white/74">
              {homeCopy.aiProjectCompass.body}
            </p>
            <div className="mt-7 flex flex-wrap gap-4 text-sm text-white/72">
              <span className="inline-flex items-center gap-2"><b className="grid h-5 w-5 place-items-center rounded-full bg-[#4fd8c7]/16 text-xs text-[#5de1d1]">&#10003;</b> Styl i paleta</span>
              <span className="inline-flex items-center gap-2"><b className="grid h-5 w-5 place-items-center rounded-full bg-[#4fd8c7]/16 text-xs text-[#5de1d1]">&#10003;</b> Sygnały do dopasowania</span>
            </div>
            <Link href="/project-compass" className="group mt-8 inline-flex min-h-[58px] items-center justify-center gap-3 rounded-xl border border-[#bfa0ff] bg-[#7c3aed] px-5 py-3.5 text-center font-bold text-white shadow-[0_16px_38px_rgba(111,51,236,0.32)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#8b4cf0] hover:shadow-[0_22px_48px_rgba(111,51,236,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/16 transition duration-300 group-hover:scale-110 group-hover:rotate-12" aria-hidden="true">✦</span>
              {homeCopy.aiProjectCompass.cta}
              <span className="text-lg transition group-hover:translate-x-1" aria-hidden="true">&#8594;</span>
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-[#7c3aed]/20 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/20 bg-[#fcfbff] p-3 text-foreground shadow-2xl sm:p-4">
              <div className="grid gap-3 sm:grid-cols-[1.16fr_0.84fr]">
                <figure className="group relative min-h-64 overflow-hidden rounded-xl bg-[#ded6cb] sm:min-h-[23rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aiResultImages[0]}
                    alt="Przykładowa inspiracja wnętrza w naturalnym, ciepłym stylu"
                    width="1200"
                    height="900"
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#21162c]/85 via-[#21162c]/18 to-transparent p-4 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-bold backdrop-blur">Inspiracja 01</span>
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#4fd8c7] text-xs font-bold text-[#173d39] shadow-lg" aria-label="Analizowane przez AI">AI</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold">AI rozpoznaje światło, materiały i proporcje.</p>
                  </div>
                </figure>

                <div className="grid gap-3 sm:grid-rows-2">
                  <figure className="relative min-h-36 overflow-hidden rounded-xl bg-[#d9d0c3] sm:min-h-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aiResultImages[1]}
                      alt="Druga inspiracja do analizy stylu wnętrza"
                      width="900"
                      height="650"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[#21162c]/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">Inspiracja 02</span>
                  </figure>
                  <figure className="relative min-h-36 overflow-hidden rounded-xl bg-[#e4dacd] sm:min-h-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aiResultImages[2]}
                      alt="Trzecia inspiracja do analizy stylu wnętrza"
                      width="900"
                      height="650"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[#21162c]/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">Inspiracja 03</span>
                  </figure>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-[#ded5eb] bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase text-primary">{homeCopy.aiProjectCompass.example.eyebrow}</div>
                    <div className="mt-1 text-3xl font-bold sm:text-4xl">{homeCopy.aiProjectCompass.example.style}</div>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent">{homeCopy.aiProjectCompass.example.status}</span>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase text-muted">{homeCopy.aiProjectCompass.example.items[0][0]}</div>
                    <div className="mt-1 text-sm font-semibold">{homeCopy.aiProjectCompass.example.items[0][1]}</div>
                  </div>
                  <div className="flex gap-2" aria-label="Przykładowa paleta kolorów">
                    {['#f3eadb', '#d7c09a', '#b8835b', '#51473f'].map((color) => (
                      <span key={color} className="h-8 w-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {homeCopy.aiProjectCompass.example.items.slice(1, 3).map(([title]) => (
                    <span key={title} className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">{title}</span>
                  ))}
                  <span className="rounded-full bg-warm-soft px-3 py-1.5 text-xs font-bold text-warm">Dopasowanie projektantów</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-warm">Najnowsze realizacje</p>
            <h2 className="mt-2 text-4xl font-bold">{homeCopy.latestProjects.headline}</h2>
          </div>
          <Link href="/designers" className="font-bold text-primary hover:underline">{homeCopy.latestProjects.cta} &#8594;</Link>
        </div>

        {featuredProjects.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <article key={project.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-[0_14px_40px_rgba(54,31,73,0.08)]">
                <Link href={`/projects/${project.id}`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image}
                    alt={`${project.title || "Projekt wnętrza"}${project.category ? ` - ${projectCategoryLabel(project.category)}` : ""}`}
                    width="1000"
                    height="750"
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-5">
                    <div className="text-xs font-bold uppercase text-accent">{projectCategoryLabel(project.category)}</div>
                    <h3 className="mt-2 text-xl font-bold">{project.title || "Projekt bez tytułu"}</h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-line bg-card p-8 text-center">
            <h3 className="text-xl font-bold">{homeCopy.latestProjects.emptyTitle}</h3>
            <p className="mt-2 text-muted">{homeCopy.latestProjects.emptyBody}</p>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-card px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase text-accent">{homeCopy.inspirationHub.eyebrow}</p>
              <h2 className="mt-2 text-4xl font-bold">{homeCopy.inspirationHub.headline}</h2>
              <p className="mt-4 text-lg leading-8 text-muted">
                {homeCopy.inspirationHub.body}
              </p>
            </div>
            <Link href="/inspiration" className="font-bold text-primary hover:underline">
              {homeCopy.inspirationHub.cta} &#8594;
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
                      <div className="mt-5 text-sm font-bold text-primary">{homeCopy.inspirationHub.readCta} &#8594;</div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-line bg-background p-7">
              <h3 className="text-xl font-bold">{homeCopy.inspirationHub.emptyTitle}</h3>
              <Link href="/inspiration" className="mt-3 inline-flex font-bold text-primary hover:underline">{homeCopy.inspirationHub.emptyCta}</Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-accent text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-white/65">{homeCopy.forDesigners.eyebrow}</p>
            <h2 className="mt-2 text-4xl font-bold">{homeCopy.forDesigners.headline}</h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/80">{homeCopy.forDesigners.body}</p>
          </div>
          <Link href="/get-started" className="rounded-lg bg-white px-6 py-4 text-center font-bold text-accent">{homeCopy.forDesigners.cta}</Link>
        </div>
      </section>
    </main>
  );
}

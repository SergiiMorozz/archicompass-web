import type { Metadata } from "next";
import Link from "next/link";
import { applyPolishArticleCopy } from "@/content/pl/copy";
import { getSiteCopy } from "@/content/site-copy";
import { localizeArticle, type ArticleLocalizationFields } from "@/lib/article-content";
import { localeMetadata, siteLocale } from "@/lib/site-locale";
import { createPublicContentClient } from "@/lib/public-content-client";
import { pageMetadata } from "@/lib/seo";

const copy = getSiteCopy();
const homeCopy = copy.home;

export const metadata: Metadata = pageMetadata({
  title: homeCopy.metadata.title,
  description: homeCopy.metadata.description,
  path: "/",
});

// The homepage shows public catalogue data only. Refresh it periodically instead
// of rendering it for every visitor and crawler request.
export const revalidate = 300;

const heroImage =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=88";

const inspirationThumbnails = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=84",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=84",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=84",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=600&q=84",
];

const projectFallbacks = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=82",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=82",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=82",
];

const paletteColors = ["#f6efe2", "#ddc7a5", "#b98d5e", "#685346"];
const valueMarks = ["◎", "↗", "↔", "✦"];

type FeaturedProject = {
  category: string | null;
  id: string;
  image_path: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  title: string | null;
};

type FeaturedArticle = ArticleLocalizationFields & {
  category: string;
  slug: string;
};

function metricValue(value: number) {
  return new Intl.NumberFormat(localeMetadata[siteLocale].number).format(value);
}

const projectCategoryLabels = homeCopy.projectCategories;

function projectCategoryLabel(value: string | null) {
  if (!value) return homeCopy.latestProjects.fallbackCategory;
  return projectCategoryLabels[value] || value;
}

async function homeData() {
  const supabase = createPublicContentClient();
  const [designers, studios, projects, featured, articles] = await Promise.all([
    supabase.from("profiles").select("id, is_demo, google_review_count").eq("user_type", "professional"),
    supabase.from("studios").select("id, is_demo, google_review_count").eq("published", true),
    supabase.from("projects").select("id, profile_id"),
    supabase
      .from("projects")
      .select("id, title, category, image_url, image_path, image_urls")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("inspiration_articles")
      .select("slug, title, excerpt, body, category, image_url, author_name, title_pl, title_en, excerpt_pl, excerpt_en, author_name_pl, author_name_en, cover_alt_pl, cover_alt_en, meta_title_pl, meta_title_en, meta_description_pl, meta_description_en, focus_keyword_pl, focus_keyword_en, content_blocks")
      .eq("status", "published")
      .eq("content_section", "inspiration")
      .eq("noindex", false)
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  const featuredProjects = ((featured.data ?? []) as FeaturedProject[]).map((project, index) => {
    const publicStorageUrl = project.image_path
      ? supabase.storage.from("project-images").getPublicUrl(project.image_path).data.publicUrl
      : null;
    return {
      ...project,
      image: project.image_url || project.image_urls?.[0] || publicStorageUrl || projectFallbacks[index],
    };
  });

  const publicProfiles = (designers.data ?? []).filter((profile) => !profile.is_demo);
  const publicStudios = (studios.data ?? []).filter((studio) => !studio.is_demo);
  const publicProfileIds = new Set(publicProfiles.map((profile) => profile.id));
  const publicProjects = (projects.data ?? []).filter((project) => publicProfileIds.has(project.profile_id));
  const reviewCount = [...publicProfiles, ...publicStudios].reduce(
    (sum, item) => sum + (Number(item.google_review_count) || 0),
    0
  );

  return {
    metrics: [
      ...(publicProfiles.length + publicStudios.length
        ? [[metricValue(publicProfiles.length + publicStudios.length), homeCopy.metrics.designers]]
        : []),
      ...(publicProjects.length ? [[metricValue(publicProjects.length), homeCopy.metrics.projects]] : []),
      ...(reviewCount ? [[metricValue(reviewCount), homeCopy.metrics.reviews]] : []),
    ],
    featuredProjects,
    featuredArticles: ((articles.data ?? []) as FeaturedArticle[]).map((article) => {
      const legacy = siteLocale === "pl" ? applyPolishArticleCopy(article) : article;
      return localizeArticle(legacy, siteLocale);
    }),
  };
}

function Arrow() {
  return <span className="text-lg transition duration-300 group-hover:translate-x-1" aria-hidden="true">&#8594;</span>;
}

function Checklist({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <span key={item} className={`inline-flex items-center gap-2 text-sm font-medium ${dark ? "text-white/88" : "text-foreground"}`}>
          <b className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs ${dark ? "bg-[#5de1d1]/18 text-[#7ff3e5]" : "bg-[#22c55e]/14 text-[#16a34a]"}`}>&#10003;</b>
          {item}
        </span>
      ))}
    </div>
  );
}

function Palette({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex ${compact ? "gap-1.5" : "gap-2"}`} aria-hidden="true">
      {paletteColors.map((color) => (
        <span
          key={color}
          className={`${compact ? "h-4 w-4" : "h-6 w-6"} rounded-full border border-black/10 shadow-sm`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function ResultSample({ hero = false }: { hero?: boolean }) {
  const visual = homeCopy.hero.visual;
  return (
    <div className={hero ? "relative z-10 w-full max-w-[30rem]" : "w-full"}>
      <div className={`rounded-2xl border ${hero ? "border-white/25 bg-white/95 shadow-[0_28px_72px_rgba(9,3,18,0.36)] backdrop-blur" : "border-line bg-card shadow-[0_20px_55px_rgba(54,31,73,0.14)]"} p-4 text-foreground sm:p-5`}>
        <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{visual.tag}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{visual.directionLabel}</p>
            <p className="text-xl font-bold leading-tight sm:text-2xl">{visual.styleValue}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-bold text-white">AI</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl border border-line bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{visual.paletteLabel}</p>
            <div className="mt-2"><Palette compact /></div>
          </div>
          <div className="rounded-xl border border-line bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{visual.matchLabel}</p>
            <p className="mt-1 text-xl font-bold text-primary">{visual.matchValue}</p>
          </div>
          <div className="rounded-xl border border-line bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{visual.materialsLabel}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-foreground">{visual.materialsValue}</p>
          </div>
          <div className="rounded-xl border border-line bg-background p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{visual.briefLabel}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-foreground">{visual.briefValue}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary-soft p-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-xs font-bold text-white">SW</span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{visual.professionalLabel}</p>
            <p className="truncate text-sm font-bold text-foreground">{visual.professionalValue}</p>
          </div>
          <span className="ml-auto text-sm font-bold text-primary">{visual.matchValue}</span>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const { featuredArticles, featuredProjects, metrics } = await homeData();
  const { stepOne, stepTwo, stepThree } = homeCopy.howItWorks;

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative isolate min-h-[690px] overflow-hidden bg-foreground text-white lg:min-h-[740px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={homeCopy.hero.headline}
          width="2000"
          height="1300"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,14,45,0.95)_0%,rgba(41,20,64,0.87)_44%,rgba(27,14,43,0.48)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgba(21,10,34,0.54),transparent)]" />

        <div className="relative mx-auto grid min-h-[690px] max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-4 py-16 sm:px-6 lg:min-h-[740px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:py-20">
          <div className="min-w-0 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-bold tracking-wide text-white backdrop-blur-sm">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#5de1d1] text-[11px] text-[#251439]" aria-hidden="true">✦</span>
              {homeCopy.hero.badge}
            </span>
            <h1 className="mt-6 max-w-4xl break-words text-4xl font-bold leading-[1.04] tracking-normal lg:text-6xl xl:text-7xl">
              {homeCopy.hero.headline}
            </h1>
            <p className="mt-6 max-w-2xl break-words text-lg leading-8 text-white/84 sm:text-xl">{homeCopy.hero.body}</p>

            <div className="mt-7 max-w-2xl">
              <Checklist items={homeCopy.hero.checklist} dark />
            </div>

            <div className="mt-9 flex flex-col gap-3 lg:flex-row">
              <Link
                href="/project-compass"
                className="group inline-flex min-h-[60px] w-full min-w-0 items-center justify-center gap-3 rounded-xl border border-[#caaeff] bg-[#7a35e8] px-5 py-3.5 text-center font-bold text-white shadow-[0_18px_48px_rgba(74,26,146,0.54)] transition duration-300 hover:-translate-y-1 hover:bg-[#8c4cf0] hover:shadow-[0_25px_58px_rgba(74,26,146,0.68)] lg:w-auto lg:px-6"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/16 text-base transition duration-300 group-hover:scale-110 group-hover:rotate-12" aria-hidden="true">✦</span>
                <span className="min-w-0 break-words">{homeCopy.hero.primaryCta}</span>
                <Arrow />
              </Link>
              <Link
                href="/designers"
                className="group inline-flex min-h-[60px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/10 px-5 py-3.5 text-center font-bold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white hover:bg-white/20 lg:w-auto lg:px-6"
              >
                {homeCopy.hero.secondaryCta}
                <Arrow />
              </Link>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/68">{homeCopy.hero.reassurance}</p>
          </div>

          <div className="relative hidden min-h-[500px] items-center justify-center lg:flex">
            <div className="absolute inset-8 rounded-[2rem] border border-white/15 bg-white/5 backdrop-blur-[2px]" />
            <div className="absolute -top-2 right-0 h-28 w-28 rounded-full bg-[#5de1d1]/25 blur-3xl" />
            <div className="absolute bottom-4 left-2 h-36 w-36 rounded-full bg-[#a970ff]/30 blur-3xl" />
            <ResultSample hero />
            <div className="absolute -bottom-1 left-2 rounded-xl border border-white/25 bg-[#281342]/85 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur">
              <span className="mr-2 text-[#5de1d1]" aria-hidden="true">✦</span>{homeCopy.hero.visual.cta}
            </div>
            <div className="absolute right-0 top-8 rounded-xl border border-white/25 bg-white/95 px-3.5 py-3 text-foreground shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{homeCopy.hero.visual.matchLabel}</p>
              <p className="text-lg font-bold text-primary">{homeCopy.hero.visual.matchValue}</p>
            </div>
          </div>

          <div className="lg:hidden"><ResultSample hero /></div>
        </div>
      </section>

      <section className="relative z-10 border-b border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {homeCopy.trust.items.map(({ body, icon, title }, index) => (
            <article key={title} className="group flex min-h-[104px] items-start gap-3 rounded-xl border border-transparent p-3 transition hover:border-line hover:bg-background">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg ${index === 0 ? "bg-primary-soft text-primary" : index === 1 ? "bg-[#fff4dd] text-[#b97800]" : index === 2 ? "bg-accent-soft text-accent" : "bg-warm-soft text-warm"}`} aria-hidden="true">{icon}</span>
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="mt-1 text-sm leading-5 text-muted">{body}</p>
              </div>
            </article>
          ))}
        </div>
        {metrics.length ? <div className={[
          "mx-auto grid max-w-7xl border-t border-line",
          metrics.length === 2 ? "sm:grid-cols-2" : metrics.length >= 3 ? "sm:grid-cols-3" : "",
        ].join(" ")}>
          {metrics.map(([value, label], index) => (
            <div key={label} className="flex items-center justify-center gap-3 border-b border-line px-5 py-5 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <span className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold ${index === 0 ? "bg-primary-soft text-primary" : index === 1 ? "bg-accent-soft text-accent" : "bg-warm-soft text-warm"}`} aria-hidden="true">{valueMarks[index] ?? "✦"}</span>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs font-semibold text-muted">{label}</p>
              </div>
            </div>
          ))}
        </div> : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-accent">{homeCopy.howItWorks.eyebrow}</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{homeCopy.howItWorks.headline}</h2>
          <p className="mt-5 text-lg leading-8 text-muted">{homeCopy.howItWorks.body}</p>
        </div>

        <div className="mt-11 grid gap-5 lg:grid-cols-3">
          <article className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_16px_44px_rgba(54,31,73,0.08)]">
            <div className="grid grid-cols-2 gap-1 bg-primary-soft p-2" aria-hidden="true">
              {inspirationThumbnails.map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className={`h-28 w-full rounded-lg object-cover ${index === 0 ? "col-span-2 h-36" : ""}`} />
              ))}
            </div>
            <div className="p-6 sm:p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-sm font-bold text-white">{stepOne.number}</span>
              <h3 className="mt-5 text-2xl font-bold leading-tight">{stepOne.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{stepOne.body}</p>
              <p className="mt-3 rounded-lg bg-primary-soft px-3 py-2 text-xs font-medium leading-5 text-primary">{stepOne.note}</p>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary-soft/50 p-6 shadow-[0_16px_44px_rgba(54,31,73,0.08)] sm:p-7">
            <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full border-[24px] border-primary/10" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-sm font-bold text-white">{stepTwo.number}</span>
              <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{stepTwo.badge}</span>
            </div>
            <h3 className="relative mt-5 text-2xl font-bold leading-tight">{stepTwo.title}</h3>
            <p className="relative mt-3 text-sm leading-6 text-muted">{stepTwo.body}</p>

            <div className="relative mt-5 rounded-xl border border-white bg-card/90 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{stepTwo.preview.styleLabel}</p>
                  <p className="font-bold text-foreground">{stepTwo.preview.styleValue}</p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-full border-[7px] border-[#e9d9bf] border-r-[#b98d5e] border-t-[#6828c8] text-[9px] font-bold text-primary">AI</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{stepTwo.preview.paletteLabel}</p>
                  <div className="mt-2"><Palette compact /></div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{stepTwo.preview.materialsLabel}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-foreground">{stepTwo.preview.materialsValue}</p>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-accent-soft px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-accent">{stepTwo.preview.moodLabel}</p>
                <p className="mt-1 text-xs font-semibold text-foreground">{stepTwo.preview.moodValue}</p>
              </div>
            </div>
            <p className="relative mt-4 text-sm leading-6 text-muted">{stepTwo.footer}</p>
            <p className="relative mt-3 text-sm font-bold leading-6 text-foreground">{stepTwo.emphasis}</p>
          </article>

          <article className="rounded-2xl border border-line bg-card p-6 shadow-[0_16px_44px_rgba(54,31,73,0.08)] sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-sm font-bold text-white">{stepThree.number}</span>
            <h3 className="mt-5 text-2xl font-bold leading-tight">{stepThree.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{stepThree.body}</p>

            <div className="mt-5 space-y-2.5">
              {stepThree.designers.map(({ location, mark, match, name, tag }) => (
                <div key={name} className="flex items-center gap-3 rounded-xl border border-line bg-background p-3 transition hover:border-primary/30">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-xs font-bold text-white" aria-label={`${name} logo`}>{mark}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{name}</p>
                    <p className="truncate text-xs text-muted">{tag} · {location}</p>
                  </div>
                  <span className="ml-auto text-sm font-bold text-primary">{match}</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/project-compass" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-white shadow-[0_14px_34px_rgba(86,35,168,0.2)] transition hover:-translate-y-0.5 hover:bg-primary/90">
            {homeCopy.howItWorks.cta}<Arrow />
          </Link>
          <Link href="/project-compass" className="font-bold text-primary transition hover:text-primary/75 hover:underline">
            {homeCopy.howItWorks.secondaryCta} &#8594;
          </Link>
        </div>
      </section>

      <section className="bg-[#24132f] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-28">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5de1d1]">{homeCopy.whyExists.eyebrow}</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{homeCopy.whyExists.headline}</h2>
            <p className="mt-5 text-lg leading-8 text-white/72">{homeCopy.whyExists.body}</p>
            <p className="mt-5 text-lg font-semibold leading-8 text-white">{homeCopy.whyExists.body2}</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {homeCopy.whyExists.flow.map((step, index) => (
                <span key={step} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold text-white/90">
                  <b className="grid h-5 w-5 place-items-center rounded-full bg-[#5de1d1]/16 text-[10px] text-[#72f1e3]">{index + 1}</b>{step}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-primary/20 blur-3xl" aria-hidden="true" />
            <div className="relative"><ResultSample /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-3xl border border-primary/15 bg-primary-soft/50 p-7 shadow-[0_16px_44px_rgba(54,31,73,0.08)] sm:p-10">
            <div className="grid gap-7 sm:grid-cols-[1.1fr_0.9fr] sm:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">{homeCopy.forClients.eyebrow}</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight">{homeCopy.forClients.headline}</h2>
                <p className="mt-4 leading-7 text-muted">{homeCopy.forClients.body}</p>
              </div>
              <div className="rounded-2xl border border-white bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-primary">AI</span><span className="h-2 w-2 rounded-full bg-accent" /></div>
                <div className="mt-4 h-2 rounded-full bg-primary-soft"><span className="block h-full w-[74%] rounded-full bg-primary" /></div>
                <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden="true">
                  {inspirationThumbnails.slice(0, 3).map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" className="aspect-square rounded-lg object-cover" />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-7"><Checklist items={homeCopy.forClients.checklist} /></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/project-compass" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary/90">{homeCopy.forClients.primaryCta}<Arrow /></Link>
              <Link href="/designers" className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-card px-5 py-3 font-bold text-foreground transition hover:border-primary/50">{homeCopy.forClients.secondaryCta}</Link>
            </div>
          </article>

          <article className="overflow-hidden rounded-3xl border border-accent/20 bg-accent-soft/45 p-7 shadow-[0_16px_44px_rgba(54,31,73,0.08)] sm:p-10">
            <div className="grid gap-7 sm:grid-cols-[1.1fr_0.9fr] sm:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-accent">{homeCopy.forDesigners.eyebrow}</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight">{homeCopy.forDesigners.headline}</h2>
                <p className="mt-4 leading-7 text-muted">{homeCopy.forDesigners.body}</p>
              </div>
              <div className="rounded-2xl border border-white bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-xs font-bold text-white">SW</span><div><p className="text-sm font-bold">Studio Wątek</p><p className="text-xs text-muted">Portfolio · Warszawa</p></div></div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-semibold"><span className="rounded-lg bg-accent-soft px-2 py-2 text-accent">Brief</span><span className="rounded-lg bg-primary-soft px-2 py-2 text-primary">Kontakt</span></div>
              </div>
            </div>
            <div className="mt-7"><Checklist items={homeCopy.forDesigners.checklist} /></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/get-started" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-accent/90">{homeCopy.forDesigners.primaryCta}<Arrow /></Link>
              <Link href="/services-and-pricing" className="inline-flex items-center justify-center rounded-xl border border-accent/25 bg-card px-5 py-3 font-bold text-foreground transition hover:border-accent/60">{homeCopy.forDesigners.secondaryCta}</Link>
            </div>
          </article>
        </div>

        <div className="mt-16 rounded-2xl border border-line bg-card p-7 sm:p-9">
          <h3 className="text-2xl font-bold">{homeCopy.designerValue.headline}</h3>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeCopy.designerValue.items.map(({ body, title }, index) => (
              <article key={title} className="rounded-xl bg-background p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${index % 2 === 0 ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"}`} aria-hidden="true">{valueMarks[index]}</span>
                <p className="mt-4 font-bold text-foreground">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-card px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-warm">{homeCopy.latestProjects.eyebrow}</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight">{homeCopy.latestProjects.headline}</h2>
              <p className="mt-4 text-lg leading-8 text-muted">{homeCopy.latestProjects.body}</p>
            </div>
            <Link href="/designers" className="shrink-0 font-bold text-primary transition hover:underline">{homeCopy.latestProjects.cta} &#8594;</Link>
          </div>

          {featuredProjects.length ? (
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {featuredProjects.map((project) => (
                <article key={project.id} className="group overflow-hidden rounded-xl border border-line bg-background shadow-[0_14px_40px_rgba(54,31,73,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(54,31,73,0.14)]">
                  <Link href={`/projects/${project.id}`} className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={project.image} alt={`${project.title || homeCopy.latestProjects.fallbackCategory}${project.category ? ` - ${projectCategoryLabel(project.category)}` : ""}`} width="1000" height="750" loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    <div className="p-5">
                      <div className="text-xs font-bold uppercase tracking-wide text-accent">{projectCategoryLabel(project.category)}</div>
                      <h3 className="mt-2 text-xl font-bold">{project.title || homeCopy.latestProjects.fallbackTitle}</h3>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-line bg-background p-8 text-center">
              <h3 className="text-xl font-bold">{homeCopy.latestProjects.emptyTitle}</h3>
              <p className="mt-2 text-muted">{homeCopy.latestProjects.emptyBody}</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary-soft/45 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl border border-primary/15 bg-card p-8 shadow-[0_16px_44px_rgba(54,31,73,0.08)] lg:grid-cols-[1fr_0.78fr] lg:items-center lg:p-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">AI Project Compass</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{homeCopy.midCta.headline}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{homeCopy.midCta.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/project-compass" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary/90">{homeCopy.midCta.primaryCta}<Arrow /></Link>
              <Link href="/project-compass" className="inline-flex items-center justify-center rounded-xl border border-line bg-background px-6 py-3.5 font-bold text-foreground transition hover:border-primary/35">{homeCopy.midCta.secondaryCta}</Link>
            </div>
            <p className="mt-4 text-sm text-muted">{homeCopy.midCta.note}</p>
          </div>
          <div className="grid grid-cols-2 gap-3" aria-hidden="true">
            <div className="col-span-2 flex items-center justify-between rounded-xl bg-[#261437] px-5 py-4 text-white"><span className="text-sm font-bold">AI</span><span className="rounded-full bg-[#5de1d1]/18 px-2.5 py-1 text-xs font-bold text-[#6cf0e2]">{homeCopy.hero.visual.matchValue}</span></div>
            <div className="rounded-xl bg-primary-soft p-4"><p className="text-[10px] font-bold uppercase text-primary">{homeCopy.hero.visual.styleValue}</p><div className="mt-3"><Palette compact /></div></div>
            <div className="rounded-xl bg-accent-soft p-4"><p className="text-[10px] font-bold uppercase text-accent">{homeCopy.hero.visual.materialsLabel}</p><p className="mt-2 text-sm font-bold">{homeCopy.hero.visual.materialsValue}</p></div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-card px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-accent">{homeCopy.inspirationHub.eyebrow}</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight">{homeCopy.inspirationHub.headline}</h2>
              <p className="mt-4 text-lg leading-8 text-muted">{homeCopy.inspirationHub.body}</p>
            </div>
            <Link href="/inspiration" className="font-bold text-primary transition hover:underline">{homeCopy.inspirationHub.cta} &#8594;</Link>
          </div>

          {featuredArticles.length ? (
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {featuredArticles.map((article) => (
                <article key={article.slug} className="group overflow-hidden rounded-xl border border-line bg-background shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <Link href={`/inspiration/${article.slug}`} className="block">
                    {article.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.image_url} alt={article.cover_alt} width="1000" height="700" loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    ) : <div className="aspect-[4/3] bg-primary-soft" aria-hidden="true" />}
                    <div className="p-5">
                      <div className="text-xs font-bold uppercase tracking-wide text-accent">{article.category}</div>
                      <h3 className="mt-2 text-xl font-bold transition group-hover:text-primary">{article.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p>
                      <div className="mt-5 text-sm font-bold text-primary">{homeCopy.inspirationHub.readCta} &#8594;</div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-line bg-background p-7">
              <h3 className="text-xl font-bold">{homeCopy.inspirationHub.emptyTitle}</h3>
              <Link href="/inspiration" className="mt-3 inline-flex font-bold text-primary hover:underline">{homeCopy.inspirationHub.emptyCta}</Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#24132f] px-4 py-20 text-white sm:px-6 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl shadow-[0_14px_34px_rgba(104,40,200,0.5)]" aria-hidden="true">✦</span>
          <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">{homeCopy.closingCta.headline}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/72">{homeCopy.closingCta.body}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/project-compass" className="group inline-flex min-h-[58px] w-full min-w-0 items-center justify-center gap-3 rounded-xl border border-[#caaeff] bg-[#7a35e8] px-6 py-3.5 font-bold text-white shadow-[0_18px_48px_rgba(74,26,146,0.54)] transition hover:-translate-y-1 hover:bg-[#8c4cf0] sm:w-auto"> <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/16" aria-hidden="true">✦</span><span className="min-w-0">{homeCopy.closingCta.primaryCta}</span><Arrow /></Link>
            <Link href="/designers" className="group inline-flex min-h-[58px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-white/55 bg-white/10 px-6 py-3.5 font-bold text-white transition hover:-translate-y-1 hover:border-white hover:bg-white/20 sm:w-auto">{homeCopy.closingCta.secondaryCta}<Arrow /></Link>
          </div>
          <p className="mt-5 text-sm font-medium text-white/62">{homeCopy.closingCta.reassurance}</p>
        </div>
      </section>
    </main>
  );
}

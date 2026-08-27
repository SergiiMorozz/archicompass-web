import type { Metadata } from "next";
import Link from "next/link";
import { applyPolishArticleCopy } from "@/content/pl/copy";
import { getSiteCopy } from "@/content/site-copy";
import AiFeatureBadge from "@/components/AiFeatureBadge";
import { localizeArticle, type ArticleLocalizationFields } from "@/lib/article-content";
import { localeAssetPath, siteLocale } from "@/lib/site-locale";
import { createPublicContentClient } from "@/lib/public-content-client";
import { pageMetadata } from "@/lib/seo";

const copy = getSiteCopy();
const homeCopy = copy.home;

export const metadata: Metadata = pageMetadata({
  title: homeCopy.metadata.title,
  description: homeCopy.metadata.description,
  path: "/",
});

export const revalidate = 300;

const heroImage = localeAssetPath("/images/home/hero-warm-minimalist-20260811.png");
const inspirationImages = [
  "/images/guides/popular-interior-styles.webp",
  "/images/guides/popular-interior-styles-moodboard.webp",
  "/images/guides/small-apartment-design-ideas.webp",
  "/images/guides/interior-design-brief-inspiration.webp",
  "/images/guides/interior-project-planning.webp",
].map(localeAssetPath);
const projectFallbacks = [
  "/images/guides/popular-interior-styles.webp",
  "/images/guides/small-apartment-design-ideas.webp",
  "/images/guides/interior-design-brief-inspiration.webp",
].map(localeAssetPath);
const paletteColors = ["#f7edda", "#ddbf8f", "#b57a49", "#54463a"];
const matchedProfessionalIds = [
  "d0000000-0000-4000-8000-000000000006",
  "d0000000-0000-4000-8000-000000000001",
  "d0000000-0000-4000-8000-000000000003",
];
const matchedProfessionalFallbackImages: Record<string, string> = {
  "d0000000-0000-4000-8000-000000000006": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
  "d0000000-0000-4000-8000-000000000001": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  "d0000000-0000-4000-8000-000000000003": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
};

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

type FeaturedProfessional = {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  location: string | null;
  profile_logo_path: string | null;
};

function projectCategoryLabel(value: string | null) {
  if (!value) return homeCopy.latestProjects.fallbackCategory;
  return homeCopy.projectCategories[value] || value;
}

async function homeData() {
  const supabase = createPublicContentClient();
  const [featured, articles, professionals] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, category, image_url, image_path, image_urls")
      .in("category", ["Apartment", "Loft", "Kitchen", "Dining room", "Home office", "Bedroom", "Penthouse"])
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
    supabase
      .from("profiles")
      .select("id, avatar_url, full_name, location, profile_logo_path")
      .eq("user_type", "professional")
      .in("id", matchedProfessionalIds),
  ]);

  const profileMediaUrl = (path: string | null) =>
    path ? supabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl : null;

  return {
    featuredProjects: ((featured.data ?? []) as FeaturedProject[]).map((project, index) => {
      const publicStorageUrl = project.image_path
        ? supabase.storage.from("project-images").getPublicUrl(project.image_path).data.publicUrl
        : null;
      return {
        ...project,
        image: project.image_url || project.image_urls?.[0] || publicStorageUrl || projectFallbacks[index],
      };
    }),
    featuredArticles: ((articles.data ?? []) as FeaturedArticle[]).map((article) => {
      const legacy = siteLocale === "pl" ? applyPolishArticleCopy(article) : article;
      return localizeArticle(legacy, siteLocale);
    }),
    featuredProfessionals: ((professionals.data ?? []) as FeaturedProfessional[]).map((professional) => ({
      ...professional,
      identityImage: professional.avatar_url
        || profileMediaUrl(professional.profile_logo_path)
        || matchedProfessionalFallbackImages[professional.id]
        || localeAssetPath("/brand/archicompass-mark.png"),
    })),
  };
}

function Arrow() {
  return <span className="text-lg transition duration-300 group-hover:translate-x-1" aria-hidden="true">&#8594;</span>;
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

function Checklist({ items, tone = "primary" }: { items: string[]; tone?: "primary" | "accent" }) {
  const color = tone === "accent" ? "bg-[#d8f4ef] text-[#158c75]" : "bg-primary-soft text-primary";
  return (
    <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
      {items.map((item) => (
        <span key={item} className="flex items-start gap-2.5 text-sm font-medium leading-5 text-foreground">
          <b className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs ${color}`}>&#10003;</b>
          {item}
        </span>
      ))}
    </div>
  );
}

function StepTop({ icon, number }: { icon: string; number: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-sm font-bold text-white">{number}</span>
      <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 bg-white text-lg text-primary" aria-hidden="true">{icon}</span>
    </div>
  );
}

function HeroVisual() {
  const visual = homeCopy.hero.visual;
  return (
    <div className="relative mx-auto w-full max-w-[680px] pt-5 lg:pt-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroImage}
        alt={homeCopy.hero.headline}
        width="1536"
        height="1024"
        fetchPriority="high"
        className="aspect-[1.22/1] w-full rounded-[2rem] object-cover shadow-[0_26px_70px_rgba(68,37,91,0.16)]"
      />
      <div className="absolute -left-2 top-0 max-w-[218px] rounded-2xl border border-primary/20 bg-white/95 p-4 shadow-[0_14px_38px_rgba(67,31,91,0.16)] backdrop-blur sm:-left-8 sm:top-6 sm:max-w-[260px] sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{visual.directionLabel}</p>
        <p className="mt-1 text-xl font-bold leading-tight sm:text-2xl">{visual.styleValue}</p>
        <div className="mt-3"><Palette /></div>
      </div>
      <div className="absolute -right-2 top-[43%] rounded-2xl border border-primary/20 bg-white/95 px-4 py-4 shadow-[0_14px_38px_rgba(67,31,91,0.16)] backdrop-blur sm:-right-7 sm:px-6 sm:py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{visual.matchLabel}</p>
        <p className="mt-1 text-4xl font-bold leading-none text-primary sm:text-5xl">{visual.matchValue}</p>
        <p className="mt-2 text-xs font-semibold text-muted">{visual.tag}</p>
      </div>
      <div className="absolute -bottom-4 left-2 min-w-[245px] rounded-2xl border border-primary/15 bg-white/95 p-4 shadow-[0_16px_44px_rgba(67,31,91,0.18)] backdrop-blur sm:-bottom-7 sm:left-0 sm:min-w-[300px] sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{visual.professionalLabel}</p>
        <div className="mt-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={inspirationImages[1]} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="font-bold">{visual.professionalValue}</p>
            <p className="text-xs text-muted">{visual.professionalSubtitle}</p>
          </div>
        </div>
        <p className="mt-3 text-xs italic text-muted">{visual.tag}</p>
      </div>
    </div>
  );
}

function CompactResult() {
  const visual = homeCopy.hero.visual;
  const preview = homeCopy.howItWorks.stepTwo.preview;
  return (
    <article className="rounded-[1.75rem] bg-white p-5 text-foreground shadow-[0_28px_80px_rgba(4,1,10,0.3)] sm:p-7">
      <div className="flex items-start justify-between gap-5 border-b border-line pb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{visual.tag}</p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-muted">{visual.directionLabel}</p>
          <h3 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">{visual.styleValue}</h3>
        </div>
        <div className="shrink-0 rounded-2xl bg-primary-soft px-4 py-3 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">{visual.matchLabel}</p>
          <p className="mt-1 text-3xl font-bold leading-none text-primary">{visual.matchValue}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[0.88fr_1.12fr]">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-primary-soft/55 p-2">
          {inspirationImages.slice(0, 5).map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className={`w-full rounded-xl object-cover ${index === 0 ? "col-span-2 aspect-[2/1]" : "aspect-[1.12/1]"}`} />
          ))}
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-background p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{preview.summaryLabel}</p>
            <p className="mt-1.5 text-sm font-semibold leading-6">{preview.summaryValue}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-background p-3.5"><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{visual.paletteLabel}</p><div className="mt-3"><Palette compact /></div></div>
            <div className="rounded-xl border border-line bg-background p-3.5"><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{visual.materialsLabel}</p><p className="mt-2 text-sm font-bold leading-5">{visual.materialsValue}</p></div>
            <div className="rounded-xl border border-line bg-background p-3.5"><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{preview.moodLabel}</p><p className="mt-2 text-sm font-bold leading-5">{preview.moodValue}</p></div>
            <div className="rounded-xl border border-line bg-background p-3.5"><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{visual.briefLabel}</p><p className="mt-2 text-sm font-bold leading-5">{visual.briefValue}</p></div>
          </div>
          <div className="rounded-xl border border-line bg-background p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{preview.briefScopeLabel}</p>
            <p className="mt-1.5 text-sm font-semibold leading-6">{preview.briefScopeValue}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary-soft p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={matchedProfessionalFallbackImages[matchedProfessionalIds[0]]} alt="" className="h-12 w-12 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{visual.professionalLabel}</p>
          <p className="truncate font-bold">{visual.professionalValue}</p>
          <p className="mt-0.5 text-xs text-muted">{visual.professionalSubtitle}</p>
        </div>
        <span className="ml-auto rounded-xl bg-white px-3 py-2 text-sm font-bold text-primary shadow-sm">{visual.matchValue}</span>
      </div>
    </article>
  );
}

function DesignerValueCard({
  item,
  index,
}: {
  item: (typeof homeCopy.designerValue.items)[number];
  index: number;
}) {
  const content = (
    <>
      {item.badge ? (
        <AiFeatureBadge>{item.badge}</AiFeatureBadge>
      ) : (
        <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${index % 2 === 0 ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"}`} aria-hidden="true">
          {["◉", "↗", "↔", "✦"][index]}
        </span>
      )}
      <p className="mt-4 font-bold">{item.title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
    </>
  );

  return (
    <article className="rounded-xl bg-background p-4">
      {item.href ? (
        <Link href={item.href} className="group block rounded-lg outline-none transition hover:bg-primary-soft/55 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={item.title}>
          {content}
        </Link>
      ) : content}
    </article>
  );
}

export default async function Home() {
  const { featuredArticles, featuredProfessionals, featuredProjects } = await homeData();
  const { stepOne, stepTwo, stepThree } = homeCopy.howItWorks;
  const featuredProfessionalImages = new Map(featuredProfessionals.map((professional) => [professional.id, professional.identityImage]));
  const matchedProfessionals = stepThree.designers.map((designer, index) => {
    return {
      ...designer,
      image: featuredProfessionalImages.get(matchedProfessionalIds[index])
        || matchedProfessionalFallbackImages[matchedProfessionalIds[index]]
        || localeAssetPath("/brand/archicompass-mark.png"),
    };
  });

  return (
    <main className="overflow-hidden bg-background">
      <section className="bg-[#fcfbff] px-4 py-10 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-[clamp(3.1rem,4.7vw,5rem)] font-bold leading-[0.99] text-foreground">
              {homeCopy.hero.headline}<br />
              <span className="text-primary">{homeCopy.hero.accentHeadline}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted sm:text-xl">{homeCopy.hero.body}</p>
            <div className="mt-7 max-w-2xl"><Checklist items={homeCopy.hero.checklist} /></div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/AI-project-compass" className="group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 text-center font-bold text-white shadow-[0_16px_38px_rgba(90,38,180,0.26)] transition duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:shadow-[0_22px_46px_rgba(90,38,180,0.34)]">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/18 text-base transition duration-300 group-hover:scale-110 group-hover:rotate-12" aria-hidden="true">✦</span>
                {homeCopy.hero.primaryCta}<Arrow />
              </Link>
              <Link href="/designers" className="group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl border border-primary/20 bg-white px-6 py-3 text-center font-bold transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary-soft">
                {homeCopy.hero.secondaryCta}<Arrow />
              </Link>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-2 px-4 py-3 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {homeCopy.trust.items.map(({ body, icon, title }, index) => (
            <article key={title} className="flex min-h-[76px] items-center gap-3 rounded-xl px-3 py-2">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base ${index === 0 ? "bg-primary-soft text-primary" : index === 1 ? "bg-[#fff3dd] text-[#bc7c07]" : index === 2 ? "bg-accent-soft text-accent" : "bg-warm-soft text-warm"}`} aria-hidden="true">{icon}</span>
              <div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-sm leading-5 text-muted">{body}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent">{homeCopy.howItWorks.eyebrow}</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{homeCopy.howItWorks.headline}</h2>
          <p className="mt-4 text-lg leading-8 text-muted">{homeCopy.howItWorks.body}</p>
        </div>

        <div className="relative mt-6 grid gap-5 lg:grid-cols-3">
          <div className="pointer-events-none absolute left-[18%] right-[18%] top-10 hidden border-t-2 border-dashed border-primary/20 lg:block" aria-hidden="true" />
          <article className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-[0_16px_42px_rgba(54,31,73,0.07)] sm:p-7">
            <StepTop number={stepOne.number} icon="▧" />
            <h3 className="mt-6 text-2xl font-bold leading-tight">{stepOne.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{stepOne.body}</p>
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-primary-soft/70 p-2">
              {inspirationImages.map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${src}-${index}`} src={src} alt="" className={`w-full rounded-xl object-cover ${index === 0 ? "col-span-2 aspect-[2.1/1]" : "aspect-[1.32/1]"}`} />
              ))}
            </div>
          </article>

          <article className="relative flex flex-col overflow-hidden rounded-2xl border border-primary/20 bg-primary-soft/45 p-6 shadow-[0_16px_42px_rgba(54,31,73,0.07)] sm:p-7">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[28px] border-primary/10" aria-hidden="true" />
            <div className="relative"><StepTop number={stepTwo.number} icon="✦" /></div>
            <AiFeatureBadge className="relative mt-5">{stepTwo.badge}</AiFeatureBadge>
            <h3 className="relative mt-3 text-2xl font-bold leading-tight">{stepTwo.title}</h3>
            <p className="relative mt-3 text-sm leading-6 text-muted">{stepTwo.body}</p>
            <div className="relative mt-6 rounded-2xl border border-white bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{stepTwo.preview.styleLabel}</p><p className="mt-1 text-lg font-bold">{stepTwo.preview.styleValue}</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-full border-[7px] border-[#e9d9bf] border-r-[#b98d5e] border-t-primary text-[9px] font-bold text-primary">AI</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{stepTwo.preview.paletteLabel}</p><div className="mt-2"><Palette compact /></div></div>
                <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">{stepTwo.preview.materialsLabel}</p><p className="mt-1 text-xs font-semibold leading-5">{stepTwo.preview.materialsValue}</p></div>
              </div>
              <div className="mt-4 rounded-xl bg-accent-soft px-3 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-accent">{stepTwo.preview.moodLabel}</p><p className="mt-1 text-xs font-semibold">{stepTwo.preview.moodValue}</p></div>
            </div>
            <p className="relative mt-5 text-sm leading-6 text-muted">{stepTwo.footer}</p>
            <p className="relative mt-4 text-sm font-bold leading-6">{stepTwo.emphasis}</p>
          </article>

          <article className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-[0_16px_42px_rgba(54,31,73,0.07)] sm:p-7">
            <StepTop number={stepThree.number} icon="♧" />
            <h3 className="mt-6 text-2xl font-bold leading-tight">{stepThree.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{stepThree.body}</p>
            <div className="mt-auto pt-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-muted">{homeCopy.hero.visual.tag}</p>
              <div className="grid gap-3">
                {matchedProfessionals.map((designer) => (
                  <div key={designer.name} className="flex items-center gap-3 rounded-xl border border-line bg-background p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={designer.image} alt="" className="h-11 w-11 rounded-xl border border-line bg-white object-cover" />
                    <div className="min-w-0"><p className="truncate text-sm font-bold">{designer.name}</p><p className="truncate text-xs text-muted">{designer.tag} · {designer.location}</p></div>
                    <span className="ml-auto rounded-lg bg-primary-soft px-2 py-1 text-xs font-bold text-primary">{designer.match}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-muted">{stepThree.matchCriteriaLabel}</p>
              <div className="grid grid-cols-3 gap-2">
                {stepThree.matchCriteria.map((criterion) => (
                  <span key={criterion} className="flex min-h-[58px] items-center rounded-xl border border-line bg-background px-2.5 text-center text-[11px] font-semibold leading-4 text-foreground">
                    {criterion}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
        <div className="mt-8 text-center"><Link href="/AI-project-compass" className="group inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-[0_14px_32px_rgba(86,35,168,0.2)] transition hover:-translate-y-0.5 hover:bg-primary/90">{homeCopy.howItWorks.cta}<Arrow /></Link></div>
      </section>

      <section className="bg-[#24132f] px-4 py-10 text-white sm:px-6 lg:py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#5de1d1]">{homeCopy.whyExists.eyebrow}</p>
            <h2 className="mt-4 whitespace-pre-line text-4xl font-bold leading-tight sm:text-5xl">{homeCopy.whyExists.headline}</h2>
            <p className="mt-5 text-lg leading-8 text-white/72">{homeCopy.whyExists.body}</p>
            <p className="mt-6 text-lg font-semibold leading-8 text-white">{homeCopy.whyExists.body2}</p>
            <p className="mt-5 text-base font-semibold leading-7 text-[#72f1e3]">{homeCopy.whyExists.matchSentence}</p>
            <ol className="mt-8 grid gap-2">
              {homeCopy.whyExists.flow.map((step, index) => <li key={step} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-sm font-semibold"><b className="grid h-6 w-6 place-items-center rounded-full bg-[#5de1d1]/15 text-xs text-[#72f1e3]">{index + 1}</b>{step}</li>)}
            </ol>
          </div>
          <CompactResult />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="grid overflow-hidden rounded-[2rem] border border-primary/15 bg-primary-soft/55 shadow-[0_16px_44px_rgba(54,31,73,0.07)] md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex min-h-[470px] flex-col p-6 sm:p-7">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">— {homeCopy.forClients.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-[2.1rem]">{homeCopy.forClients.headline}</h2>
              <p className="mt-4 text-[0.95rem] leading-7 text-muted">{homeCopy.forClients.body}</p>
              <div className="mt-6"><Checklist items={homeCopy.forClients.checklist.slice(0, 4)} /></div>
              <div className="mt-auto pt-6"><Link href="/AI-project-compass" className="group inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white shadow-[0_12px_28px_rgba(86,35,168,0.22)] transition hover:-translate-y-0.5 hover:bg-primary/90">{homeCopy.forClients.primaryCta}<Arrow /></Link></div>
            </div>
            <div className="min-h-[250px] bg-primary-soft p-5 md:min-h-0 md:p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inspirationImages[1]} alt="" className="h-full w-full rounded-2xl object-cover md:rounded-none" />
            </div>
          </article>

          <article className="grid overflow-hidden rounded-[2rem] border border-accent/20 bg-accent-soft/55 shadow-[0_16px_44px_rgba(54,31,73,0.07)] md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex min-h-[470px] flex-col p-6 sm:p-7">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#207a68]">— {homeCopy.forDesigners.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-[2.1rem]">{homeCopy.forDesigners.headline}</h2>
              <p className="mt-4 text-[0.95rem] leading-7 text-muted">{homeCopy.forDesigners.body}</p>
              <div className="mt-6"><Checklist items={homeCopy.forDesigners.checklist.slice(0, 4)} tone="accent" /></div>
              <p className="mt-4 text-xs font-medium leading-5 text-muted">{homeCopy.forDesigners.pricingNote} <Link href="/services-and-pricing" className="font-bold text-[#207a68] hover:underline">{homeCopy.forDesigners.pricingCta}</Link></p>
              <div className="mt-auto pt-6"><Link href="/get-started" className="group inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-[#1f604d] px-5 py-3 font-bold text-white shadow-[0_12px_28px_rgba(31,96,77,0.2)] transition hover:-translate-y-0.5 hover:bg-[#19513f]">{homeCopy.forDesigners.primaryCta}<Arrow /></Link></div>
            </div>
            <div className="min-h-[250px] bg-accent-soft p-5 md:min-h-0 md:p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inspirationImages[2]} alt="" className="h-full w-full rounded-2xl object-cover md:rounded-none" />
            </div>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-card p-6 sm:p-8">
          <h3 className="text-2xl font-bold">{homeCopy.designerValue.headline}</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {homeCopy.designerValue.items.map((item, index) => (
              <DesignerValueCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-card px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.12em] text-warm">{homeCopy.latestProjects.eyebrow}</p><h2 className="mt-3 text-4xl font-bold leading-tight">{homeCopy.latestProjects.headline}</h2><p className="mt-4 text-lg leading-8 text-muted">{homeCopy.latestProjects.body}</p></div>
            <Link href="/designers" className="shrink-0 font-bold text-primary transition hover:underline">{homeCopy.latestProjects.cta} &#8594;</Link>
          </div>
          {featuredProjects.length ? <div className="mt-8 grid gap-5 md:grid-cols-3">{featuredProjects.map((project) => <article key={project.id} className="group overflow-hidden rounded-xl border border-line bg-background shadow-[0_14px_40px_rgba(54,31,73,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(54,31,73,0.14)]"><Link href={`/projects/${project.id}`} className="block">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={project.image} alt={`${project.title || homeCopy.latestProjects.fallbackCategory}${project.category ? ` - ${projectCategoryLabel(project.category)}` : ""}`} width="1000" height="750" loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><div className="p-5"><div className="text-xs font-bold uppercase tracking-wide text-accent">{projectCategoryLabel(project.category)}</div><h3 className="mt-2 text-xl font-bold">{project.title || homeCopy.latestProjects.fallbackTitle}</h3></div></Link></article>)}</div> : <div className="mt-8 rounded-xl border border-dashed border-line bg-background p-8 text-center"><h3 className="text-xl font-bold">{homeCopy.latestProjects.emptyTitle}</h3><p className="mt-2 text-muted">{homeCopy.latestProjects.emptyBody}</p></div>}
        </div>
      </section>

      <section className="border-b border-line bg-primary-soft/35 px-4 py-11 sm:px-6 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.12em] text-accent">{homeCopy.inspirationHub.eyebrow}</p><h2 className="mt-3 text-4xl font-bold leading-tight">{homeCopy.inspirationHub.headline}</h2><p className="mt-4 text-lg leading-8 text-muted">{homeCopy.inspirationHub.body}</p></div><Link href="/inspiration" className="font-bold text-primary transition hover:underline">{homeCopy.inspirationHub.cta} &#8594;</Link></div>
          {featuredArticles.length ? <div className="mt-8 grid gap-5 md:grid-cols-3">{featuredArticles.map((article) => <article key={article.slug} className="group overflow-hidden rounded-xl border border-line bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"><Link href={`/inspiration/${article.slug}`} className="block">{article.image_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={article.image_url} alt={article.cover_alt} width="1000" height="700" loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="aspect-[4/3] bg-primary-soft" aria-hidden="true" />}<div className="p-5"><div className="text-xs font-bold uppercase tracking-wide text-accent">{article.category}</div><h3 className="mt-2 text-xl font-bold transition group-hover:text-primary">{article.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p><div className="mt-5 text-sm font-bold text-primary">{homeCopy.inspirationHub.readCta} &#8594;</div></div></Link></article>)}</div> : <div className="mt-8 rounded-xl border border-dashed border-line bg-card p-7"><h3 className="text-xl font-bold">{homeCopy.inspirationHub.emptyTitle}</h3><Link href="/inspiration" className="mt-3 inline-flex font-bold text-primary hover:underline">{homeCopy.inspirationHub.emptyCta}</Link></div>}
        </div>
      </section>

      <section className="bg-[#24132f] px-4 py-11 text-white sm:px-6 lg:py-14">
        <div className="mx-auto max-w-4xl text-center"><span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl shadow-[0_14px_34px_rgba(104,40,200,0.5)]" aria-hidden="true">✦</span><h2 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">{homeCopy.closingCta.headline}</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/72">{homeCopy.closingCta.body}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/AI-project-compass" className="group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl border border-[#caaeff] bg-[#7a35e8] px-6 py-3 font-bold text-white shadow-[0_18px_48px_rgba(74,26,146,0.54)] transition hover:-translate-y-1 hover:bg-[#8c4cf0]"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/16" aria-hidden="true">✦</span>{homeCopy.closingCta.primaryCta}<Arrow /></Link><Link href="/designers" className="group inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl border border-white/55 bg-white/10 px-6 py-3 font-bold text-white transition hover:-translate-y-1 hover:border-white hover:bg-white/20">{homeCopy.closingCta.secondaryCta}<Arrow /></Link></div><p className="mt-5 text-sm font-medium text-white/62">{homeCopy.closingCta.reassurance}</p></div>
      </section>
    </main>
  );
}

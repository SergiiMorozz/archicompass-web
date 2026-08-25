import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import GoogleRating from "@/components/GoogleRating";
import JsonLd from "@/components/JsonLd";
import { getCityDirectoryCopy } from "@/content/city-directory-copy";
import { professionalOptionLabel } from "@/lib/professional-options";
import { absoluteUrl, breadcrumbJsonLd, englishUrl, pageMetadata, polishUrl } from "@/lib/seo";
import { localizeProfileContent } from "@/lib/localized-profile-content";
import { siteLocale } from "@/lib/site-locale";
import {
  getSeoLocation,
  locationPath,
  matchesSeoLocation,
  seoLocationCountry,
  seoLocationName,
  seoLocationText,
  seoLocations,
  type SeoLocation,
} from "@/lib/seo-locations";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const revalidate = 3600;

type Designer = {
  id: string;
  full_name: string | null;
  bio: string | null;
  bio_pl: string | null;
  bio_en: string | null;
  location: string | null;
  profession_type: string | null;
  specialties: string[] | null;
  google_business_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  is_demo: boolean;
};

type Studio = {
  id: string;
  name: string;
  bio: string | null;
  bio_pl: string | null;
  bio_en: string | null;
  location: string | null;
  specialties: string[] | null;
  google_business_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  is_demo: boolean;
};

function cityContext(location: SeoLocation) {
  const city = seoLocationName(location, siteLocale);
  return siteLocale === "en" ? `in ${city}` : location.locative ?? `w ${city}`;
}

function cityOrigin(location: SeoLocation) {
  const city = seoLocationName(location, siteLocale);
  return siteLocale === "en" ? `in ${city}` : location.genitive ?? `z ${city}`;
}

async function professionalsForLocation(location: SeoLocation) {
  const supabase = createPublicSupabaseClient();
  const [profiles, studios] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, bio, bio_pl, bio_en, location, profession_type, specialties, google_business_url, google_rating, google_review_count, is_demo")
      .eq("user_type", "professional")
      .limit(100),
    supabase
      .from("studios")
      .select("id, name, bio, bio_pl, bio_en, location, specialties, google_business_url, google_rating, google_review_count, is_demo")
      .eq("published", true)
      .limit(100),
  ]);

  return {
    designers: ((profiles.data ?? []) as Designer[])
      .map((profile) => localizeProfileContent(profile, siteLocale))
      .filter((profile) => !profile.is_demo && matchesSeoLocation(profile.location, location)),
    studios: ((studios.data ?? []) as Studio[])
      .map((studio) => localizeProfileContent(studio, siteLocale))
      .filter((studio) => !studio.is_demo && matchesSeoLocation(studio.location, location)),
  };
}

export function generateStaticParams() {
  return seoLocations.map((location) => ({ country: location.countrySlug, city: location.citySlug }));
}

export async function cityDirectoryMetadata(country: string, city: string): Promise<Metadata> {
  const location = getSeoLocation(country, city);
  const copy = getCityDirectoryCopy(siteLocale);
  if (!location) {
    return pageMetadata({
      title: copy.notFoundTitle,
      description: copy.notFoundDescription,
      path: `/interior-designers/${country}/${city}`,
      noIndex: true,
    });
  }
  const { designers, studios } = await professionalsForLocation(location);
  const cityName = seoLocationName(location, siteLocale);
  const count = designers.length + studios.length;
  const polishPath = locationPath(location, "pl");
  const englishPath = locationPath(location, "en");
  return pageMetadata({
    title: siteLocale === "pl"
      ? `Projektanci wnętrz ${location.city} | Portfolio i opinie`
      : `Interior designers in ${cityName} | Portfolios and reviews`,
    description: siteLocale === "pl"
      ? `Znajdź i porównaj projektantów wnętrz oraz pracownie działające ${cityContext(location)}. Zobacz portfolio, zakres usług, opinie Google i wyślij dobrze przygotowany brief.`
      : `Find and compare interior designers and design studios working ${cityContext(location)}. Review portfolios, services, Google reviews, and send a well-prepared brief.`,
    path: locationPath(location, siteLocale),
    noIndex: count === 0,
    alternates: {
      canonical: absoluteUrl(locationPath(location, siteLocale)),
      languages: { pl: polishUrl(polishPath), en: englishUrl(englishPath), "x-default": polishUrl(polishPath) },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; city: string }> }): Promise<Metadata> {
  const { country, city } = await params;
  return cityDirectoryMetadata(country, city);
}

export async function CityDirectoryPage({ country, city }: { country: string; city: string }) {
  const location = getSeoLocation(country, city);
  if (!location) notFound();

  const copy = getCityDirectoryCopy(siteLocale);
  const context = cityContext(location);
  const cityName = seoLocationName(location, siteLocale);
  const { designers, studios } = await professionalsForLocation(location);
  const professionals = [
    ...studios.map((studio) => ({
      type: copy.studio,
      id: studio.id,
      name: studio.name,
      bio: studio.bio,
      location: studio.location,
      specialties: studio.specialties,
      rating: studio.google_rating,
      reviewCount: studio.google_review_count,
      googleUrl: studio.google_business_url,
      href: `/studios/${studio.id}`,
    })),
    ...designers.map((designer) => ({
      type: designer.profession_type === "Studio" ? copy.studio : copy.designer,
      id: designer.id,
      name: designer.full_name || copy.designerFallback,
      bio: designer.bio,
      location: designer.location,
      specialties: designer.specialties,
      rating: designer.google_rating,
      reviewCount: designer.google_review_count,
      googleUrl: designer.google_business_url,
      href: `/designers/${designer.id}`,
    })),
  ];
  const relatedLocations = seoLocations
    .filter((item) => item.countrySlug === location.countrySlug && item.citySlug !== location.citySlug)
    .slice(0, 6);
  const path = locationPath(location, siteLocale);
  const countryLabel = seoLocationCountry(location, siteLocale);

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: copy.home, path: "/" },
            { name: copy.directory, path: "/designers" },
            { name: countryLabel, path },
            { name: cityName, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: copy.title(context),
            description: copy.heroIntro(context),
            url: absoluteUrl(path),
            inLanguage: siteLocale,
            about: {
              "@type": "City",
              name: cityName,
              containedInPlace: { "@type": "Country", name: countryLabel },
            },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: professionals.length,
              itemListElement: professionals.map((professional, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: absoluteUrl(professional.href),
                name: professional.name,
              })),
            },
          },
        ]}
      />

      <section className="border-b border-primary/15 bg-primary-soft px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <nav aria-label={siteLocale === "pl" ? "Okruszki" : "Breadcrumbs"} className="text-sm font-semibold text-primary">
            <Link href="/designers" className="hover:underline">{copy.directoryLink}</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span>{countryLabel}</span>
            <span aria-hidden="true" className="mx-2">/</span>
            <span>{cityName}</span>
          </nav>
          <div className="mt-7 max-w-4xl">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
              {copy.directoryBadge} · {cityName}
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">{copy.title(context)}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              {copy.heroIntro(context)} {copy.heroLeadSuffix}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/designers?location=${encodeURIComponent(location.city)}`} className="rounded-lg bg-primary px-5 py-3 font-bold text-white">
                {copy.viewProfessionals(cityOrigin(location))}
              </Link>
              <Link href="/AI-project-compass" className="rounded-lg border border-primary/25 bg-card px-5 py-3 font-bold text-primary">
                {copy.createBrief}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-accent">{copy.localDirectoryEyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold">{copy.professionalsHeading(context)}</h2>
          </div>
          <p className="font-semibold text-muted">{copy.professionalsCount(professionals.length)}</p>
        </div>

        {professionals.length ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {professionals.map((professional) => (
              <article key={`${professional.type}-${professional.id}`} className="rounded-lg border border-line bg-card p-6 shadow-sm">
                <div className="text-xs font-bold uppercase text-primary">{professional.type}</div>
                <h3 className="mt-2 text-2xl font-bold"><Link href={professional.href} className="hover:text-primary">{professional.name}</Link></h3>
                <p className="mt-2 text-sm font-semibold text-muted">{professional.location || cityName}</p>
                <div className="mt-3"><GoogleRating compact rating={professional.rating} count={professional.reviewCount} url={professional.googleUrl} /></div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{professional.bio || copy.profileFallback(context)}</p>
                {professional.specialties?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {professional.specialties.slice(0, 3).map((specialty) => (
                      <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{professionalOptionLabel(specialty, siteLocale)}</span>
                    ))}
                  </div>
                ) : null}
                <Link href={professional.href} className="mt-6 inline-flex rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">{copy.viewProfile}</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-lg border border-dashed border-line bg-card p-8">
            <h3 className="text-2xl font-bold">{copy.emptyTitle(context)}</h3>
            <p className="mt-3 max-w-2xl leading-7 text-muted">{copy.emptyBody}</p>
            <Link href="/get-started" className="mt-5 inline-flex font-bold text-primary hover:underline">{copy.joinCta}</Link>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
          <article><h2 className="text-2xl font-bold">{copy.marketTitle(cityName)}</h2><p className="mt-3 leading-7 text-muted">{seoLocationText(location, "marketNote", siteLocale)}</p></article>
          <article><h2 className="text-2xl font-bold">{copy.planningTitle}</h2><p className="mt-3 leading-7 text-muted">{seoLocationText(location, "planningNote", siteLocale)}</p></article>
          <article><h2 className="text-2xl font-bold">{copy.styleTitle}</h2><p className="mt-3 leading-7 text-muted">{seoLocationText(location, "styleNote", siteLocale)}</p></article>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="text-sm font-bold uppercase text-warm">{copy.beforeContactEyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold">{copy.beforeContactTitle}</h2>
        <div className="mt-6 grid gap-5 text-base leading-8 text-muted sm:grid-cols-2"><p>{copy.beforeContactLeft}</p><p>{copy.beforeContactRight}</p></div>
        <Link href="/AI-project-compass" className="mt-7 inline-flex rounded-lg bg-accent px-5 py-3 font-bold text-white">{copy.beforeContactCta}</Link>
      </section>

      {relatedLocations.length ? (
        <section className="border-t border-line bg-background px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold">{location.countryCode === "PL" ? copy.moreLocationsPoland : copy.moreLocationsCountry(countryLabel)}</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {relatedLocations.map((item) => <Link key={item.citySlug} href={locationPath(item, siteLocale)} className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary">{copy.relatedLocation(seoLocationName(item, siteLocale))}</Link>)}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default async function InteriorDesignersLocationPage({ params }: { params: Promise<{ country: string; city: string }> }) {
  const { country, city } = await params;
  const location = getSeoLocation(country, city);
  if (!location) notFound();
  if (siteLocale === "pl" && location.countryCode === "PL") permanentRedirect(locationPath(location, "pl"));
  return <CityDirectoryPage country={country} city={city} />;
}

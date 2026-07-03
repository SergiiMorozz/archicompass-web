import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GoogleRating from "@/components/GoogleRating";
import JsonLd from "@/components/JsonLd";
import { countLabel } from "@/lib/count-label";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import {
  getSeoLocation,
  locationPath,
  matchesSeoLocation,
  seoLocations,
  type SeoLocation,
} from "@/lib/seo-locations";

export const revalidate = 3600;

type Designer = {
  id: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  profession_type: string | null;
  specialties: string[] | null;
  google_business_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
};

type Studio = {
  id: string;
  name: string;
  bio: string | null;
  location: string | null;
  specialties: string[] | null;
  google_business_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
};

async function professionalsForLocation(location: SeoLocation) {
  const supabase = createPublicSupabaseClient();
  const [profiles, studios] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, bio, location, profession_type, specialties, google_business_url, google_rating, google_review_count")
      .eq("user_type", "professional")
      .limit(100),
    supabase
      .from("studios")
      .select("id, name, bio, location, specialties, google_business_url, google_rating, google_review_count")
      .eq("published", true)
      .limit(100),
  ]);

  return {
    designers: ((profiles.data ?? []) as Designer[]).filter((profile) =>
      matchesSeoLocation(profile.location, location)
    ),
    studios: ((studios.data ?? []) as Studio[]).filter((studio) =>
      matchesSeoLocation(studio.location, location)
    ),
  };
}

export function generateStaticParams() {
  return seoLocations.map((location) => ({
    country: location.countrySlug,
    city: location.citySlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}): Promise<Metadata> {
  const { country, city } = await params;
  const location = getSeoLocation(country, city);
  if (!location) return pageMetadata({ title: "Location not found", description: "This location is not available.", path: `/interior-designers/${country}/${city}`, noIndex: true });
  const { designers, studios } = await professionalsForLocation(location);
  const count = designers.length + studios.length;
  return pageMetadata({
    title: `Interior Designers in ${location.city}, ${location.country}`,
    description: `Find and compare interior designers and design studios in ${location.city}. Browse portfolios, specialties, services, Google ratings, and send a structured project brief.`,
    path: locationPath(location),
    noIndex: count === 0,
  });
}

export default async function InteriorDesignersLocationPage({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const { country, city } = await params;
  const location = getSeoLocation(country, city);
  if (!location) notFound();
  const { designers, studios } = await professionalsForLocation(location);
  const professionals = [
    ...studios.map((studio) => ({
      type: "Design studio",
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
      type: designer.profession_type || "Interior designer",
      id: designer.id,
      name: designer.full_name || "ArchiCompass professional",
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
  const path = locationPath(location);

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Find designers", path: "/designers" },
            { name: location.country, path: `/interior-designers/${location.countrySlug}/${location.citySlug}` },
            { name: location.city, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Interior designers in ${location.city}`,
            description: `Interior designers and design studios serving ${location.city}, ${location.country}.`,
            url: absoluteUrl(path),
            inLanguage: "en",
            about: {
              "@type": "City",
              name: location.city,
              containedInPlace: {
                "@type": "Country",
                name: location.country,
              },
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
          <nav aria-label="Breadcrumb" className="text-sm font-semibold text-primary">
            <Link href="/designers" className="hover:underline">Find designers</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span>{location.country}</span>
            <span aria-hidden="true" className="mx-2">/</span>
            <span>{location.city}</span>
          </nav>
          <div className="mt-7 max-w-4xl">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
              {location.city} design directory
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Interior designers in {location.city}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
              Compare interior designers and design studios serving {location.city}, {location.country}.
              Review real project experience, services, specialties, and availability before sending one clear brief.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/designers?location=${encodeURIComponent(location.city)}`} className="rounded-lg bg-primary px-5 py-3 font-bold text-white">
                Browse {location.city} professionals
              </Link>
              <Link href="/project-compass" className="rounded-lg border border-primary/25 bg-card px-5 py-3 font-bold text-primary">
                Build an AI project brief
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-accent">Local directory</p>
            <h2 className="mt-2 text-3xl font-bold">Professionals serving {location.city}</h2>
          </div>
          <p className="font-semibold text-muted">{countLabel(professionals.length, "professional")}</p>
        </div>

        {professionals.length ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {professionals.map((professional) => (
              <article key={`${professional.type}-${professional.id}`} className="rounded-lg border border-line bg-card p-6 shadow-sm">
                <div className="text-xs font-bold uppercase text-primary">{professional.type}</div>
                <h3 className="mt-2 text-2xl font-bold">
                  <Link href={professional.href} className="hover:text-primary">{professional.name}</Link>
                </h3>
                <p className="mt-2 text-sm font-semibold text-muted">{professional.location || location.city}</p>
                <div className="mt-3">
                  <GoogleRating compact rating={professional.rating} count={professional.reviewCount} url={professional.googleUrl} />
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
                  {professional.bio || `View this professional's interior design profile and portfolio for projects in ${location.city}.`}
                </p>
                {professional.specialties?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {professional.specialties.slice(0, 3).map((specialty) => (
                      <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{specialty}</span>
                    ))}
                  </div>
                ) : null}
                <Link href={professional.href} className="mt-6 inline-flex rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">
                  View profile and portfolio
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-lg border border-dashed border-line bg-card p-8">
            <h3 className="text-2xl font-bold">The {location.city} directory is opening soon.</h3>
            <p className="mt-3 max-w-2xl leading-7 text-muted">
              Professionals can already create a profile for this city. This page will enter the public search index automatically when the first local profile is published.
            </p>
            <Link href="/get-started" className="mt-5 inline-flex font-bold text-primary hover:underline">Join as a designer or studio</Link>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
          <article>
            <h2 className="text-2xl font-bold">The {location.city} design market</h2>
            <p className="mt-3 leading-7 text-muted">{location.marketNote}</p>
          </article>
          <article>
            <h2 className="text-2xl font-bold">What to compare</h2>
            <p className="mt-3 leading-7 text-muted">{location.planningNote}</p>
          </article>
          <article>
            <h2 className="text-2xl font-bold">Styles and portfolio fit</h2>
            <p className="mt-3 leading-7 text-muted">{location.styleNote}</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="text-sm font-bold uppercase text-warm">Before you contact a designer</p>
        <h2 className="mt-2 text-3xl font-bold">A useful brief produces more useful replies.</h2>
        <div className="mt-6 grid gap-5 text-base leading-8 text-muted sm:grid-cols-2">
          <p>Include the property type and status, area, rooms, location, budget range, preferred timing, and whether you need 3D visualisation or site supervision.</p>
          <p>Add several inspiration photos and explain what you like about them. ArchiCompass can analyse recurring visual signals and keep the result with the same project brief.</p>
        </div>
        <Link href="/project-compass" className="mt-7 inline-flex rounded-lg bg-accent px-5 py-3 font-bold text-white">Start Project Compass</Link>
      </section>

      {relatedLocations.length ? (
        <section className="border-t border-line bg-background px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold">More designers in {location.country}</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {relatedLocations.map((item) => (
                <Link key={item.citySlug} href={locationPath(item)} className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary">
                  Interior designers in {item.city}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

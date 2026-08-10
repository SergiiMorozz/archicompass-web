import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CityDirectoryPage, cityDirectoryMetadata } from "@/app/interior-designers/[country]/[city]/page";
import { pageMetadata } from "@/lib/seo";
import { seoLocations } from "@/lib/seo-locations";
import { siteLocale } from "@/lib/site-locale";

export function generateStaticParams() {
  return seoLocations
    .filter((location) => location.countryCode === "PL")
    .map((location) => ({ city: location.citySlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  if (siteLocale !== "pl") {
    return pageMetadata({
      title: "Nie znaleziono lokalizacji",
      description: "Ta lokalizacja nie jest dostępna.",
      path: `/projektanci-wnetrz/${city}`,
      noIndex: true,
    });
  }

  return cityDirectoryMetadata("poland", city);
}

export default async function PolishCityDirectoryPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  if (siteLocale !== "pl") notFound();
  const { city } = await params;
  return <CityDirectoryPage country="poland" city={city} />;
}

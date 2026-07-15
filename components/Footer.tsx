import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { getSiteCopy } from "@/content/site-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

export default function Footer() {
  const copy = getSiteCopy().footer;
  const appHref = (path: string) => localePublicPath(siteLocale, path);

  return (
    <footer className="border-t-4 border-accent bg-[#21152d] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href={appHref("/")} className="inline-flex items-center" aria-label="ArchiCompass">
            <BrandLogo variant="white" className="h-11 w-[190px]" />
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
            {copy.brandDescription}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            {copy.navigationTitle}
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            {copy.navigation.map((item) => (
              <Link key={item.href} href={appHref(item.href)} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            {copy.popularLocationsTitle}
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            {copy.locations.map((item) => (
              <Link key={item.href} href={appHref(item.href)} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            {copy.legalTitle}
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            <Link href={appHref("/privacy")} className="hover:text-white">
              {copy.privacy}
            </Link>
            <Link href={appHref("/terms")} className="hover:text-white">
              {copy.terms}
            </Link>
            <Link href={appHref("/cookies")} className="hover:text-white">
              {copy.cookies}
            </Link>
            <a href="mailto:contact@archicompass.pl" className="hover:text-white">
              {copy.contact}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        <div>{copy.copyright}</div>
        <div className="mt-2">{copy.company}</div>
      </div>
    </footer>
  );
}

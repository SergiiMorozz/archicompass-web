import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { siteCopy } from "@/content/pl/copy";

const navigation = [
  { href: "/", label: "Strona główna" },
  { href: "/project-compass", label: "Project Compass" },
  { href: "/designers", label: "Znajdź projektanta" },
  { href: "/inspiration", label: "Inspiration Hub" },
  { href: "/get-started", label: "Dołącz do ArchiCompass" },
];

const popularLocations = [
  { href: "/interior-designers/poland/warsaw", label: "Projektanci w Warszawie" },
  { href: "/interior-designers/poland/krakow", label: "Projektanci w Krakowie" },
  { href: "/interior-designers/poland/wroclaw", label: "Projektanci we Wrocławiu" },
  { href: "/interior-designers/poland/gdansk", label: "Projektanci w Gdańsku" },
];

export default function Footer() {
  return (
    <footer className="border-t-4 border-accent bg-[#21152d] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="Strona główna ArchiCompass">
            <BrandLogo variant="white" className="h-11 w-[190px]" />
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
            {siteCopy.brandDescription}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            {siteCopy.footer.navigationTitle}
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            {siteCopy.footer.popularLocationsTitle}
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            {popularLocations.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            {siteCopy.footer.legalTitle}
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            <Link href="/privacy" className="hover:text-white">
              Polityka prywatności
            </Link>
            <Link href="/terms" className="hover:text-white">
              Regulamin
            </Link>
            <Link href="/cookies" className="hover:text-white">
              Polityka plików cookie
            </Link>
            <a href="mailto:contact@archicompass.pl" className="hover:text-white">
              Kontakt
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        <div>{siteCopy.footer.copyright}</div>
        <div className="mt-2">{siteCopy.company}</div>
      </div>
    </footer>
  );
}

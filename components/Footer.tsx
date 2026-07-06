import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/project-compass", label: "Project Compass" },
  { href: "/designers", label: "Find Designer" },
  { href: "/inspiration", label: "Inspiration Hub" },
  { href: "/get-started", label: "Join ArchiCompass" },
];

const popularLocations = [
  { href: "/interior-designers/poland/warsaw", label: "Designers in Warsaw" },
  { href: "/interior-designers/poland/krakow", label: "Designers in Krakow" },
  { href: "/interior-designers/poland/wroclaw", label: "Designers in Wroclaw" },
  { href: "/interior-designers/poland/gdansk", label: "Designers in Gdansk" },
];

export default function Footer() {
  return (
    <footer className="border-t-4 border-accent bg-[#21152d] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="ArchiCompass home">
            <BrandLogo variant="white" className="h-11 w-[190px]" />
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
            Turn references into a clear project brief, then find designers and
            architects who fit the work.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Navigation
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
            Popular locations
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
            Legal
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-white">
              Cookie Policy
            </Link>
            <a href="mailto:contact@archicompass.pl" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        <div>&copy; 2026 ArchiCompass. All rights reserved.</div>
        <div className="mt-2">
          Operated by SM Advisory, Sergii Moroz · NIP 5252995634 · REGON 528006413 · ul. Grzybowska 2, lok. 31, 00-131 Warszawa, Poland
        </div>
      </div>
    </footer>
  );
}

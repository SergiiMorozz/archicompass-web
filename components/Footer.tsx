import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/project-compass", label: "Project Compass" },
  { href: "/designers", label: "Find Designer" },
  { href: "/get-started", label: "Join the Beta" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1f172a] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr]">
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
            Legal
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        &copy; 2026 ArchiCompass. All rights reserved.
      </div>
    </footer>
  );
}

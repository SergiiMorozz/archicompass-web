"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "text-sm transition",
        isActive ? "font-medium underline" : "hover:underline",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isGetStartedActive = pathname === "/get-started";

  return (
    <header className="w-full border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold">
          ArchiCompass
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink href="/ai-style-finder">AI Style Finder</NavLink>
          <NavLink href="/designers">Designers</NavLink>
          <NavLink href="/health">Health</NavLink>
          <NavLink href="/login">Sign in</NavLink>

          <Link
            href="/get-started"
            className={[
              "rounded-full px-4 py-2 text-sm text-white transition",
              isGetStartedActive ? "bg-zinc-800" : "bg-black hover:opacity-90",
            ].join(" ")}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
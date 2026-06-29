"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isProfessionalProfile } from "@/lib/professional";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/project-compass", label: "Project Compass" },
  { href: "/designers", label: "Find Designer" },
];

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "rounded-full px-3 py-2 text-sm font-medium transition",
        isActive
          ? "bg-primary text-white shadow-sm"
          : "text-muted hover:bg-primary-soft hover:text-primary",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="ArchiCompass home">
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-lg font-bold text-white shadow-sm">
        A
      </span>
      <span className="text-xl font-semibold tracking-tight text-primary">ArchiCompass</span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isGetStartedActive = pathname === "/get-started";
  const [isOpen, setIsOpen] = useState(false);
  const [account, setAccount] = useState<
    { id: string; isProfessional: boolean } | null
  >(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    async function syncAccount(userId: string | null) {
      if (!userId) {
        if (active) setAccount(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, profession_type")
        .eq("id", userId)
        .maybeSingle();

      if (active) {
        setAccount({ id: userId, isProfessional: isProfessionalProfile(profile) });
      }
    }

    void supabase.auth.getUser().then(({ data }) => syncAccount(data.user?.id ?? null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAccount(session?.user.id ?? null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const visibleNavItems = account
    ? [
        ...navItems,
        { href: "/client", label: "Client Workspace" },
        ...(account.isProfessional
          ? [{ href: "/studio", label: "Designer Studio" }]
          : []),
      ]
    : navItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Brand />

        <nav className="hidden items-center gap-1 lg:flex">
          {visibleNavItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-medium text-foreground">
            EN
          </button>
          {account ? (
            <Link
              href="/account"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-foreground transition hover:bg-primary-soft hover:text-primary"
              >
                Sign In
              </Link>

              <Link
                href="/get-started"
                className={[
                  "rounded-xl px-4 py-2 text-sm font-medium text-white transition",
                  isGetStartedActive ? "bg-foreground" : "bg-primary hover:opacity-90",
                ].join(" ")}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-medium">
            EN
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card"
          >
            <span className="flex w-4 flex-col gap-1">
              <span className="h-0.5 rounded-full bg-foreground" />
              <span className="h-0.5 rounded-full bg-foreground" />
              <span className="h-0.5 rounded-full bg-foreground" />
            </span>
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-line bg-background px-4 py-4 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {visibleNavItems.map((item) => (
              <NavLink key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {account ? (
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="col-span-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Account
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-line bg-card px-4 py-3 text-center text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/get-started"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

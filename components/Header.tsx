"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { getSiteCopy } from "@/content/site-copy";
import { isProfessionalProfile } from "@/lib/professional";
import {
  localePublicPath,
  localePublicUrl,
  otherLocale,
  siteLocale,
} from "@/lib/site-locale";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function NavLink({
  href,
  children,
  featured = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  featured?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const localizedHref = localePublicPath(siteLocale, href);
  const currentPath = pathname?.replace(/^\/en(?=\/|$)/, "") || "/";
  const isActive = currentPath === href || (href !== "/" && currentPath.startsWith(href));

  return (
    <Link
      href={localizedHref}
      onClick={onClick}
      className={[
        "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition",
        isActive
          ? "bg-primary text-white shadow-sm"
          : featured
            ? "border border-primary/20 bg-primary-soft text-primary hover:bg-primary hover:text-white"
          : "text-muted hover:bg-primary-soft hover:text-primary",
      ].join(" ")}
    >
      {featured ? (
        <span aria-hidden="true" className={[
          "mr-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
          isActive ? "bg-white text-primary" : "bg-primary text-white",
        ].join(" ")}>
          AI
        </span>
      ) : null}
      {children}
    </Link>
  );
}

function Brand() {
  return (
    <Link href={localePublicPath(siteLocale)} className="flex items-center" aria-label="ArchiCompass">
      <BrandLogo className="h-9 w-[158px] sm:w-[174px]" />
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const copy = getSiteCopy();
  const navItems = copy.header.nav;
  const currentPath = pathname?.replace(/^\/en(?=\/|$)/, "") || "/";
  const isGetStartedActive = currentPath === "/get-started";
  const appHref = (path: string) => localePublicPath(siteLocale, path);
  const alternateHref = (path: string, suffix = "") => {
    const targetLocale = otherLocale();
    const targetPath = localePublicPath(targetLocale, path);
    return targetLocale === "en"
      ? `${targetPath}${suffix}`
      : `${localePublicUrl("pl", path)}${suffix}`;
  };
  const [isOpen, setIsOpen] = useState(false);
  const [languageHref, setLanguageHref] = useState(() => {
    return alternateHref(currentPath);
  });
  const [account, setAccount] = useState<
    { id: string; isAdmin: boolean; isProfessional: boolean; unreadCount: number } | null
  >(null);

  useEffect(() => {
    const path = pathname?.replace(/^\/en(?=\/|$)/, "") || "/";
    setLanguageHref(alternateHref(path, `${window.location.search}${window.location.hash}`));
  }, [pathname]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    async function syncAccount(userId: string | null) {
      if (!userId) {
        if (active) setAccount(null);
        return;
      }

      const [{ data: profile }, { data: accountRole }, { data: adminRole }] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_type, profession_type")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("account_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("admin_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("active", true)
          .in("role", ["owner", "admin"])
          .maybeSingle(),
      ]);

      const isAdmin = Boolean(adminRole);
      const isProfessional =
        accountRole?.role === "designer" ||
        (!accountRole && isProfessionalProfile(profile));
      let unreadCount = 0;
      if (isProfessional || isAdmin) {
        const { data: membershipData } = await supabase
          .from("studio_members")
          .select("studio_id")
          .eq("user_id", userId)
          .eq("status", "active");
        const studioIds = (membershipData ?? []).map((membership) => membership.studio_id);
        let inquiryQuery = supabase.from("designer_inquiries").select("id, client_id");
        inquiryQuery = studioIds.length
          ? inquiryQuery.or(`designer_id.eq.${userId},studio_id.in.(${studioIds.join(",")})`)
          : inquiryQuery.eq("designer_id", userId);
        const { data: inquiryData } = await inquiryQuery;
        const inquiryIds = (inquiryData ?? []).map((inquiry) => inquiry.id);
        const clientIds = Array.from(new Set((inquiryData ?? []).map((inquiry) => inquiry.client_id)));
        if (inquiryIds.length && clientIds.length) {
          const { count } = await supabase
            .from("inquiry_messages")
            .select("id", { count: "exact", head: true })
            .in("inquiry_id", inquiryIds)
            .in("sender_id", clientIds)
            .is("read_at", null);
          unreadCount = count ?? 0;
        }
      } else {
        const { data: inquiryData } = await supabase
          .from("designer_inquiries")
          .select("id")
          .eq("client_id", userId);
        const inquiryIds = (inquiryData ?? []).map((inquiry) => inquiry.id);
        if (inquiryIds.length) {
          const { count } = await supabase
            .from("inquiry_messages")
            .select("id", { count: "exact", head: true })
            .in("inquiry_id", inquiryIds)
            .neq("sender_id", userId)
            .is("read_at", null);
          unreadCount = count ?? 0;
        }
      }

      if (active) {
        setAccount({
          id: userId,
          isAdmin,
          isProfessional,
          unreadCount,
        });
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
  }, [pathname]);

  const workspaceItems = account
    ? [
        ...(!account.isProfessional || account.isAdmin
          ? [{ href: "/client", label: copy.header.clientWorkspace }]
          : []),
        ...(account.isProfessional || account.isAdmin
          ? [{ href: "/studio", label: copy.header.designerStudio }]
          : []),
        ...(account.isAdmin ? [{ href: "/admin", label: copy.header.admin }] : []),
      ]
    : [];
  const isWorkspaceActive = workspaceItems.some(
    (item) => currentPath === item.href || currentPath.startsWith(`${item.href}/`)
  );
  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/80 bg-card/95 shadow-[0_8px_30px_rgba(73,35,102,0.06)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Brand />

        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} featured={item.featured}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <a href={languageHref} hrefLang={otherLocale()} className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-medium text-foreground">
            {copy.header.languageSwitch}
          </a>
          {account ? (
            <div className="flex items-center gap-2">
              <Link
                href={appHref(account.isProfessional ? "/studio/inbox" : "/client/messages")}
                className="relative whitespace-nowrap rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold text-muted transition hover:border-primary/25 hover:bg-primary-soft hover:text-primary"
              >
                {copy.header.messages}
                {account.unreadCount ? (
                  <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {account.unreadCount > 99 ? "99+" : account.unreadCount}
                  </span>
                ) : null}
              </Link>
              <details className="group relative">
                <summary
                  className={[
                    "flex cursor-pointer list-none items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold transition hover:border-primary/25 hover:bg-primary-soft hover:text-primary [&::-webkit-details-marker]:hidden",
                    isWorkspaceActive ? "border-primary/25 bg-primary-soft text-primary" : "text-muted",
                  ].join(" ")}
                >
                  {copy.header.account}
                  <span className="text-base leading-none transition group-open:rotate-180" aria-hidden="true">⌄</span>
                </summary>
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-line bg-card p-2 shadow-[0_18px_45px_rgba(54,31,73,0.16)]">
                  <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wide text-muted">{copy.header.workspaceTitle}</div>
                  {workspaceItems.map((item) => (
                    <Link
                      key={item.href}
                      href={appHref(item.href)}
                      className={[
                        "block rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                        currentPath === item.href || currentPath.startsWith(`${item.href}/`)
                          ? "bg-primary-soft text-primary"
                          : "text-muted hover:bg-primary-soft hover:text-primary",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-line" />
                  <Link href={appHref("/account")} className="block rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-bold text-white transition hover:opacity-90">
                    {copy.header.accountSettings}
                  </Link>
                </div>
              </details>
            </div>
          ) : (
            <>
              <Link
                href={appHref("/login")}
                className="rounded-xl px-4 py-2 text-sm font-medium text-foreground transition hover:bg-primary-soft hover:text-primary"
              >
                Zaloguj się
              </Link>

              <Link
                href={appHref("/get-started")}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-medium text-white transition",
                  isGetStartedActive ? "bg-foreground" : "bg-primary hover:opacity-90",
                ].join(" ")}
              >
                Dołącz
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <a href={languageHref} hrefLang={otherLocale()} className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-medium">
            {copy.header.languageSwitch}
          </a>
          <button
            type="button"
            aria-label={copy.header.menuLabel}
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
        <div className="border-t border-line bg-background px-4 py-4 xl:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} featured={item.featured} onClick={() => setIsOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            {account ? (
              <div className="mt-2 grid gap-2 border-t border-line pt-3">
                <div className="px-3 text-xs font-semibold uppercase text-muted">{copy.header.userPanel}</div>
                <NavLink href={account.isProfessional ? "/studio/inbox" : "/client/messages"} onClick={() => setIsOpen(false)}>
                  {copy.header.messages}{account.unreadCount ? ` (${account.unreadCount})` : ""}
                </NavLink>
                {workspaceItems.map((item) => (
                  <NavLink key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    {item.label}
                  </NavLink>
                ))}
                <Link
                  href={appHref("/account")}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-white"
                >
                  {copy.header.accountSettings}
                </Link>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href={appHref("/login")}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-line bg-card px-4 py-3 text-center text-sm font-medium"
                >
                  {copy.header.signIn}
                </Link>
                <Link
                  href={appHref("/get-started")}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-white"
                >
                  {copy.header.join}
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getWorkspaceCopy } from "@/content/workspace-copy";
import { getBillingCopy } from "@/content/billing-copy";

export default function StudioNav({
  profileId,
  profileName,
  unreadCount,
}: {
  profileId: string | null;
  profileName: string;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const copy = getWorkspaceCopy().studioNav;
  const billingCopy = getBillingCopy();
  const studioLinks = [
    { href: "/studio", label: copy.dashboard },
    { href: "/studio/inbox", label: copy.enquiries },
    { href: "/account/profile", label: copy.profile, section: "profile" },
    { href: "/studio/analytics", label: copy.analytics },
    { href: "/studio/team", label: copy.studioAndTeam },
    { href: "/studio/billing", label: billingCopy.studioNav },
  ];

  const isProfileSection =
    pathname.startsWith("/account/profile") ||
    pathname.startsWith("/account/projects") ||
    pathname.startsWith("/studio/portfolio-assistant");

  return (
    <section className="border-b border-line bg-card">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-primary">{copy.studio}</div>
            <div className="mt-1 text-xl font-bold">{profileName}</div>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
            <nav className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:grid-cols-3 xl:flex xl:flex-wrap xl:justify-end" aria-label={copy.ariaLabel}>
              {studioLinks.map((item) => {
                const active =
                  item.section === "profile"
                    ? isProfileSection
                    : pathname === item.href ||
                      (item.href !== "/studio" && pathname.startsWith(item.href));
                const messageCount = item.href === "/studio/inbox" ? unreadCount : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "min-w-0 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition sm:px-4",
                      active
                        ? "bg-primary text-white"
                        : "border border-line bg-background text-muted hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    {item.label}
                    {messageCount ? (
                      <span
                        aria-label={copy.unreadUpdates(messageCount)}
                        className={[
                          "ml-2 rounded-full px-2 py-0.5 text-xs",
                          active ? "bg-white/20" : "bg-foreground text-white",
                        ].join(" ")}
                      >
                        {messageCount > 99 ? "99+" : messageCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
            {profileId ? (
              <Link
                href={`/designers/${profileId}`}
                className="inline-flex w-fit items-center gap-2 px-1 py-1 text-sm font-semibold text-muted underline-offset-4 hover:text-primary hover:underline"
              >
                <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="2.75" />
                </svg>
                {copy.openPublicProfile}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

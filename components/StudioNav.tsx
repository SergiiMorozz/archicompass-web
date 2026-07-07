"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const studioLinks = [
  { href: "/studio", label: "Pulpit" },
  { href: "/studio/inbox", label: "Zapytania" },
  { href: "/studio/analytics", label: "Statystyki" },
  { href: "/studio/team", label: "Pracownia i zespół" },
  { href: "/account/profile", label: "Edytuj profil" },
  { href: "/account/projects", label: "Projekty" },
];

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

  return (
    <section className="border-b border-line bg-card">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-primary">Studio projektanta</div>
            <div className="mt-1 text-xl font-bold">{profileName}</div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Studio projektanta">
            {studioLinks.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/studio" && pathname.startsWith(item.href));
              const messageCount = item.href === "/studio/inbox" ? unreadCount : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                    active
                      ? "bg-primary text-white"
                      : "border border-line bg-background text-muted hover:border-primary hover:text-primary",
                  ].join(" ")}
                >
                  {item.label}
                  {messageCount ? (
                    <span
                      aria-label={`${messageCount} nieprzeczytanych zapytań`}
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
            {profileId ? (
              <Link
                href={`/designers/${profileId}`}
                className="shrink-0 rounded-xl border border-line bg-background px-4 py-2.5 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
              >
                Profil publiczny
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </section>
  );
}

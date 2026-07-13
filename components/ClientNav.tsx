"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const clientLinks = [
  { href: "/client", label: "Pulpit" },
  { href: "/client/messages", label: "Wiadomości" },
  { href: "/client/briefs", label: "Zapisane briefy" },
  { href: "/client/favorites", label: "Ulubione" },
  { href: "/account/profile", label: "Dane kontaktowe" },
];

export default function ClientNav({
  accountName,
  unreadCount,
}: {
  accountName: string;
  unreadCount: number;
}) {
  const pathname = usePathname();

  return (
    <section className="border-b border-line bg-card">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-primary">Strefa klienta</div>
            <div className="mt-1 text-xl font-bold">{accountName}</div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Strefa klienta">
            {clientLinks.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/client" && pathname.startsWith(item.href));
              const messageCount = item.href === "/client/messages" ? unreadCount : 0;
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
                      aria-label={`${messageCount} nieprzeczytanych wiadomości`}
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
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const clientLinks = [
  { href: "/client", label: "Overview" },
  { href: "/client/messages", label: "Messages" },
  { href: "/client/briefs", label: "Saved briefs" },
  { href: "/client/favorites", label: "Favorites" },
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
            <div className="text-xs font-semibold uppercase text-primary">Client Workspace</div>
            <div className="mt-1 text-xl font-bold">{accountName}</div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Client Workspace">
            {clientLinks.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/client" && pathname.startsWith(item.href));
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
                  {item.href === "/client/messages" && unreadCount ? (
                    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                      {unreadCount}
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

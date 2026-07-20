"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getWorkspaceCopy } from "@/content/workspace-copy";

export default function ClientNav({
  accountName,
  unreadCount,
}: {
  accountName: string;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const copy = getWorkspaceCopy().clientNav;
  const clientLinks = [
    { href: "/client", label: copy.dashboard },
    { href: "/client/messages", label: copy.messages },
    { href: "/client/briefs", label: copy.savedBriefs },
    { href: "/client/favorites", label: copy.favorites },
    { href: "/account/profile", label: copy.contactDetails },
  ];

  return (
    <section className="border-b border-line bg-card">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-primary">{copy.workspace}</div>
            <div className="mt-1 text-xl font-bold">{accountName}</div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label={copy.ariaLabel}>
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
                      aria-label={copy.unreadMessages(messageCount)}
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

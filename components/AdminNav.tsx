"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/activity", label: "Activity" },
];

export default function AdminNav({ accountName, role }: { accountName: string; role: string }) {
  const pathname = usePathname();

  return (
    <section className="border-b border-line bg-card">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-primary">Admin Workspace</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold">{accountName}</span>
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                {role}
              </span>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Admin Workspace">
            {[...adminLinks, ...(role === "owner" ? [{ href: "/admin/team", label: "Team" }] : [])].map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
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
                </Link>
              );
            })}
            <Link
              href="/"
              className="shrink-0 rounded-xl border border-line bg-background px-4 py-2.5 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
            >
              Public site
            </Link>
          </nav>
        </div>
      </div>
    </section>
  );
}

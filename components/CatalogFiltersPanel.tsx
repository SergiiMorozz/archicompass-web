"use client";

import { useState, type ReactNode } from "react";

type CatalogFiltersPanelProps = {
  activeFilters: number;
  children: ReactNode;
  resultCount: string;
};

export default function CatalogFiltersPanel({
  activeFilters,
  children,
  resultCount,
}: CatalogFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="catalog-filters"
        onClick={() => setIsOpen((value) => !value)}
        className="mb-5 flex w-full items-center justify-between rounded-xl border border-primary/20 bg-card px-4 py-4 text-left shadow-sm lg:hidden"
      >
        <span>
          <span className="block text-base font-bold">Filtry</span>
          <span className="mt-0.5 block text-sm text-muted">{resultCount}</span>
        </span>
        <span className="flex items-center gap-2">
          {activeFilters ? (
            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
              {activeFilters}
            </span>
          ) : null}
          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">
            {isOpen ? "Ukryj" : "Pokaż"}
          </span>
        </span>
      </button>

      <div id="catalog-filters" className={isOpen ? "block lg:block" : "hidden lg:block"}>
        {children}
      </div>
    </>
  );
}

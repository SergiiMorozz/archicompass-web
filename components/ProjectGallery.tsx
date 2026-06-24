"use client";

import { useEffect, useState } from "react";

type ProjectGalleryProps = {
  category?: string | null;
  description?: string | null;
  images: string[];
  title: string;
};

export default function ProjectGallery({
  category,
  description,
  images,
  title,
}: ProjectGalleryProps) {
  const safeImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : safeImages[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + safeImages.length) % safeImages.length
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % safeImages.length
        );
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, safeImages.length]);

  if (!safeImages.length) return null;

  return (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-primary-soft">
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="group block h-full w-full text-left"
          aria-label={`Open ${title} gallery`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={safeImages[0]}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f172a]/74 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
              {category || "Portfolio"}
            </div>
            <h3 className="mt-1 text-xl font-bold">{title}</h3>
            <div className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              View {safeImages.length} photo{safeImages.length === 1 ? "" : "s"}
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 p-5 pb-0">
        {safeImages.slice(0, 12).map((url, imageIndex) => (
          <button
            key={`${url}-${imageIndex}`}
            type="button"
            onClick={() => setActiveIndex(imageIndex)}
            className="aspect-square overflow-hidden rounded-xl bg-primary-soft"
            aria-label={`Open ${title} photo ${imageIndex + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title} preview ${imageIndex + 1}`}
              className="h-full w-full object-cover transition hover:scale-105"
            />
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-[80] bg-[#1f172a]/88 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="mb-4 flex items-center justify-between gap-4 text-white">
              <div className="min-w-0">
                <div className="truncate text-lg font-bold">{title}</div>
                <div className="text-sm text-white/70">
                  Photo {(activeIndex ?? 0) + 1} of {safeImages.length}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-foreground"
              >
                Close
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={`${title} full size`}
                className="h-full w-full object-contain"
              />

              {safeImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((current) =>
                        current === null
                          ? current
                          : (current - 1 + safeImages.length) % safeImages.length
                      )
                    }
                    className="absolute left-3 top-1/2 rounded-full bg-white px-4 py-3 text-sm font-bold text-foreground shadow"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((current) =>
                        current === null ? current : (current + 1) % safeImages.length
                      )
                    }
                    className="absolute right-3 top-1/2 rounded-full bg-white px-4 py-3 text-sm font-bold text-foreground shadow"
                  >
                    Next
                  </button>
                </>
              ) : null}
            </div>

            {description ? (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/75">{description}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

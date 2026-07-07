import type { ReferencePhotoPreview } from "@/lib/reference-photos";
import { countLabel } from "@/lib/count-label";

/* eslint-disable @next/next/no-img-element */

export default function ReferencePhotoGrid({
  photos,
  title = "Zdjęcia referencyjne",
}: {
  photos: ReferencePhotoPreview[];
  title?: string;
}) {
  if (!photos.length) return null;

  return (
    <div className="mt-5 rounded-2xl border border-line bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          {countLabel(photos.length, "photo")}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <figure
            key={photo.path}
            className="overflow-hidden rounded-xl border border-line bg-card"
          >
            <a href={photo.url} target="_blank" rel="noreferrer" className="group block" title={`Otwórz ${photo.name} w pełnym rozmiarze`}>
              <img
                alt={`${title} ${index + 1}: ${photo.name}`}
                className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
                src={photo.url}
              />
            </a>
            <figcaption className="truncate px-3 py-2 text-xs font-semibold text-muted">
              <a href={photo.url} target="_blank" rel="noreferrer" className="hover:text-primary">{photo.name} - open full size</a>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

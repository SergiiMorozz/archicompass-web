import type { ReferencePhotoPreview } from "@/lib/reference-photos";

/* eslint-disable @next/next/no-img-element */

export default function ReferencePhotoGrid({
  photos,
  title = "Reference photos",
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
          {photos.length} photo{photos.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <figure
            key={photo.path}
            className="overflow-hidden rounded-xl border border-line bg-card"
          >
            <img
              alt={`${title} ${index + 1}: ${photo.name}`}
              className="aspect-[4/3] w-full object-cover"
              src={photo.url}
            />
            <figcaption className="truncate px-3 py-2 text-xs font-semibold text-muted">
              {photo.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

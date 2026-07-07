type GoogleRatingProps = {
  compact?: boolean;
  count: number | null;
  rating: number | null;
  url: string | null;
};

function googleHref(value: string | null) {
  if (!value) return null;
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export default function GoogleRating({ compact = false, count, rating, url }: GoogleRatingProps) {
  const href = googleHref(url);
  if (!rating && !count && !href) return null;

  const content = (
    <>
      <span aria-hidden="true" className="text-sun">&#9733;</span>
      {rating ? <span className="font-bold text-foreground">{rating.toFixed(1)}</span> : null}
      <span className="text-muted">
        {count ? `${count} ${count === 1 ? "opinia" : count < 5 ? "opinie" : "opinii"} Google` : "Profil Google"}
      </span>
    </>
  );

  const className = [
    "inline-flex w-fit items-center gap-1.5 rounded-full border border-[#eadbb5] bg-[#fff8e5] font-semibold",
    compact ? "px-2.5 py-1 text-xs" : "px-3 py-2 text-sm",
  ].join(" ");

  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={`${className} hover:border-sun`}>
      {content}
    </a>
  ) : (
    <span className={className}>{content}</span>
  );
}

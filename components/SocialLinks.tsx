import { getInteractiveCopy } from "@/content/interactive-copy";

type SocialLinksProps = {
  behanceUrl?: string | null;
  compact?: boolean;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
};

const socials = [
  { key: "instagramUrl", label: "Instagram", icon: "IG" },
  { key: "facebookUrl", label: "Facebook", icon: "f" },
  { key: "behanceUrl", label: "Behance", icon: "Be" },
  { key: "linkedinUrl", label: "LinkedIn", icon: "in" },
] as const;

function socialHref(value: string | null | undefined) {
  if (!value) return null;
  const clean = value.trim();
  if (!clean) return null;
  return clean.startsWith("http://") || clean.startsWith("https://")
    ? clean
    : `https://${clean}`;
}

export function socialSameAs(input: Omit<SocialLinksProps, "compact">) {
  return socials
    .map((social) => socialHref(input[social.key]))
    .filter((href): href is string => Boolean(href));
}

export default function SocialLinks({
  behanceUrl,
  compact = false,
  facebookUrl,
  instagramUrl,
  linkedinUrl,
}: SocialLinksProps) {
  const copy = getInteractiveCopy().social;
  const values = { behanceUrl, facebookUrl, instagramUrl, linkedinUrl };
  const links = socials.flatMap((social) => {
    const href = socialHref(values[social.key]);
    return href ? [{ ...social, href }] : [];
  });

  if (!links.length) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-label={copy.profileLinks}>
      {links.map((social) => (
        <a
          key={social.key}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.label}
          title={social.label}
          className={[
            "inline-grid place-items-center rounded-full border border-line bg-background font-bold text-primary transition hover:border-primary hover:bg-primary hover:text-white",
            compact ? "h-8 min-w-8 px-2 text-xs" : "h-10 min-w-10 px-2.5 text-sm",
          ].join(" ")}
        >
          {social.icon}
        </a>
      ))}
    </div>
  );
}

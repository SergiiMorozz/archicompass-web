type BrandLogoProps = {
  className?: string;
  variant?: "black" | "purple" | "white";
};

const logoSources = {
  black: "/brand/archicompass-logo-black.png",
  purple: "/brand/archicompass-logo-purple.png",
  white: "/brand/archicompass-logo-white.png",
};

export default function BrandLogo({
  className = "h-10 w-44",
  variant = "purple",
}: BrandLogoProps) {
  return (
    <svg
      viewBox="0 793 3371 798"
      className={className}
      role="img"
      aria-label="ArchiCompass"
      preserveAspectRatio="xMidYMid meet"
    >
      <title>ArchiCompass</title>
      <image
        href={logoSources[variant]}
        x="0"
        y="0"
        width="3371"
        height="2385"
        preserveAspectRatio="none"
      />
    </svg>
  );
}

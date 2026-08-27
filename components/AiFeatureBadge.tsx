type AiFeatureBadgeProps = {
  children: string;
  className?: string;
};

export default function AiFeatureBadge({ children, className = "" }: AiFeatureBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm shadow-primary/25 ${className}`}>
      <span aria-hidden="true">✦</span>
      {children}
    </span>
  );
}

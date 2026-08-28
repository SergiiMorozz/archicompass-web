import { siteLocale } from "@/lib/site-locale";

const earlyAccess = {
  enabled: true,
  pl: {
    badge: "Early Access dla projektantów i pracowni",
    body: "Dołącz do pierwszej grupy profesjonalistów, którzy rozwijają ArchiCompass razem z nami. Przez pierwsze 3 miesiące masz pełny dostęp bez opłat i bez karty. W zamian prosimy o szczery feedback po realnym przetestowaniu platformy.",
  },
  en: {
    badge: "Early access for designers and studios",
    body: "Join the first group of professionals helping us shape ArchiCompass. You receive full access for your first 3 months, with no charge and no card. In return, we ask for honest feedback after using the platform with your real portfolio.",
  },
} as const;

export default function EarlyAccessNotice({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  if (!earlyAccess.enabled) return null;

  const copy = earlyAccess[siteLocale];
  return (
    <aside className={`rounded-2xl border border-primary/20 bg-primary-soft/55 ${compact ? "p-4" : "p-6 sm:p-7"} ${className}`}>
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">✦ {copy.badge}</p>
      <p className={`${compact ? "mt-2 text-xs leading-5" : "mt-3 max-w-4xl leading-7"} text-muted`}>{copy.body}</p>
    </aside>
  );
}

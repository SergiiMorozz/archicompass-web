import { requiredServiceCapabilities } from "@/lib/service-capabilities";

export type MatchBrief = {
  projectType: string;
  goal: string;
  style: string;
  support: string;
  budget: string;
  timeline: string;
  area: string;
  roomCount: string;
  rooms: string[];
  propertyStatus: string;
  visualization: string;
  supervision: string;
  location: string;
  cues: string[];
};

export type MatchableProfessional = {
  bio: string | null;
  location: string | null;
  profession_type?: string | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
  minimum_project_budget: number | null;
  work_modes: string[] | null;
  availability_status: string | null;
};

export type PortfolioSignal = {
  title: string | null;
  category: string | null;
  description: string | null;
};

export type MatchReason = {
  label: string;
  value: string;
  status: "strong" | "partial" | "check";
};

export type ProfessionalMatch = {
  percent: number;
  label: "Bardzo dobre dopasowanie" | "Obiecujące dopasowanie" | "Warto sprawdzić";
  reasons: MatchReason[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function contains(text: string, value: string) {
  const normalized = normalize(value).trim();
  return Boolean(normalized) && text.includes(normalized);
}

function splitStyleValues(value: string) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function budgetRange(value: string) {
  if (value === "Under 50k PLN total project budget") return { min: 0, max: 50_000 };
  if (value === "50k-100k PLN total project budget") return { min: 50_000, max: 100_000 };
  if (value === "100k-200k PLN total project budget") return { min: 100_000, max: 200_000 };
  if (value === "200k-400k PLN total project budget") return { min: 200_000, max: 400_000 };
  if (value === "400k-800k PLN total project budget") return { min: 400_000, max: 800_000 };
  if (value === "800k+ PLN total project budget") return { min: 800_000, max: Number.POSITIVE_INFINITY };
  if (value === "Under 10k PLN") return { min: 0, max: 10_000 };
  if (value === "10k-30k PLN") return { min: 10_000, max: 30_000 };
  if (value === "30k-80k PLN") return { min: 30_000, max: 80_000 };
  if (value === "80k+ PLN") return { min: 80_000, max: Number.POSITIVE_INFINITY };
  return null;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);
}

export function scoreProfessionalMatch(
  professional: MatchableProfessional,
  brief: MatchBrief,
  portfolio: PortfolioSignal[] = []
): ProfessionalMatch {
  const professionalText = normalize(
    [
      professional.bio,
      professional.location,
      professional.profession_type,
      ...(professional.specialties ?? []),
      ...(professional.service_capabilities ?? []),
      ...portfolio.flatMap((project) => [project.title, project.category, project.description]),
    ]
      .filter(Boolean)
      .join(" ")
  );
  const reasons: MatchReason[] = [];
  let points = 0;
  let possible = 0;

  if (brief.style || brief.cues.length) {
    possible += 22;
    const styleValues = brief.style ? splitStyleValues(brief.style) : [];
    const matchedStyles = styleValues.filter((style) => contains(professionalText, style));
    const styleMatch = matchedStyles.length > 0;
    const cueMatches = brief.cues.filter((cue) => contains(professionalText, cue));
    points += (styleMatch ? Math.min(14, matchedStyles.length * 7) : 0) + Math.min(8, cueMatches.length * 2);
    reasons.push({
      label: "Styl",
      value: styleMatch
        ? `${matchedStyles.join(" / ")} pojawia się w profilu lub portfolio`
        : cueMatches.length
          ? `Dopasowano ${cueMatches.length} ${cueMatches.length === 1 ? "cechę wizualną" : "cechy wizualne"}`
          : `${styleValues.join(" / ") || "Kierunek wizualny"} wymaga sprawdzenia portfolio`,
      status: styleMatch ? "strong" : cueMatches.length ? "partial" : "check",
    });
  }

  const projectSignals = [brief.projectType, brief.goal, brief.propertyStatus, ...brief.rooms]
    .filter(Boolean);
  if (projectSignals.length) {
    possible += 15;
    const matchedSignals = projectSignals.filter((signal) => contains(professionalText, signal));
    points += Math.round((matchedSignals.length / projectSignals.length) * 15);
    const size = brief.area ? ` · ${brief.area} m²` : "";
    reasons.push({
      label: "Zakres projektu",
      value: matchedSignals.length
        ? `Znaleziono ${matchedSignals.length}/${projectSignals.length} sygnałów z briefu${size}`
        : `${brief.projectType || "Projekt"}${size} · potwierdź podobne doświadczenie`,
      status:
        matchedSignals.length >= Math.ceil(projectSignals.length / 2)
          ? "strong"
          : matchedSignals.length
            ? "partial"
            : "check",
    });
  }

  const requiredCapabilities = requiredServiceCapabilities(
    brief.visualization,
    brief.supervision,
    brief.support
  );
  if (requiredCapabilities.length) {
    possible += 20;
    const available = professional.service_capabilities ?? [];
    const confirmed = requiredCapabilities.filter((capability) => available.includes(capability));
    points += Math.round((confirmed.length / requiredCapabilities.length) * 20);
    reasons.push({
      label: "Usługi",
      value:
        confirmed.length === requiredCapabilities.length
          ? `Potwierdzono wszystkie wymagane usługi (${requiredCapabilities.length})`
          : `Potwierdzono ${confirmed.length}/${requiredCapabilities.length} wymaganych usług`,
      status:
        confirmed.length === requiredCapabilities.length
          ? "strong"
          : confirmed.length
            ? "partial"
            : "check",
    });
  } else if (brief.support) {
    possible += 10;
    const supportMatch = contains(professionalText, brief.support);
    points += supportMatch ? 10 : 3;
    reasons.push({
      label: "Wsparcie",
      value: supportMatch ? `W profilu widać doświadczenie: ${brief.support}` : `Do potwierdzenia: ${brief.support}`,
      status: supportMatch ? "strong" : "check",
    });
  }

  if (brief.location) {
    possible += 12;
    const local = contains(normalize(professional.location ?? ""), brief.location);
    const remote = (professional.work_modes ?? []).some((mode) => mode === "Remote" || mode === "Hybrid");
    points += local ? 12 : remote ? 8 : 2;
    reasons.push({
      label: "Lokalizacja",
      value: local
        ? `Dopasowanie lokalne · ${professional.location}`
        : remote
          ? `Możliwa współpraca zdalna lub hybrydowa · ${professional.location || "lokalizacja do ustalenia"}`
          : `Sprawdź obszar działania · ${professional.location || "nie podano"}`,
      status: local ? "strong" : remote ? "partial" : "check",
    });
  }

  const clientBudget = budgetRange(brief.budget);
  if (clientBudget) {
    possible += 18;
    const minimum = professional.minimum_project_budget ?? professional.price_from;
    if (minimum === null) {
      points += 6;
      reasons.push({
        label: "Budżet",
        value: `${brief.budget} · wycena wymaga potwierdzenia`,
        status: "check",
      });
    } else if (minimum <= clientBudget.max) {
      const partlyAbove = professional.price_to !== null && professional.price_to > clientBudget.max;
      points += partlyAbove ? 14 : 18;
      reasons.push({
        label: "Budżet",
        value: partlyAbove
          ? `Zakres cen częściowo pokrywa się z budżetem: ${brief.budget}`
          : `Poziom startowy mieści się w budżecie: ${brief.budget}`,
        status: partlyAbove ? "partial" : "strong",
      });
    } else {
      reasons.push({
        label: "Budżet",
        value: `Minimalny budżet projektu: ${formatAmount(minimum)} PLN`,
        status: "check",
      });
    }
  }

  if (brief.timeline) {
    possible += 8;
    const availability = professional.availability_status ?? "";
    const urgent = brief.timeline === "As soon as possible";
    const availabilityPoints = availability === "Available now"
      ? 8
      : availability === "Within 1 month"
        ? urgent ? 6 : 8
        : availability === "Within 1-3 months"
          ? urgent ? 3 : 7
          : availability === "Waitlist / ask"
            ? 1
            : 3;
    points += availabilityPoints;
    reasons.push({
      label: "Termin",
      value: `${brief.timeline} · ${availability || "dostępność do potwierdzenia"}`,
      status: availabilityPoints >= 7 ? "strong" : availabilityPoints >= 3 ? "partial" : "check",
    });
  }

  if (portfolio.length) {
    possible += 5;
    points += 5;
    reasons.push({
      label: "Portfolio",
      value: `${portfolio.length} ${portfolio.length === 1 ? "publiczny projekt" : "publicznych projektów"}`,
      status: "strong",
    });
  }

  const percent = possible ? Math.round((points / possible) * 100) : 0;
  return {
    percent,
    label: percent >= 75 ? "Bardzo dobre dopasowanie" : percent >= 50 ? "Obiecujące dopasowanie" : "Warto sprawdzić",
    reasons,
  };
}

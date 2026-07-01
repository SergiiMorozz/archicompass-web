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
  label: "Strong match" | "Promising match" | "Worth exploring";
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

function budgetRange(value: string) {
  if (value === "Under 10k PLN") return { min: 0, max: 10_000 };
  if (value === "10k-30k PLN") return { min: 10_000, max: 30_000 };
  if (value === "30k-80k PLN") return { min: 30_000, max: 80_000 };
  if (value === "80k+ PLN") return { min: 80_000, max: Number.POSITIVE_INFINITY };
  return null;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value);
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
    const styleMatch = brief.style ? contains(professionalText, brief.style) : false;
    const cueMatches = brief.cues.filter((cue) => contains(professionalText, cue));
    points += (styleMatch ? 14 : 0) + Math.min(8, cueMatches.length * 2);
    reasons.push({
      label: "Style",
      value: styleMatch
        ? `${brief.style} appears in profile or portfolio`
        : cueMatches.length
          ? `${cueMatches.length} visual preference${cueMatches.length === 1 ? "" : "s"} matched`
          : `${brief.style || "Visual direction"} needs portfolio review`,
      status: styleMatch ? "strong" : cueMatches.length ? "partial" : "check",
    });
  }

  const projectSignals = [brief.projectType, brief.goal, brief.propertyStatus, ...brief.rooms]
    .filter(Boolean);
  if (projectSignals.length) {
    possible += 15;
    const matchedSignals = projectSignals.filter((signal) => contains(professionalText, signal));
    points += Math.round((matchedSignals.length / projectSignals.length) * 15);
    const size = brief.area ? ` · ${brief.area} m2` : "";
    reasons.push({
      label: "Project scope",
      value: matchedSignals.length
        ? `${matchedSignals.length}/${projectSignals.length} brief signals found${size}`
        : `${brief.projectType || "Project"}${size} · confirm similar experience`,
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
      label: "Services",
      value:
        confirmed.length === requiredCapabilities.length
          ? `All ${requiredCapabilities.length} requested services confirmed`
          : `${confirmed.length}/${requiredCapabilities.length} requested services confirmed`,
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
      label: "Support",
      value: supportMatch ? `${brief.support} experience found` : `${brief.support} needs confirmation`,
      status: supportMatch ? "strong" : "check",
    });
  }

  if (brief.location) {
    possible += 12;
    const local = contains(normalize(professional.location ?? ""), brief.location);
    const remote = (professional.work_modes ?? []).some((mode) => mode === "Remote" || mode === "Hybrid");
    points += local ? 12 : remote ? 8 : 2;
    reasons.push({
      label: "Location",
      value: local
        ? `Local match · ${professional.location}`
        : remote
          ? `Remote or hybrid work available · ${professional.location || "location on request"}`
          : `Check service area · ${professional.location || "not provided"}`,
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
        label: "Budget",
        value: `${brief.budget} · pricing needs confirmation`,
        status: "check",
      });
    } else if (minimum <= clientBudget.max) {
      const partlyAbove = professional.price_to !== null && professional.price_to > clientBudget.max;
      points += partlyAbove ? 14 : 18;
      reasons.push({
        label: "Budget",
        value: partlyAbove
          ? `Packages overlap ${brief.budget}`
          : `Starting level fits ${brief.budget}`,
        status: partlyAbove ? "partial" : "strong",
      });
    } else {
      reasons.push({
        label: "Budget",
        value: `Minimum project is ${formatAmount(minimum)} PLN`,
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
      label: "Timing",
      value: `${brief.timeline} · ${availability || "availability needs confirmation"}`,
      status: availabilityPoints >= 7 ? "strong" : availabilityPoints >= 3 ? "partial" : "check",
    });
  }

  if (portfolio.length) {
    possible += 5;
    points += 5;
    reasons.push({
      label: "Evidence",
      value: `${portfolio.length} public portfolio project${portfolio.length === 1 ? "" : "s"}`,
      status: "strong",
    });
  }

  const percent = possible ? Math.round((points / possible) * 100) : 0;
  return {
    percent,
    label: percent >= 75 ? "Strong match" : percent >= 50 ? "Promising match" : "Worth exploring",
    reasons,
  };
}

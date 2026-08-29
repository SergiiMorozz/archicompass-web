"use client";

import Link from "next/link";
import NextImage from "next/image";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ShareableStyleResult from "@/components/ShareableStyleResult";
import { getProjectCompassCopy } from "@/content/project-compass-copy";
import { getProjectCompassJourneyCopy } from "@/content/project-compass-journey-copy";
import { copyText } from "@/lib/copy-text";
import { locationOptions } from "@/lib/location-options";
import { localeAppPath, localeAssetPath, localePublicPath, siteLocale } from "@/lib/site-locale";

type Option = {
  label: string;
  value: string;
  description: string;
  specialty?: string;
};

type ReferencePhoto = {
  file: File;
  id: string;
  name: string;
  url: string;
};

type StyleAnalysis = {
  primaryStyle: string;
  styleDirection: string;
  confidence: "low" | "medium" | "high";
  summary: string;
  colorPalette: string[];
  materials: string[];
  styleClues: string[];
  visualCues: string[];
  searchSpecialty: string;
  designerPrompt: string;
  watchOuts: string[];
};

type WorkspaceModule =
  | "inspirations"
  | "preferences"
  | "details"
  | "scope"
  | "budget";

type ProjectCompassVariant = "workspace" | "journey";
type JourneyPhase = "inspiration" | "project" | "matches";

type ProjectCompassDraft = {
  projectType: string;
  goal: string;
  style: string;
  scope: string;
  budget: string;
  timeline: string;
  areaM2: string;
  roomCount: string;
  selectedRoomTypes: string[];
  propertyStatus: string;
  visualizationNeed: string;
  supervisionNeed: string;
  location: string;
  notes: string;
  selectedVisualCues: string[];
  styleAnalysis: StyleAnalysis | null;
  touchedModules: Partial<Record<WorkspaceModule, boolean>>;
  activeModule: WorkspaceModule | null;
  journeyPhase: JourneyPhase;
};

const maxReferencePhotos = 10;
const maxAnalysisPhotos = 6;
const maxPreparedPhotoBytes = 425 * 1024;
const preparedPhotoDimensions = [1440, 1280, 1024, 800];
const preparedPhotoQualities = [0.82, 0.72, 0.62, 0.52];
const projectCompassDraftKey = "archicompass-project-compass-draft";

const workspaceFallbackPhotos = [
  "/images/home/hero-warm-minimalist-20260811.png",
  "/images/guides/popular-interior-styles-moodboard.webp",
  "/images/guides/interior-design-brief-inspiration.webp",
  "/images/guides/define-interior-style.webp",
];

const workspaceModuleMarks: Record<WorkspaceModule, string> = {
  inspirations: "01",
  preferences: "02",
  details: "03",
  scope: "04",
  budget: "05",
};

const paletteFallbacks = ["#f2e7d3", "#dfc393", "#b77c48", "#6f5747", "#40584d", "#9e9ab6"];

function isStyleAnalysis(value: unknown): value is StyleAnalysis {
  if (!value || typeof value !== "object") return false;

  const analysis = value as Partial<StyleAnalysis>;
  return (
    typeof analysis.primaryStyle === "string" &&
    typeof analysis.styleDirection === "string" &&
    (analysis.confidence === "low" || analysis.confidence === "medium" || analysis.confidence === "high") &&
    typeof analysis.summary === "string" &&
    Array.isArray(analysis.colorPalette) &&
    Array.isArray(analysis.materials) &&
    Array.isArray(analysis.styleClues) &&
    Array.isArray(analysis.visualCues) &&
    typeof analysis.searchSpecialty === "string" &&
    typeof analysis.designerPrompt === "string" &&
    Array.isArray(analysis.watchOuts)
  );
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function paletteColor(value: string, index: number) {
  const normalized = value.toLowerCase();

  if (normalized.includes("white") || normalized.includes("cream") || normalized.includes("ivory")) return "#f4eddf";
  if (normalized.includes("beige") || normalized.includes("sand") || normalized.includes("linen")) return "#dcc29b";
  if (normalized.includes("oak") || normalized.includes("wood") || normalized.includes("caramel")) return "#b67d4a";
  if (normalized.includes("brown") || normalized.includes("walnut")) return "#654d3e";
  if (normalized.includes("green") || normalized.includes("olive")) return "#637761";
  if (normalized.includes("grey") || normalized.includes("gray") || normalized.includes("stone")) return "#aaa49b";

  return paletteFallbacks[index % paletteFallbacks.length];
}

function PaletteLegend({ colors, compact = false }: { colors: string[]; compact?: boolean }) {
  if (!colors.length) return null;

  return (
    <div className={compact ? "flex flex-wrap gap-1.5" : "flex flex-wrap gap-2"}>
      {colors.slice(0, compact ? 4 : 6).map((color, index) => (
        <span key={`${color}-${index}`} className={compact ? "inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 shadow-sm" : "inline-flex items-center gap-2 rounded-full border border-line bg-background px-2.5 py-1.5 text-xs font-semibold"} title={color}>
          <span className="h-4 w-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: paletteColor(color, index) }} />
          {!compact ? <span>{color}</span> : null}
        </span>
      ))}
    </div>
  );
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
}

function sourceImage(file: File) {
  return new Promise<{ image: HTMLImageElement; url: string }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to prepare image"));
    };
    image.src = url;
  });
}

async function prepareReferencePhoto(file: File, sequence: number) {
  const safeName = `reference-${sequence}-${crypto.randomUUID()}.jpg`;

  if (file.size <= maxPreparedPhotoBytes && file.type === "image/jpeg") {
    return new File([file], safeName, { type: "image/jpeg", lastModified: file.lastModified });
  }

  try {
    const { image, url } = await sourceImage(file);
    try {
      let smallest: Blob | null = null;

      for (const maxDimension of preparedPhotoDimensions) {
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) continue;

        context.drawImage(image, 0, 0, width, height);
        for (const quality of preparedPhotoQualities) {
          const blob = await canvasBlob(canvas, quality);
          if (!blob) continue;
          if (!smallest || blob.size < smallest.size) smallest = blob;
          if (blob.size <= maxPreparedPhotoBytes) {
            return new File([blob], safeName, { type: "image/jpeg", lastModified: Date.now() });
          }
        }
      }

      if (smallest) {
        return new File([smallest], safeName, { type: "image/jpeg", lastModified: Date.now() });
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    // The server will still validate an uncommon browser image format before analysis.
  }

  return file;
}

function responseError(error: string | undefined, fallback: string) {
  if (!error) return fallback;
  return /string did not match the expected pattern|unexpected token|syntaxerror|<html/i.test(error)
    ? fallback
    : error;
}

let projectTypes: Option[] = [
  {
    label: "Mieszkanie",
    value: "Apartment",
    description: "Mieszkanie własne, na wynajem lub apartament miejski.",
  },
  {
    label: "Dom",
    value: "House",
    description: "Dom prywatny, nowa inwestycja lub większy remont.",
  },
  {
    label: "Jedno pomieszczenie",
    value: "Single room",
    description: "Kuchnia, łazienka, sypialnia, salon lub inne wnętrze.",
  },
  {
    label: "Biuro",
    value: "Office",
    description: "Miejsce pracy, pracownia lub przestrzeń obsługi klientów.",
  },
];

let goals: Option[] = [
  {
    label: "Określić kierunek",
    value: "Clarify direction",
    description: "Potrzebuję koncepcji, zanim podejmę kosztowne decyzje.",
  },
  {
    label: "Zaplanować remont",
    value: "Plan renovation",
    description: "Potrzebuję układu funkcjonalnego, materiałów i konkretnych decyzji.",
  },
  {
    label: "Kompleksowy projekt wnętrza",
    value: "Full design project",
    description: "Chcę, aby projektant poprowadził cały proces.",
  },
  {
    label: "Znaleźć właściwego specjalistę",
    value: "Find the right pro",
    description: "Wiem, czego potrzebuję, ale nie wiem, komu powierzyć projekt.",
  },
];

let styles: Option[] = [
  {
    label: "Ciepły minimalizm",
    value: "Warm minimalism",
    description: "Spokojnie, czysto i naturalnie, ale bez chłodu.",
    specialty: "minimalist",
  },
  {
    label: "Skandynawski",
    value: "Scandinavian",
    description: "Jasne wnętrza, funkcjonalność, miękkie faktury i proste formy.",
    specialty: "scandinavian",
  },
  {
    label: "Modern classic",
    value: "Modern classic",
    description: "Elegancja, harmonia i ponadczasowe detale.",
    specialty: "modern",
  },
  {
    label: "Industrialny",
    value: "Industrial",
    description: "Loftowy charakter, wyraziste faktury, metal, beton i kontrast.",
    specialty: "industrial",
  },
  {
    label: "Japandi",
    value: "Japandi",
    description: "Japoński spokój połączony ze skandynawskim ciepłem.",
    specialty: "minimalist",
  },
  {
    label: "Współczesny",
    value: "Contemporary",
    description: "Aktualne formy, dopracowane detale i harmonijna paleta materiałów.",
    specialty: "contemporary",
  },
  {
    label: "Mid-century modern",
    value: "Mid-century modern",
    description: "Czyste linie, ciepłe drewno, inspiracje vintage i funkcjonalne meble.",
    specialty: "mid-century",
  },
  {
    label: "Art déco",
    value: "Art Deco",
    description: "Geometria, szlachetne materiały, symetria i eleganckie akcenty.",
    specialty: "art deco",
  },
  {
    label: "Śródziemnomorski",
    value: "Mediterranean",
    description: "Rozbielone słońcem kolory, kamień, tynk, drewno i swobodne faktury.",
    specialty: "mediterranean",
  },
  {
    label: "Boho",
    value: "Bohemian",
    description: "Warstwowe tekstylia, pamiątki, kolor i indywidualny charakter.",
    specialty: "bohemian",
  },
  {
    label: "Eklektyczny",
    value: "Eclectic",
    description: "Świadome połączenie epok, kolorów, sztuki i elementów na zamówienie.",
    specialty: "eclectic",
  },
  {
    label: "Rustykalny / organiczny",
    value: "Rustic / organic",
    description: "Naturalny kamień, postarzane drewno, rękodzieło i ziemiste ciepło.",
    specialty: "rustic",
  },
  {
    label: "Tradycyjny",
    value: "Traditional",
    description: "Klasyczne proporcje, dopracowana stolarka i znajome formy.",
    specialty: "traditional",
  },
  {
    label: "Współczesny luksus",
    value: "Luxury contemporary",
    description: "Stolarka na wymiar, kamień premium, światło i perfekcyjne detale.",
    specialty: "luxury",
  },
  {
    label: "Jeszcze nie wiem",
    value: "Not sure yet",
    description: "Chcę, aby ArchiCompass pomógł mi nazwać ten kierunek.",
  },
];

let scopes: Option[] = [
  {
    label: "Konsultacja",
    value: "Consultation",
    description: "Krótkie spotkanie, które pomoże uniknąć nietrafionych decyzji.",
  },
  {
    label: "Projekt koncepcyjny",
    value: "Concept package",
    description: "Moodboard, układ funkcjonalny, materiały i priorytety.",
  },
  {
    label: "Projekt wykonawczy",
    value: "Technical design",
    description: "Rysunki, specyfikacje i detale gotowe dla wykonawców.",
  },
  {
    label: "Kompleksowa obsługa",
    value: "End-to-end support",
    description: "Projekt, zakupy, koordynacja i wsparcie podczas realizacji.",
  },
];

let budgets: Option[] = [
  {
    label: "Do 50 tys. zł",
    value: "Under 50k PLN total project budget",
    description: "Jedno pomieszczenie, wyposażenie lub niewielki, precyzyjnie określony remont.",
  },
  {
    label: "50-100 tys. zł",
    value: "50k-100k PLN total project budget",
    description: "Kilka pomieszczeń lub niewielkie mieszkanie z kontrolowanym zakresem.",
  },
  {
    label: "100-200 tys. zł",
    value: "100k-200k PLN total project budget",
    description: "Gruntowny remont mieszkania lub kompleksowe niewielkie wnętrze.",
  },
  {
    label: "200-400 tys. zł",
    value: "200k-400k PLN total project budget",
    description: "Kompleksowe wnętrze mieszkania lub domu z elementami na wymiar.",
  },
  {
    label: "400-800 tys. zł",
    value: "400k-800k PLN total project budget",
    description: "Większy dom, materiały premium i rozbudowany zakres realizacji.",
  },
  {
    label: "Powyżej 800 tys. zł",
    value: "800k+ PLN total project budget",
    description: "Duża inwestycja lub projekt i realizacja w segmencie premium.",
  },
  {
    label: "Jeszcze nie wiem",
    value: "Total project budget not decided",
    description: "Potrzebuję pomocy projektanta w ustaleniu realnego budżetu całości.",
  },
];

let timelines: Option[] = [
  {
    label: "Jak najszybciej",
    value: "As soon as possible",
    description: "Mogę już teraz rozmawiać z dostępnymi projektantami.",
  },
  {
    label: "Za 1-3 miesiące",
    value: "In 1-3 months",
    description: "Przygotowuję decyzje i chcę wkrótce wybrać krótką listę projektantów.",
  },
  {
    label: "Za 3-6 miesięcy",
    value: "In 3-6 months",
    description: "Planuję z wyprzedzeniem przed rozpoczęciem inwestycji.",
  },
  {
    label: "Na razie się rozglądam",
    value: "Just exploring",
    description: "Najpierw chcę uporządkować potrzeby i dopiero potem wybrać termin.",
  },
];

let propertyStatuses: Option[] = [
  {
    label: "Nowe mieszkanie lub dom",
    value: "New build / developer condition",
    description: "Nowa nieruchomość przed odbiorem lub rozpoczęciem prac wykończeniowych.",
  },
  {
    label: "Istniejące wnętrze",
    value: "Existing property",
    description: "Użytkowane, umeblowane lub wcześniej wykończone wnętrze.",
  },
  {
    label: "Remont w toku",
    value: "Renovation in progress",
    description: "Prace już trwają, ale nadal trzeba podjąć decyzje projektowe.",
  },
  {
    label: "Nieruchomość jeszcze niekupiona",
    value: "Not purchased yet",
    description: "Planuję przed wyborem lub odbiorem nieruchomości.",
  },
];

let visualizationNeeds: Option[] = [
  {
    label: "Nie potrzebuję",
    value: "Not needed",
    description: "Wystarczą mi rzuty, próbki materiałów lub moodboard.",
  },
  {
    label: "Wybrane pomieszczenia",
    value: "Selected rooms",
    description: "Chcę realistycznych ujęć najważniejszych pomieszczeń.",
  },
  {
    label: "Cały projekt",
    value: "Full project",
    description: "Potrzebuję wizualizacji 3D dla całego projektu.",
  },
  {
    label: "Jeszcze nie wiem",
    value: "Not sure yet",
    description: "Chcę, aby projektant doradził odpowiedni zakres.",
  },
];

let supervisionNeeds: Option[] = [
  {
    label: "Nie potrzebuję",
    value: "Not needed",
    description: "Potrzebuję tylko projektu i dokumentacji.",
  },
  {
    label: "Konsultacje / wizyty na budowie",
    value: "Consultations / site visits",
    description: "Okresowe kontrole i pomoc przy decyzjach na miejscu.",
  },
  {
    label: "Nadzór autorski",
    value: "Author's supervision",
    description: "Projektant czuwa nad zgodnością realizacji z projektem.",
  },
  {
    label: "Pełna koordynacja realizacji",
    value: "Full project coordination",
    description: "Potrzebuję aktywnej koordynacji wykonawców, zamówień i dostaw.",
  },
];

const roomTypes = [
  "Living room",
  "Kitchen",
  "Bedroom",
  "Bathroom",
  "Home office",
  "Children's room",
  "Hall / storage",
  "Other",
];

let roomTypeLabels: Record<string, string> = {
  "Living room": "Salon",
  Kitchen: "Kuchnia",
  Bedroom: "Sypialnia",
  Bathroom: "Łazienka",
  "Home office": "Gabinet domowy",
  "Children's room": "Pokój dziecięcy",
  "Hall / storage": "Hol / przechowywanie",
  Other: "Inne",
};

let visualCues: Option[] = [
  {
    label: "Naturalne drewno",
    value: "Natural wood",
    description: "Dąb, fornir, widoczne usłojenie i ciepłe materiały.",
    specialty: "eco-friendly",
  },
  {
    label: "Jasna neutralna paleta",
    value: "Bright neutral palette",
    description: "Biel, beż, greige i miękkie światło dzienne.",
    specialty: "minimalist",
  },
  {
    label: "Ukryte przechowywanie",
    value: "Hidden storage",
    description: "Zabudowy, czyste linie i mniej wizualnego chaosu.",
  },
  {
    label: "Wyraziste akcenty kolorystyczne",
    value: "Bold color accents",
    description: "Mocne kolory ścian, sztuka, tekstylia i zdecydowany kontrast.",
  },
  {
    label: "Ciemny kontrast",
    value: "Dark contrast",
    description: "Czarne detale, nastrojowe wnętrza i wyrazista geometria.",
    specialty: "industrial",
  },
  {
    label: "Luksusowe detale",
    value: "Luxury details",
    description: "Kamień, mosiądz, stolarka na wymiar i wykończenie premium.",
    specialty: "luxury",
  },
  {
    label: "Materiały ekologiczne",
    value: "Eco materials",
    description: "Naturalne, trwałe materiały o mniejszym wpływie na środowisko.",
    specialty: "eco-friendly",
  },
  {
    label: "Smart home",
    value: "Smart home",
    description: "Sceny świetlne, automatyka i zintegrowane technologie.",
    specialty: "smart home",
  },
  {
    label: "Rozwiązania do małych przestrzeni",
    value: "Compact solutions",
    description: "Sprytne wykorzystanie miejsca, elastyczne meble i przechowywanie.",
  },
  {
    label: "Miękkie linie",
    value: "Soft curves",
    description: "Zaokrąglone meble, spokojne formy i łagodne linie.",
  },
];

const copy = getProjectCompassCopy();
({
  projectTypes,
  goals,
  styles,
  scopes,
  budgets,
  timelines,
  propertyStatuses,
  visualizationNeeds,
  supervisionNeeds,
  visualCues,
  roomTypeLabels,
} = copy.options);

function selectedOption(options: Option[], value: string) {
  return options.find((option) => option.value === value) ?? options[0];
}

function optionLabel(options: Option[], value: string) {
  return options.find((option) => option.value === value)?.label || value || copy.ui.notProvided;
}

function styleLabels(value: string) {
  return value
    .split(" | ")
    .filter(Boolean)
    .map((item) => optionLabel(styles, item))
    .join(" / ");
}

function confidenceLabel(confidence: StyleAnalysis["confidence"]) {
  return copy.ui.confidence[confidence];
}

function confidenceProgress(confidence: StyleAnalysis["confidence"]) {
  return confidence === "high" ? 88 : confidence === "medium" ? 62 : 36;
}

function styleValues(value: string) {
  const values = value.split(" | ").filter(Boolean);
  return values;
}

function primaryStyleValue(value: string) {
  return styleValues(value)[0] ?? "Not sure yet";
}

function mergeStyleValue(current: string, suggested: string) {
  if (!suggested || suggested === "Not sure yet") return current;
  const values = styleValues(current).filter((item) => item !== "Not sure yet");
  return Array.from(new Set([suggested, ...values])).slice(0, 4).join(" | ");
}

function OptionGrid({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section>
      <h2 className="text-base font-bold">{label}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${option.label}: ${option.description}`}
              onClick={() => onChange(option.value)}
              className={[
                "rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary-soft text-foreground"
                  : "border-line bg-background hover:border-primary",
              ].join(" ")}
            >
              <span className="block text-sm font-bold">{option.label}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MultiOptionGrid({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const initialOptionCount = 6;
  const [showAll, setShowAll] = useState(false);
  const visibleOptions = showAll
    ? options
    : options.filter((option, index) => index < initialOptionCount || values.includes(option.value));

  return (
    <section>
      <h2 className="text-base font-bold">{label}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        {copy.ui.stylesHint}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {visibleOptions.map((option) => {
          const selected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                const withoutUnsure = values.filter((item) => item !== "Not sure yet");
                if (option.value === "Not sure yet") {
                  onChange(selected ? [] : [option.value]);
                } else if (selected) {
                  onChange(withoutUnsure.filter((item) => item !== option.value));
                } else {
                  onChange([...withoutUnsure, option.value].slice(0, 4));
                }
              }}
              className={[
                "rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2",
                selected ? "border-primary bg-primary-soft" : "border-line bg-background hover:border-primary",
              ].join(" ")}
            >
              <span className="block text-sm font-bold">{option.label}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{option.description}</span>
            </button>
          );
        })}
      </div>
      {options.length > initialOptionCount ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="mt-4 text-sm font-semibold text-primary hover:underline"
        >
          {showAll ? copy.ui.showFewerStyles : copy.ui.showMoreStyles(options.length - initialOptionCount)}
        </button>
      ) : null}
    </section>
  );
}

function ProjectLocationSelect({
  label,
  options,
  placeholder,
  value,
  invalid,
  onChange,
}: {
  label: string;
  options: string[];
  placeholder: string;
  value: string;
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block max-w-xl text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="address-level2"
        aria-invalid={invalid || undefined}
        className={[
          "mt-2 w-full rounded-xl border bg-background px-4 py-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2",
          invalid ? "border-red-400" : "border-line focus:border-primary",
        ].join(" ")}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ProjectCompass({
  isDesigner = false,
  isAuthenticated = false,
  variant = "workspace",
  entryPath = "/ai-project-compass",
}: {
  isDesigner?: boolean;
  isAuthenticated?: boolean;
  variant?: ProjectCompassVariant;
  entryPath?: string;
}) {
  const [projectType, setProjectType] = useState("");
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState("");
  const [scope, setScope] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [propertyStatus, setPropertyStatus] = useState("");
  const [visualizationNeed, setVisualizationNeed] = useState("");
  const [supervisionNeed, setSupervisionNeed] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [referencePhotos, setReferencePhotos] = useState<ReferencePhoto[]>([]);
  const [selectedVisualCues, setSelectedVisualCues] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedBriefId, setSavedBriefId] = useState<string | null>(null);
  const [savedBriefSignature, setSavedBriefSignature] = useState<string | null>(null);
  const [savedReferenceCount, setSavedReferenceCount] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [activeModule, setActiveModule] = useState<WorkspaceModule | null>(null);
  const [showFullBrief, setShowFullBrief] = useState(false);
  const [touchedModules, setTouchedModules] = useState<Partial<Record<WorkspaceModule, boolean>>>({});
  const [journeyPhase, setJourneyPhase] = useState<JourneyPhase>("inspiration");
  const [draftRestored, setDraftRestored] = useState(false);
  const objectUrls = useRef<string[]>([]);
  const journeyPhotoInputRef = useRef<HTMLInputElement>(null);
  const analysisResultRef = useRef<HTMLElement>(null);
  const shouldScrollToAnalysisRef = useRef(false);

  useEffect(() => {
    if (!styleAnalysis || !shouldScrollToAnalysisRef.current) return;

    shouldScrollToAnalysisRef.current = false;
    const timeout = window.setTimeout(() => {
      analysisResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      analysisResultRef.current?.focus({ preventScroll: true });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [styleAnalysis]);

  function markModule(module: WorkspaceModule) {
    setTouchedModules((current) => (current[module] ? current : { ...current, [module]: true }));
  }

  function openModule(module: WorkspaceModule) {
    setActiveModule(module);
    window.setTimeout(() => {
      document.getElementById("project-compass-editor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function openJourneyPhase(phase: JourneyPhase, module?: WorkspaceModule) {
    if (phase === "matches" && projectDetailsValidationMessage) {
      setSaveError(projectDetailsValidationMessage);
      setJourneyPhase("project");
      setActiveModule("details");
      window.setTimeout(() => {
        document.getElementById("project-compass-journey-flow")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
      return;
    }

    setJourneyPhase(phase);
    if (module) setActiveModule(module);
    if (phase === "project" && !module && !activeModule) setActiveModule("details");

    window.setTimeout(() => {
      document.getElementById("project-compass-journey-flow")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function startJourneyWithPhotos() {
    setJourneyPhase("inspiration");
    window.setTimeout(() => journeyPhotoInputRef.current?.click(), 0);
  }

  const selectedStyles = styleValues(style);
  const selectedStyle = selectedStyles[0] ? selectedOption(styles, selectedStyles[0]) : null;
  const selectedScope = selectedOption(scopes, scope);
  const selectedCueOptions = useMemo(
    () => visualCues.filter((cue) => selectedVisualCues.includes(cue.value)),
    [selectedVisualCues]
  );
  const visualSearchSpecialty =
    styleAnalysis?.searchSpecialty ||
    selectedCueOptions.find((cue) => cue.specialty)?.specialty ||
    styles.find((option) => selectedStyles.includes(option.value) && option.specialty)?.specialty ||
    selectedStyle?.specialty;
  const visualCueLabel = selectedVisualCues.length
    ? selectedVisualCues.slice(0, 3).map((item) => optionLabel(visualCues, item)).join(", ")
    : selectedStyle?.label || copy.ui.notSelected;

  const hasSelectedStyle = selectedStyles.length > 0;
  const normalizedAreaM2 = Number(areaM2.replace(",", "."));
  const normalizedRoomCount = Number(roomCount);
  const areaM2IsInvalid =
    Boolean(areaM2.trim()) &&
    (!Number.isFinite(normalizedAreaM2) || normalizedAreaM2 < 1 || normalizedAreaM2 > 2000);
  const roomCountIsInvalid =
    Boolean(roomCount.trim()) &&
    (!Number.isInteger(normalizedRoomCount) || normalizedRoomCount < 1 || normalizedRoomCount > 50);
  const projectCompassLocationList = useMemo(() => locationOptions(siteLocale), [siteLocale]);
  const locationIsInvalid =
    Boolean(location.trim()) && !projectCompassLocationList.includes(location.trim());
  const validAreaM2 = areaM2IsInvalid ? "" : areaM2.trim();
  const validRoomCount = roomCountIsInvalid ? "" : roomCount.trim();
  const validLocation = locationIsInvalid ? "" : location.trim();
  const projectDetailsValidationMessage = areaM2IsInvalid
    ? siteLocale === "pl"
      ? "Podaj powierzchnię od 1 do 2000 m²."
      : "Enter an area between 1 and 2,000 m²."
    : roomCountIsInvalid
    ? siteLocale === "pl"
      ? "Podaj liczbę pomieszczeń od 1 do 50."
      : "Enter a room count between 1 and 50."
    : locationIsInvalid
    ? siteLocale === "pl"
      ? "Wybierz lokalizację z listy."
      : "Choose a location from the list."
    : null;

  useEffect(() => {
    // A validation error should disappear as soon as the user fixes the last invalid field.
    if (!projectDetailsValidationMessage && saveError) {
      const validationErrors = siteLocale === "pl"
        ? ["Podaj powierzchnię od 1 do 2000 m².", "Podaj liczbę pomieszczeń od 1 do 50.", "Wybierz lokalizację z listy."]
        : ["Enter an area between 1 and 2,000 m².", "Enter a room count between 1 and 50.", "Choose a location from the list."];

      if (validationErrors.includes(saveError)) setSaveError(null);
    }
  }, [projectDetailsValidationMessage, saveError]);
  const hasStyleDirection = Boolean(styleAnalysis || hasSelectedStyle || selectedVisualCues.length || notes.trim());
  const hasProjectDetails = Boolean(projectType || validAreaM2 || validRoomCount || selectedRoomTypes.length || propertyStatus || validLocation);
  const hasScope = Boolean(goal || scope || visualizationNeed || supervisionNeed);
  const hasBudget = Boolean(budget || timeline);
  const hasPreferences = Boolean(styleAnalysis || hasSelectedStyle || selectedVisualCues.length || notes.trim());
  const detailReadiness =
    (projectType ? 5 : 0) +
    (validAreaM2 || validRoomCount || selectedRoomTypes.length ? 8 : 0) +
    (propertyStatus ? 4 : 0) +
    (validLocation ? 8 : 0);
  const scopeReadiness =
    (goal ? 7 : 0) +
    (scope ? 7 : 0) +
    (visualizationNeed ? 3 : 0) +
    (supervisionNeed ? 3 : 0);
  const budgetReadiness = (budget ? 8 : 0) + (timeline ? 7 : 0);
  const readinessParts = [
    { module: "inspirations" as const, weight: 25, amount: styleAnalysis ? 25 : referencePhotos.length ? 10 : 0, complete: Boolean(styleAnalysis) },
    { module: "preferences" as const, weight: 15, amount: styleAnalysis || hasSelectedStyle ? 15 : selectedVisualCues.length || notes.trim() ? 8 : 0, complete: hasPreferences },
    { module: "details" as const, weight: 25, amount: detailReadiness, complete: detailReadiness >= 17 },
    { module: "scope" as const, weight: 20, amount: scopeReadiness, complete: scopeReadiness >= 14 },
    { module: "budget" as const, weight: 15, amount: budgetReadiness, complete: budgetReadiness >= 8 },
  ];
  const briefReadiness = readinessParts.reduce(
    (total, item) => total + item.amount,
    0
  );
  const briefStatus =
    briefReadiness >= 70
      ? copy.ui.workspace.statusReady
      : briefReadiness > 0
      ? copy.ui.workspace.statusInProgress
      : copy.ui.workspace.statusEmpty;
  const recommendedModule = readinessParts.find((item) => item.amount < item.weight)?.module ?? "budget";
  const isReadyForMatching = Boolean(hasStyleDirection && (hasProjectDetails || hasScope || hasBudget));
  const workspaceProjectSummary = hasProjectDetails
    ? `${optionLabel(projectTypes, projectType)}${validAreaM2 ? ` · ${validAreaM2} m²` : ""}${validLocation ? ` · ${validLocation}` : ""}`
    : copy.ui.notProvided;
  const workspaceScopeSummary = hasScope ? optionLabel(scopes, scope) : copy.ui.notProvided;
  const workspaceBudgetSummary = hasBudget ? optionLabel(budgets, budget) : copy.ui.notProvided;
  const workspaceTimelineSummary = hasBudget ? optionLabel(timelines, timeline) : copy.ui.notProvided;
  const workspacePhotos = referencePhotos.length
    ? referencePhotos.slice(0, 4).map((photo) => photo.url)
    : workspaceFallbackPhotos.map((photo) => localeAssetPath(photo));
  const workspaceModules = [
    {
      id: "inspirations" as const,
      title: copy.ui.workspace.inspirations.title,
      body: copy.ui.workspace.inspirations.body,
      preview: referencePhotos.length
        ? styleAnalysis
          ? styleAnalysis.primaryStyle
          : copy.ui.workspace.inspirations.previewReady(referencePhotos.length)
        : copy.ui.workspace.inspirations.previewEmpty,
      complete: Boolean(referencePhotos.length && styleAnalysis),
      touched: Boolean(touchedModules.inspirations || styleAnalysis),
    },
    {
      id: "preferences" as const,
      title: copy.ui.workspace.preferences.title,
      body: copy.ui.workspace.preferences.body,
      preview: hasPreferences
        ? styleAnalysis?.primaryStyle || styleLabels(style)
        : copy.ui.workspace.preferences.previewEmpty,
      complete: hasPreferences,
      touched: Boolean(touchedModules.preferences || styleAnalysis),
    },
    {
      id: "details" as const,
      title: copy.ui.workspace.details.title,
      body: copy.ui.workspace.details.body,
      preview: hasProjectDetails
        ? `${optionLabel(projectTypes, projectType)}${validAreaM2 ? ` · ${validAreaM2} m²` : ""}${validLocation ? ` · ${validLocation}` : ""}`
        : copy.ui.workspace.details.previewEmpty,
      complete: hasProjectDetails,
      touched: Boolean(touchedModules.details),
    },
    {
      id: "scope" as const,
      title: copy.ui.workspace.scope.title,
      body: copy.ui.workspace.scope.body,
      preview: hasScope ? optionLabel(scopes, scope) : copy.ui.workspace.scope.previewEmpty,
      complete: hasScope,
      touched: Boolean(touchedModules.scope),
    },
    {
      id: "budget" as const,
      title: copy.ui.workspace.budget.title,
      body: copy.ui.workspace.budget.body,
      preview: hasBudget
        ? `${optionLabel(budgets, budget)} · ${optionLabel(timelines, timeline)}`
        : copy.ui.workspace.budget.previewEmpty,
      complete: hasBudget,
      touched: Boolean(touchedModules.budget),
    },
  ];

  const designerParams = new URLSearchParams({ sort: "recommended", view: "list" });
  if (isReadyForMatching) designerParams.set("match", "brief");
  const matchingSignals = {
    projectType,
    goal,
    style: styleAnalysis?.styleDirection || style,
    support: scope,
    budget,
    timeline,
    propertyStatus,
    visualization: visualizationNeed,
    supervision: supervisionNeed,
  };
  Object.entries(matchingSignals).forEach(([key, value]) => {
    if (value) designerParams.set(key, value);
  });

  if (validAreaM2) designerParams.set("area", validAreaM2);
  if (validRoomCount) designerParams.set("roomCount", validRoomCount);
  if (selectedRoomTypes.length) designerParams.set("rooms", selectedRoomTypes.join(","));
  if (validLocation) designerParams.set("location", validLocation);
  if (visualSearchSpecialty) designerParams.set("specialty", visualSearchSpecialty);
  if (selectedVisualCues.length) designerParams.set("cues", selectedVisualCues.slice(0, 5).join(","));
  if (savedBriefId) designerParams.set("brief", savedBriefId);

  const designerHref = `/designers?${designerParams.toString()}`;
  const designerPublicHref = localePublicPath(siteLocale, designerHref);

  const briefText = useMemo(
    () =>
      [
        copy.ui.draft.investment(optionLabel(projectTypes, projectType)),
        copy.ui.draft.goal(optionLabel(goals, goal)),
        copy.ui.draft.area(validAreaM2 ? `${validAreaM2} m²` : copy.ui.notProvided.toLowerCase()),
        copy.ui.draft.roomCount(validRoomCount || copy.ui.notProvided.toLowerCase()),
        selectedRoomTypes.length
          ? copy.ui.draft.rooms(selectedRoomTypes.map((item) => roomTypeLabels[item] || item).join(", "))
          : null,
        copy.ui.draft.propertyStatus(optionLabel(propertyStatuses, propertyStatus)),
        copy.ui.draft.style(styleLabels(style)),
        referencePhotos.length
          ? copy.ui.draft.photos(
              referencePhotos.length,
              `${referencePhotos.map((photo) => photo.name).slice(0, 5).join(", ")}${referencePhotos.length > 5 ? ", ..." : ""}`
            )
          : copy.ui.draft.noPhotos,
        styleAnalysis
          ? [
              copy.ui.draft.analysis(
                styleAnalysis.primaryStyle,
                confidenceLabel(styleAnalysis.confidence)
              ),
              copy.ui.draft.analysisSummary(styleAnalysis.summary),
              styleAnalysis.colorPalette.length
                ? copy.ui.draft.palette(styleAnalysis.colorPalette.join(", "))
                : null,
              styleAnalysis.materials.length
                ? copy.ui.draft.materials(styleAnalysis.materials.join(", "))
                : null,
              styleAnalysis.designerPrompt
                ? copy.ui.draft.designerTip(styleAnalysis.designerPrompt)
                : null,
            ]
              .filter(Boolean)
              .join("\n")
          : null,
        selectedVisualCues.length
          ? copy.ui.draft.visualCues(
              selectedVisualCues.map((item) => optionLabel(visualCues, item)).join(", ")
            )
          : null,
        copy.ui.draft.scope(optionLabel(scopes, scope)),
        copy.ui.draft.budget(optionLabel(budgets, budget)),
        copy.ui.draft.timeline(optionLabel(timelines, timeline)),
        copy.ui.draft.visualization(optionLabel(visualizationNeeds, visualizationNeed)),
        copy.ui.draft.supervision(optionLabel(supervisionNeeds, supervisionNeed)),
        copy.ui.draft.location(validLocation || copy.ui.notProvided.toLowerCase()),
        notes.trim() ? copy.ui.draft.notes(notes.trim()) : null,
      ]
        .filter(Boolean)
        .join("\n"),
    [
      budget,
      validAreaM2,
      goal,
      validLocation,
      notes,
      projectType,
      propertyStatus,
      referencePhotos,
      validRoomCount,
      scope,
      selectedRoomTypes,
      selectedVisualCues,
      style,
      styleAnalysis,
      supervisionNeed,
      timeline,
      visualizationNeed,
    ]
  );

  const persistProjectCompassDraft = useCallback(() => {
    if (typeof window === "undefined") return;

    const draft: ProjectCompassDraft = {
      projectType,
      goal,
      style,
      scope,
      budget,
      timeline,
      areaM2,
      roomCount,
      selectedRoomTypes,
      propertyStatus,
      visualizationNeed,
      supervisionNeed,
      location,
      notes,
      selectedVisualCues,
      styleAnalysis,
      touchedModules,
      activeModule,
      journeyPhase,
    };
    const hasContent = Boolean(
      draft.projectType ||
        draft.goal ||
        draft.style ||
        draft.scope ||
        draft.budget ||
        draft.timeline ||
        draft.areaM2 ||
        draft.roomCount ||
        draft.selectedRoomTypes.length ||
        draft.propertyStatus ||
        draft.visualizationNeed ||
        draft.supervisionNeed ||
        draft.location.trim() ||
        draft.notes.trim() ||
        draft.selectedVisualCues.length ||
        draft.styleAnalysis
    );

    try {
      if (hasContent) {
        window.sessionStorage.setItem(projectCompassDraftKey, JSON.stringify(draft));
      } else {
        window.sessionStorage.removeItem(projectCompassDraftKey);
      }
    } catch {
      // Keep the form usable if browser storage is unavailable.
    }
  }, [
    activeModule,
    areaM2,
    budget,
    goal,
    journeyPhase,
    location,
    notes,
    projectType,
    propertyStatus,
    roomCount,
    scope,
    selectedRoomTypes,
    selectedVisualCues,
    style,
    styleAnalysis,
    supervisionNeed,
    timeline,
    touchedModules,
    visualizationNeed,
  ]);

  const nextStep = useMemo(() => {
    if (scope === "Consultation") {
      return copy.ui.nextSteps.consultation;
    }

    if (scope === "End-to-end support") {
      return copy.ui.nextSteps.endToEnd;
    }

    if (goal === "Clarify direction") {
      return copy.ui.nextSteps.clarify;
    }

    return copy.ui.nextSteps.default;
  }, [goal, scope]);

  async function copyBrief() {
    try {
      await copyText(briefText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : copy.ui.errors.copy);
    }
  }

  async function addReferencePhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );
    event.currentTarget.value = "";

    if (!files.length) return;

    const remainingSlots = Math.max(0, maxReferencePhotos - referencePhotos.length);
    if (!remainingSlots) return;

    setIsPreparingPhotos(true);
    try {
      const nextPhotos = await Promise.all(
        files.slice(0, remainingSlots).map(async (file, index) => {
          const preparedFile = await prepareReferencePhoto(file, referencePhotos.length + index + 1);
          const url = URL.createObjectURL(preparedFile);
          objectUrls.current.push(url);

          return {
            file: preparedFile,
            id: `${preparedFile.name}-${preparedFile.lastModified}-${crypto.randomUUID()}`,
            name: file.name || preparedFile.name,
            url,
          };
        })
      );

      setReferencePhotos((current) => [
        ...current,
        ...nextPhotos.slice(0, Math.max(0, maxReferencePhotos - current.length)),
      ]);
      markModule("inspirations");
      setStyleAnalysis(null);
      setAnalysisError(null);
    } finally {
      setIsPreparingPhotos(false);
    }

  }

  function removeReferencePhoto(photoId: string) {
    setReferencePhotos((current) =>
      current.filter((photo) => {
        if (photo.id !== photoId) return true;

        URL.revokeObjectURL(photo.url);
        objectUrls.current = objectUrls.current.filter((url) => url !== photo.url);
        return false;
      })
    );
    setStyleAnalysis(null);
    setAnalysisError(null);
    markModule("inspirations");
  }

  async function analyzeReferencePhotos() {
    if (!referencePhotos.length) {
      setAnalysisError(copy.ui.errors.noPhotos);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const formData = new FormData();
    formData.set("analysis_locale", siteLocale);
    formData.set("project_type", optionLabel(projectTypes, projectType));
    formData.set("style_direction", styleLabels(primaryStyleValue(style)));
    formData.set(
      "visual_cues",
      selectedVisualCues.length
        ? selectedVisualCues.map((item) => optionLabel(visualCues, item)).join(", ")
        : copy.ui.none
    );

    referencePhotos.slice(0, maxAnalysisPhotos).forEach((photo) => {
      formData.append("reference_photos", photo.file, photo.name);
    });

    try {
      const response = await fetch(
        new URL(localePublicPath(siteLocale, "/api/style-analysis"), window.location.origin).toString(),
        {
          method: "POST",
          body: formData,
          headers: {
            "X-ArchiCompass-Analysis-Locale": siteLocale,
          },
        }
      );
      const payload = (await response.json().catch(() => ({}))) as {
        analysis?: StyleAnalysis;
        code?: string;
        error?: string;
      };

      if (!response.ok || !payload.analysis) {
        throw new Error(responseError(payload.error, copy.ui.errors.analysis));
      }

      shouldScrollToAnalysisRef.current = true;
      setStyleAnalysis(payload.analysis);
      markModule("inspirations");
      markModule("preferences");
      if (styles.some((option) => option.value === payload.analysis?.styleDirection)) {
        setStyle((current) => mergeStyleValue(current, payload.analysis!.styleDirection));
      }

      setSelectedVisualCues((current) =>
        Array.from(new Set([...current, ...payload.analysis!.visualCues]))
      );
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : copy.ui.errors.analysis
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function saveBrief(openMatches = false) {
    if (projectDetailsValidationMessage) {
      setSaveError(projectDetailsValidationMessage);
      openModule("details");
      return;
    }

    if (openMatches && !isReadyForMatching) {
      setSaveError(copy.ui.workspace.continueBody);
      openModule(recommendedModule);
      return;
    }

    if (openMatches && savedBriefId && savedBriefSignature === briefText) {
      const matchesUrl = new URL(designerPublicHref, window.location.origin);
      matchesUrl.searchParams.set("brief", savedBriefId);
      window.location.href = matchesUrl.toString();
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSavedBriefId(null);
    setSavedReferenceCount(null);

    const formData = new FormData();
    formData.set("locale", siteLocale);
    formData.set("project_type", projectType);
    formData.set("goal", goal);
    formData.set("style_direction", style);
    formData.set("support_scope", scope);
    formData.set("budget_signal", budget);
    formData.set("timeline", timeline);
    formData.set("area_m2", validAreaM2);
    formData.set("room_count", validRoomCount);
    formData.set("room_types", JSON.stringify(selectedRoomTypes));
    formData.set("property_status", propertyStatus);
    formData.set("visualization_need", visualizationNeed);
    formData.set("supervision_need", supervisionNeed);
    formData.set("location", validLocation);
    formData.set("notes", notes);
    formData.set(
      "visual_cues",
      JSON.stringify(selectedVisualCues.map((item) => optionLabel(visualCues, item)))
    );
    formData.set("brief_text", briefText);
    formData.set("designer_search_href", designerHref);

    referencePhotos.forEach((photo) => {
      formData.append("reference_photos", photo.file, photo.name);
    });

    try {
      const response = await fetch(localePublicPath(siteLocale, "/api/project-briefs"), {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        code?: string;
        error?: string;
        id?: string;
        referencePhotoCount?: number;
      };

      if (
        response.status === 401 ||
        payload.code === "AUTH_REQUIRED" ||
        payload.code === "ONBOARDING_REQUIRED"
      ) {
        persistProjectCompassDraft();
        const next = encodeURIComponent(localeAppPath(entryPath));
        window.location.href =
          payload.code === "ONBOARDING_REQUIRED"
            ? `${localePublicPath(siteLocale, "/onboarding")}?intent=client&next=${next}`
            : `${localePublicPath(siteLocale, "/login")}?next=${next}`;
        return;
      }

      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? copy.ui.errors.save);
      }

      setSavedBriefId(payload.id);
      setSavedBriefSignature(briefText);
      setSavedReferenceCount(payload.referencePhotoCount ?? 0);
      window.sessionStorage.removeItem(projectCompassDraftKey);

      if (openMatches) {
        const matchesUrl = new URL(designerPublicHref, window.location.origin);
        matchesUrl.searchParams.set("brief", payload.id);
        window.location.href = matchesUrl.toString();
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : copy.ui.errors.save);
    } finally {
      setIsSaving(false);
    }
  }

  function toggleVisualCue(value: string) {
    setSelectedVisualCues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function toggleRoomType(value: string) {
    setSelectedRoomTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  useLayoutEffect(() => {
    const rawDraft = window.sessionStorage.getItem(projectCompassDraftKey);
    if (rawDraft) {
      try {
        const draft = JSON.parse(rawDraft) as Partial<ProjectCompassDraft>;
        if (typeof draft.projectType === "string") setProjectType(draft.projectType);
        if (typeof draft.goal === "string") setGoal(draft.goal);
        if (typeof draft.style === "string") setStyle(draft.style);
        if (typeof draft.scope === "string") setScope(draft.scope);
        if (typeof draft.budget === "string") setBudget(draft.budget);
        if (typeof draft.timeline === "string") setTimeline(draft.timeline);
        if (typeof draft.areaM2 === "string") setAreaM2(draft.areaM2);
        if (typeof draft.roomCount === "string") setRoomCount(draft.roomCount);
        setSelectedRoomTypes(stringArray(draft.selectedRoomTypes));
        if (typeof draft.propertyStatus === "string") setPropertyStatus(draft.propertyStatus);
        if (typeof draft.visualizationNeed === "string") setVisualizationNeed(draft.visualizationNeed);
        if (typeof draft.supervisionNeed === "string") setSupervisionNeed(draft.supervisionNeed);
        if (typeof draft.location === "string") setLocation(draft.location);
        if (typeof draft.notes === "string") setNotes(draft.notes);
        setSelectedVisualCues(stringArray(draft.selectedVisualCues));
        if (isStyleAnalysis(draft.styleAnalysis)) {
          setStyleAnalysis(draft.styleAnalysis);
        }
        if (draft.touchedModules && typeof draft.touchedModules === "object") {
          const restoredTouched: Partial<Record<WorkspaceModule, boolean>> = {};
          (["inspirations", "preferences", "details", "scope", "budget"] as WorkspaceModule[]).forEach((module) => {
            if (draft.touchedModules?.[module]) restoredTouched[module] = true;
          });
          setTouchedModules(restoredTouched);
        }
        if (
          draft.activeModule === "inspirations" ||
          draft.activeModule === "preferences" ||
          draft.activeModule === "details" ||
          draft.activeModule === "scope" ||
          draft.activeModule === "budget"
        ) {
          setActiveModule(draft.activeModule);
        }
        if (
          draft.journeyPhase === "inspiration" ||
          draft.journeyPhase === "project" ||
          draft.journeyPhase === "matches"
        ) {
          setJourneyPhase(draft.journeyPhase);
        }
      } catch {
        // Ignore an invalid browser draft and continue with the default brief.
      }
    }

    setDraftRestored(true);

    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current = [];
    };
  }, []);

  useEffect(() => {
    if (!draftRestored) return;
    persistProjectCompassDraft();
  }, [draftRestored, persistProjectCompassDraft]);

  const journeyCopy = getProjectCompassJourneyCopy();
  const hasMeaningfulBrief = Boolean(
    hasStyleDirection && (hasProjectDetails || hasScope || hasBudget || selectedVisualCues.length || notes.trim())
  );
  const manualStyleLabel = hasSelectedStyle ? styleLabels(style) : "";

  if (variant === "journey") {
    const activeJourneyModule =
      activeModule === "preferences" || activeModule === "details" || activeModule === "scope" || activeModule === "budget"
        ? activeModule
        : "details";

    return (
      <main className="bg-[#fbfaff] pb-16 text-foreground">
        <section className="border-b border-[#ece6f7] bg-[radial-gradient(circle_at_79%_18%,rgba(125,68,232,0.14),transparent_30%),linear-gradient(180deg,#ffffff_0%,#fbfaff_100%)] px-4 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <Link href={localeAppPath("/")} className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary">
              <span aria-hidden="true">&larr;</span>
              {journeyCopy.hero.back}
            </Link>
            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.94fr)_minmax(480px,1.06fr)] lg:items-center">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.15em] text-primary">{journeyCopy.hero.eyebrow}</div>
                <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-[4.25rem]">
                  {journeyCopy.hero.titleBefore}{" "}
                  <span className="text-primary">{journeyCopy.hero.titleHighlight}</span>{" "}
                  {journeyCopy.hero.titleAfter}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{journeyCopy.hero.body}</p>
                <div className="mt-6 grid gap-3 text-sm font-semibold text-foreground sm:grid-cols-3">
                  {journeyCopy.hero.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-2"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary-soft text-xs text-primary">&#10003;</span><span>{benefit}</span></div>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={startJourneyWithPhotos} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(103,48,211,0.22)] transition hover:-translate-y-0.5 hover:bg-primary/90">
                    <span aria-hidden="true" className="mr-2 text-base">+</span>{journeyCopy.hero.start}
                  </button>
                  <span className="max-w-sm text-xs leading-5 text-muted">{journeyCopy.hero.photosHint}</span>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-2xl overflow-visible rounded-[2rem] bg-primary-soft/45 p-3 sm:p-5">
                <NextImage src={localeAssetPath("/images/home/hero-warm-minimalist-20260811.png")} alt={journeyCopy.hero.imageAlt} width={1536} height={1024} priority sizes="(max-width: 1023px) 100vw, 50vw" className="aspect-[1.24] w-full rounded-[1.45rem] object-cover shadow-[0_24px_60px_rgba(61,34,91,0.18)]" />
                <div className="absolute left-0 top-4 max-w-[13rem] rounded-2xl border border-primary/20 bg-white/95 p-4 shadow-[0_16px_34px_rgba(61,34,91,0.16)] sm:-left-7 sm:top-10 sm:max-w-[15rem]">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{styleAnalysis ? journeyCopy.analysis.suggestedStyle : journeyCopy.hero.previewLabel}</div>
                  <div className="mt-1 text-xl font-bold">{styleAnalysis?.primaryStyle || journeyCopy.hero.previewStyle}</div>
                  {styleAnalysis ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${confidenceProgress(styleAnalysis.confidence)}%` }} /></div> : null}
                </div>
                <div className="absolute -bottom-5 right-0 rounded-2xl border border-primary/20 bg-white/95 p-4 shadow-[0_16px_34px_rgba(61,34,91,0.16)] sm:-right-5 sm:bottom-7">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{copy.ui.workspace.readinessTitle}</div>
                  <div className="mt-1 text-3xl font-bold text-primary">{briefReadiness}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="project-compass-journey-flow" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-14 sm:px-6 sm:pt-16">
          <nav aria-label={journeyCopy.hero.eyebrow} className="grid gap-3 rounded-3xl border border-[#e7e0f2] bg-white p-3 shadow-[0_12px_32px_rgba(57,31,92,0.06)] md:grid-cols-3">
            {journeyCopy.rail.map((step) => {
              const active = journeyPhase === step.id;
              return (
                <button key={step.id} type="button" onClick={() => openJourneyPhase(step.id, step.id === "project" ? activeJourneyModule : undefined)} className={[
                  "flex min-h-[5.25rem] items-start gap-3 rounded-2xl p-4 text-left transition",
                  active ? "bg-primary text-white shadow-[0_12px_26px_rgba(103,48,211,0.18)]" : "hover:bg-primary-soft/60",
                ].join(" ")}>
                  <span className={active ? "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-bold" : "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary"}>{step.number}</span>
                  <span><span className="block text-sm font-bold">{step.title}</span><span className={active ? "mt-1 block text-xs leading-5 text-white/75" : "mt-1 block text-xs leading-5 text-muted"}>{step.body}</span></span>
                </button>
              );
            })}
          </nav>

          {journeyPhase === "inspiration" ? (
            <section className="mt-6 grid gap-6 rounded-[2rem] border border-[#e7e0f2] bg-white p-5 shadow-[0_18px_48px_rgba(57,31,92,0.07)] lg:grid-cols-[minmax(0,0.88fr)_minmax(430px,1.12fr)] lg:p-8">
              <div className="flex flex-col">
                <div className="inline-flex w-fit items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">01 · {journeyCopy.rail[0].title}</div>
                <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight">{journeyCopy.inspiration.title}</h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-muted">{journeyCopy.inspiration.body}</p>
                <div className="mt-6 rounded-2xl border border-dashed border-primary/35 bg-primary-soft/35 p-5">
                  <input ref={journeyPhotoInputRef} id="journey-reference-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={referencePhotos.length >= maxReferencePhotos || isPreparingPhotos} onChange={addReferencePhotos} className="sr-only" />
                  <label htmlFor="journey-reference-photos" className={[
                    "flex cursor-pointer flex-col items-center justify-center rounded-xl bg-white px-5 py-7 text-center transition hover:bg-primary hover:text-white",
                    referencePhotos.length >= maxReferencePhotos || isPreparingPhotos ? "pointer-events-none opacity-60" : "",
                  ].join(" ")}>
                    <span className="text-lg font-bold">{isPreparingPhotos ? copy.ui.steps.preparingPhotos : journeyCopy.inspiration.upload}</span>
                    <span className="mt-2 text-sm leading-6 text-muted group-hover:text-white">{journeyCopy.inspiration.uploadHint}</span>
                  </label>
                  <p className="mt-3 text-xs leading-5 text-muted">{journeyCopy.inspiration.selected(referencePhotos.length)}</p>
                </div>
                <p className="mt-5 text-xs leading-5 text-muted">{journeyCopy.inspiration.privacy} <Link href={localeAppPath("/privacy")} className="font-semibold underline">{copy.ui.steps.privacy}</Link>.</p>
              </div>
              <div>
                {referencePhotos.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {referencePhotos.map((photo) => (
                      <figure key={photo.id} className="overflow-hidden rounded-2xl border border-line bg-background">
                        <img src={photo.url} alt={photo.name} className="aspect-square w-full object-cover" />
                        <figcaption className="flex items-center justify-between gap-2 p-2"><span className="min-w-0 truncate text-xs font-semibold">{photo.name}</span><button type="button" onClick={() => removeReferencePhoto(photo.id)} className="shrink-0 text-xs font-bold text-primary hover:underline">{copy.ui.steps.removePhoto}</button></figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div className="grid min-h-[21rem] place-items-center rounded-3xl border border-dashed border-[#dbcdf7] bg-[linear-gradient(135deg,#f4efff,#fff)] p-8 text-center">
                    <div><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-2xl font-bold text-white">AI</div><p className="mt-4 max-w-sm text-sm leading-6 text-muted">{copy.ui.steps.noPhotos}</p></div>
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary-soft/55 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><div className="font-bold text-primary">{copy.ui.steps.aiTitle}</div><p className="mt-1 text-sm leading-6 text-muted">{copy.ui.steps.aiBody}</p></div>
                  <button type="button" onClick={analyzeReferencePhotos} disabled={!referencePhotos.length || isAnalyzing || isPreparingPhotos} className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">{isAnalyzing ? journeyCopy.inspiration.analysing : journeyCopy.inspiration.analyse}</button>
                </div>
                {referencePhotos.length > maxAnalysisPhotos ? <p className="mt-3 text-xs leading-5 text-muted">{copy.ui.steps.manyPhotos(maxAnalysisPhotos)}</p> : null}
                {analysisError ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"><div className="font-semibold">{copy.ui.steps.analysisUnavailable}</div><p className="mt-1">{analysisError}</p></div> : null}
              </div>
            </section>
          ) : null}

          {journeyPhase === "inspiration" && styleAnalysis ? (
            <section ref={analysisResultRef} tabIndex={-1} className="mt-6 scroll-mt-24 rounded-[2rem] border border-primary/20 bg-[#f8f4ff] p-5 outline-none sm:p-8">
              <p role="status" className="mb-4 text-sm font-bold text-primary">{journeyCopy.analysis.ready}</p>
              <div className="flex flex-col gap-4 border-b border-primary/15 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="text-xs font-bold uppercase tracking-[0.13em] text-primary">{journeyCopy.analysis.result}</div><h2 className="mt-2 text-3xl font-bold">{styleAnalysis.primaryStyle}</h2></div><span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary">{journeyCopy.analysis.confidence}: {confidenceLabel(styleAnalysis.confidence)}</span></div>
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{styleAnalysis.summary}</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-line bg-white p-4"><div className="text-xs font-bold uppercase tracking-[0.11em] text-muted">{journeyCopy.analysis.palette}</div><div className="mt-3"><PaletteLegend colors={styleAnalysis.colorPalette} /></div></div>
                <div className="rounded-2xl border border-line bg-white p-4"><div className="text-xs font-bold uppercase tracking-[0.11em] text-muted">{journeyCopy.analysis.materials}</div><div className="mt-3 flex flex-wrap gap-1.5">{styleAnalysis.materials.slice(0, 5).map((item) => <span key={item} className="rounded-full bg-[#f5efe7] px-2.5 py-1 text-xs font-semibold">{item}</span>)}</div></div>
                <div className="rounded-2xl border border-line bg-white p-4"><div className="text-xs font-bold uppercase tracking-[0.11em] text-muted">{journeyCopy.analysis.cues}</div><div className="mt-3 flex flex-wrap gap-1.5">{styleAnalysis.styleClues.slice(0, 4).map((item) => <span key={item} className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{item}</span>)}</div></div>
                <div className="rounded-2xl border border-line bg-white p-4"><div className="text-xs font-bold uppercase tracking-[0.11em] text-muted">{journeyCopy.analysis.designerPrompt}</div><p className="mt-3 text-sm leading-6 text-muted">{styleAnalysis.designerPrompt}</p></div>
              </div>
              <details className="mt-5 rounded-2xl border border-line bg-white p-4"><summary className="cursor-pointer text-sm font-bold text-primary">{journeyCopy.inspiration.refine}</summary><div className="mt-5"><MultiOptionGrid label={copy.ui.steps.style} onChange={(values) => { setStyle(values.join(" | ")); markModule("preferences"); }} options={styles} values={selectedStyles} /></div></details>
              <details className="mt-4 rounded-2xl border border-line bg-white p-4"><summary className="cursor-pointer text-sm font-bold text-primary">{copy.ui.share.title}</summary><div className="mt-5"><ShareableStyleResult analysis={styleAnalysis} photos={referencePhotos} /></div></details>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-muted">{copy.ui.steps.aiTransparencyNotice} <Link href={localeAppPath("/ai-transparency")} className="font-semibold text-primary underline">{journeyCopy.inspiration.transparency}</Link>.</p><button type="button" onClick={() => openJourneyPhase("project", "details")} className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90">{journeyCopy.inspiration.continue}</button></div>
            </section>
          ) : null}

          {journeyPhase === "project" ? (
            <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[2rem] border border-[#e7e0f2] bg-white p-5 shadow-[0_18px_48px_rgba(57,31,92,0.07)] sm:p-8">
                <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs font-bold uppercase tracking-[0.13em] text-primary">02 · {journeyCopy.rail[1].title}</div><h2 className="mt-2 text-3xl font-bold">{journeyCopy.project.title}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{journeyCopy.project.body}</p></div><span className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary">{briefReadiness}%</span></div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {([
                    { id: "details" as const, label: journeyCopy.project.details },
                    { id: "preferences" as const, label: journeyCopy.project.preferences },
                    { id: "scope" as const, label: journeyCopy.project.scope },
                    { id: "budget" as const, label: journeyCopy.project.budget },
                  ]).map((item) => <button key={item.id} type="button" onClick={() => setActiveModule(item.id)} className={activeJourneyModule === item.id ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-white" : "rounded-full border border-line bg-background px-4 py-2 text-sm font-bold text-muted transition hover:border-primary hover:text-primary"}>{item.label}</button>)}
                </div>
                <div className="mt-7">
                  {activeJourneyModule === "details" ? (
                    <div className="grid gap-7">
                      <OptionGrid label={copy.ui.steps.projectType} onChange={(value) => { setProjectType(value); markModule("details"); }} options={projectTypes} value={projectType} />
                      <section>
                        <h3 className="text-base font-bold">{copy.ui.steps.space}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted">{copy.ui.steps.spaceBody}</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <label className="text-sm font-semibold">{copy.ui.steps.area}<input type="number" min="1" max="2000" inputMode="decimal" aria-invalid={areaM2IsInvalid || undefined} value={areaM2} onChange={(event) => { setAreaM2(event.target.value); markModule("details"); }} placeholder={copy.ui.steps.areaPlaceholder} className={areaM2IsInvalid ? "mt-2 w-full rounded-xl border border-red-400 bg-background px-4 py-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2" : "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"} /></label>
                          <label className="text-sm font-semibold">{copy.ui.steps.roomsCount}<input type="number" min="1" max="50" inputMode="numeric" aria-invalid={roomCountIsInvalid || undefined} value={roomCount} onChange={(event) => { setRoomCount(event.target.value); markModule("details"); }} placeholder={copy.ui.steps.roomsCountPlaceholder} className={roomCountIsInvalid ? "mt-2 w-full rounded-xl border border-red-400 bg-background px-4 py-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2" : "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"} /></label>
                        </div>
                        <div className="mt-4"><div className="text-sm font-semibold">{copy.ui.steps.roomsIncluded}</div><div className="mt-3 flex flex-wrap gap-2">{roomTypes.map((room) => { const selected = selectedRoomTypes.includes(room); return <button key={room} type="button" aria-pressed={selected} onClick={() => { toggleRoomType(room); markModule("details"); }} className={selected ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white" : "rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"}>{roomTypeLabels[room] || room}</button>; })}</div></div>
                      </section>
                      <OptionGrid label={copy.ui.steps.propertyStatus} onChange={(value) => { setPropertyStatus(value); markModule("details"); }} options={propertyStatuses} value={propertyStatus} />
                      <ProjectLocationSelect label={copy.ui.location} options={projectCompassLocationList} placeholder="Choose a city" value={location} invalid={locationIsInvalid} onChange={(value) => { setLocation(value); markModule("details"); }} />
                    </div>
                  ) : null}
                  {activeJourneyModule === "details" && projectDetailsValidationMessage ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{projectDetailsValidationMessage}</p> : null}
                  {activeJourneyModule === "preferences" ? <div className="grid gap-7">{styleAnalysis ? <div className="rounded-2xl border border-primary/20 bg-primary-soft/50 p-4 text-sm leading-6 text-muted"><span className="font-bold text-primary">AI</span> {styleAnalysis.primaryStyle}. {copy.ui.workspace.preferences.body}</div> : null}<MultiOptionGrid label={copy.ui.steps.style} onChange={(values) => { setStyle(values.join(" | ")); markModule("preferences"); }} options={styles} values={selectedStyles} /><section><h3 className="text-base font-bold">{copy.ui.steps.visualCues}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{visualCues.map((cue) => { const selected = selectedVisualCues.includes(cue.value); return <button key={cue.value} type="button" aria-pressed={selected} onClick={() => { toggleVisualCue(cue.value); markModule("preferences"); }} className={selected ? "rounded-2xl border border-primary bg-primary-soft p-4 text-left" : "rounded-2xl border border-line bg-background p-4 text-left hover:border-primary"}><span className="block text-sm font-bold">{cue.label}</span><span className="mt-1 block text-sm leading-6 text-muted">{cue.description}</span></button>; })}</div></section><label className="block text-sm font-semibold">{copy.ui.notes}<textarea value={notes} onChange={(event) => { setNotes(event.target.value); markModule("preferences"); }} placeholder={copy.ui.notesPlaceholder} rows={4} className="mt-2 w-full resize-y rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" /></label></div> : null}
                  {activeJourneyModule === "scope" ? <div className="grid gap-7"><OptionGrid label={copy.ui.steps.goal} onChange={(value) => { setGoal(value); markModule("scope"); }} options={goals} value={goal} /><OptionGrid label={copy.ui.steps.scope} onChange={(value) => { setScope(value); markModule("scope"); }} options={scopes} value={scope} /><OptionGrid label={copy.ui.steps.visualization} onChange={(value) => { setVisualizationNeed(value); markModule("scope"); }} options={visualizationNeeds} value={visualizationNeed} /><OptionGrid label={copy.ui.steps.supervision} onChange={(value) => { setSupervisionNeed(value); markModule("scope"); }} options={supervisionNeeds} value={supervisionNeed} /></div> : null}
                  {activeJourneyModule === "budget" ? <div className="grid gap-7"><OptionGrid label={copy.ui.steps.budget} onChange={(value) => { setBudget(value); markModule("budget"); }} options={budgets} value={budget} /><OptionGrid label={copy.ui.steps.timeline} onChange={(value) => { setTimeline(value); markModule("budget"); }} options={timelines} value={timeline} /></div> : null}
                </div>
                <div className="mt-8 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xl text-sm leading-6 text-muted">{journeyCopy.project.summary}</p><button type="button" onClick={() => openJourneyPhase("matches")} className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90">{journeyCopy.project.continue}</button></div>
              </div>
              <aside className="h-fit rounded-[2rem] border border-primary/20 bg-[#f8f4ff] p-5 lg:sticky lg:top-24"><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{journeyCopy.matches.briefLabel}</div><h2 className="mt-2 text-xl font-bold">{styleAnalysis?.primaryStyle || styleLabels(style) || copy.ui.notProvided}</h2></div><span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">AI</span></div><div className="mt-5 grid gap-3 text-sm"><div className="rounded-xl border border-line bg-white p-3"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.workspace.projectLabel}</div><div className="mt-1 font-semibold">{workspaceProjectSummary}</div></div><div className="rounded-xl border border-line bg-white p-3"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.brief.support}</div><div className="mt-1 font-semibold">{workspaceScopeSummary}</div></div><div className="rounded-xl border border-line bg-white p-3"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.brief.budget}</div><div className="mt-1 font-semibold">{workspaceBudgetSummary}</div></div></div><div className="mt-5"><div className="flex items-center justify-between text-sm font-bold"><span>{copy.ui.workspace.readinessTitle}</span><span className="text-primary">{briefReadiness}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${briefReadiness}%` }} /></div></div></aside>
            </section>
          ) : null}

          {journeyPhase === "matches" ? (
            <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(430px,1.1fr)]">
              <div className="rounded-[2rem] border border-[#e7e0f2] bg-white p-5 shadow-[0_18px_48px_rgba(57,31,92,0.07)] sm:p-8">
                <div className="text-xs font-bold uppercase tracking-[0.13em] text-primary">03 · {journeyCopy.rail[2].title}</div>
                <h2 className="mt-3 text-3xl font-bold">{journeyCopy.matches.title}</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{journeyCopy.matches.body}</p>
                <div className={isReadyForMatching ? "mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900" : "mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"}>
                  {isReadyForMatching ? journeyCopy.matches.ready : journeyCopy.matches.incomplete}
                </div>
                {isDesigner ? <div className="mt-5 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-sm leading-6 text-muted">{journeyCopy.matches.designerNotice}</div> : null}
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {!isReadyForMatching ? <button type="button" onClick={() => openJourneyPhase("project", recommendedModule === "inspirations" ? "details" : recommendedModule)} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90">{journeyCopy.matches.backToProject}</button> : null}
                  {isReadyForMatching ? <Link href={designerHref} onClick={persistProjectCompassDraft} className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-primary/90">{journeyCopy.matches.view}</Link> : null}
                  {isReadyForMatching && !isDesigner ? <button type="button" onClick={() => saveBrief(true)} disabled={isSaving} className="rounded-xl border border-primary bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white disabled:opacity-60">{isSaving ? journeyCopy.matches.saving : isAuthenticated ? journeyCopy.matches.find : journeyCopy.matches.findWithAccount}</button> : null}
                  {hasMeaningfulBrief && !isReadyForMatching && !isDesigner ? <button type="button" onClick={() => saveBrief(false)} disabled={isSaving} className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-bold transition hover:border-primary hover:text-primary disabled:opacity-60">{isSaving ? journeyCopy.matches.saving : isAuthenticated ? journeyCopy.matches.save : journeyCopy.matches.findWithAccount}</button> : null}
                  {hasMeaningfulBrief ? <button type="button" onClick={copyBrief} className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-bold transition hover:border-primary hover:text-primary">{copied ? journeyCopy.matches.copied : journeyCopy.matches.copy}</button> : null}
                </div>
                {isReadyForMatching && !isDesigner && !isAuthenticated ? <p className="mt-4 text-sm leading-6 text-muted">{copy.ui.saveAccountHint}</p> : null}
                {savedBriefId ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><div className="font-semibold">{copy.ui.brief.savedTitle}</div><p className="mt-1">{copy.ui.brief.savedBody(savedReferenceCount ?? 0)}</p><Link href={localeAppPath("/client/briefs")} className="mt-2 inline-flex font-semibold underline">{copy.ui.brief.openSavedBriefs}</Link></div> : null}
                {saveError ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"><div className="font-semibold">{copy.ui.brief.saveFailed}</div><p className="mt-1">{saveError}</p></div> : null}
              </div>
              <aside className="rounded-[2rem] border border-primary/20 bg-[#f8f4ff] p-5 sm:p-7"><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{journeyCopy.matches.briefLabel}</div><h2 className="mt-2 text-2xl font-bold">{styleAnalysis?.primaryStyle || manualStyleLabel || journeyCopy.matches.noStyle}</h2></div><span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">AI</span></div>{styleAnalysis ? <><p className="mt-4 text-sm leading-6 text-muted">{styleAnalysis.summary}</p><div className="mt-5 rounded-2xl border border-line bg-white p-4"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{journeyCopy.analysis.palette}</div><div className="mt-3"><PaletteLegend colors={styleAnalysis.colorPalette} /></div></div><div className="mt-3 rounded-2xl border border-line bg-white p-4"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{journeyCopy.analysis.materials}</div><div className="mt-3 flex flex-wrap gap-1.5">{styleAnalysis.materials.slice(0, 5).map((item) => <span key={item} className="rounded-full bg-[#f5efe7] px-2.5 py-1 text-xs font-semibold">{item}</span>)}</div></div></> : <p className="mt-4 text-sm leading-6 text-muted">{manualStyleLabel ? journeyCopy.matches.manualStyle : journeyCopy.matches.noStyle}</p>}<div className="mt-5 grid gap-3 border-t border-primary/15 pt-5 text-sm"><div className="flex justify-between gap-4"><span className="text-muted">{copy.ui.workspace.projectLabel}</span><span className="max-w-[60%] text-right font-semibold">{workspaceProjectSummary}</span></div><div className="flex justify-between gap-4"><span className="text-muted">{copy.ui.brief.support}</span><span className="max-w-[60%] text-right font-semibold">{workspaceScopeSummary}</span></div><div className="flex justify-between gap-4"><span className="text-muted">{copy.ui.brief.budget}</span><span className="max-w-[60%] text-right font-semibold">{workspaceBudgetSummary}</span></div><div className="flex justify-between gap-4"><span className="text-muted">{copy.ui.brief.timeline}</span><span className="max-w-[60%] text-right font-semibold">{workspaceTimelineSummary}</span></div></div></aside>
            </section>
          ) : null}
        </section>
      </main>
    );
  }

  const workspaceLayoutEnabled = true;

  if (workspaceLayoutEnabled) {
    return (
      <main className="bg-[#fbfaff] pb-12 text-foreground">
        <section className="border-b border-[#ece6f7] bg-[radial-gradient(circle_at_78%_20%,rgba(125,68,232,0.13),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fbfaff_100%)] px-4 py-9 sm:px-6 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(460px,1.08fr)] lg:items-center">
            <div>
              <Link href={localeAppPath("/")} className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary">
                <span aria-hidden="true">&larr;</span>
                {copy.ui.workspace.back}
              </Link>
              <div className="mt-8 text-xs font-bold tracking-[0.16em] text-primary">{copy.ui.workspace.eyebrow}</div>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-[3.1rem] lg:text-[4.25rem]">
                {copy.ui.workspace.titleBefore}{" "}
                <span className="text-primary">{copy.ui.workspace.titleHighlight}</span>{" "}
                {copy.ui.workspace.titleAfter}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {copy.ui.workspace.body}
              </p>
              <ul className="mt-7 grid gap-3 text-sm font-semibold text-foreground sm:grid-cols-3">
                {copy.ui.workspace.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary-soft text-xs text-primary">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto h-[390px] w-full max-w-[620px] sm:h-[470px]">
              <div className="absolute inset-x-6 top-3 h-[calc(100%-22px)] overflow-hidden rounded-[32px] border border-white bg-[#eee8df] shadow-[0_28px_65px_rgba(57,31,92,0.16)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={workspacePhotos[0]} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#21172c]/35 via-transparent to-transparent" />
              </div>
              {workspacePhotos.slice(1, 4).map((src, index) => (
                <div
                  key={src}
                  className={[
                    "absolute overflow-hidden rounded-2xl border-4 border-white bg-card shadow-[0_16px_32px_rgba(57,31,92,0.18)]",
                    index === 0 ? "right-0 top-9 h-24 w-24 sm:h-28 sm:w-28" : "",
                    index === 1 ? "left-0 top-[48%] h-20 w-20 sm:h-24 sm:w-24" : "",
                    index === 2 ? "left-5 bottom-0 h-20 w-20 sm:left-10 sm:h-24 sm:w-24" : "",
                  ].join(" ")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              <div className="absolute left-6 top-7 rounded-2xl border border-primary/20 bg-white/95 p-4 shadow-[0_16px_32px_rgba(57,31,92,0.13)] backdrop-blur sm:left-0 sm:top-14 sm:p-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{copy.ui.steps.aiTitle}</div>
                <div className="mt-1 text-sm font-bold">
                  {styleAnalysis ? styleAnalysis.primaryStyle : copy.ui.workspace.progressTitle}
                </div>
                {styleAnalysis?.colorPalette.length ? (
                  <div className="mt-3" aria-label={styleAnalysis.colorPalette.join(", ")}><PaletteLegend colors={styleAnalysis.colorPalette} compact /></div>
                ) : (
                  <div className="mt-3 h-1.5 w-24 overflow-hidden rounded-full bg-primary-soft"><span className="block h-full w-2/3 rounded-full bg-primary" /></div>
                )}
              </div>
              <div className="absolute bottom-7 right-0 rounded-2xl border border-primary/20 bg-white/95 p-4 shadow-[0_18px_36px_rgba(57,31,92,0.14)] backdrop-blur sm:p-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{copy.ui.workspace.readinessTitle}</div>
                <div className="mt-1 text-3xl font-bold text-primary">{briefReadiness}%</div>
                <div className="mt-1 text-xs font-semibold text-muted">{briefStatus}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-7 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-3xl border border-[#e9e1f5] bg-white p-5 shadow-[0_14px_34px_rgba(57,31,92,0.06)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-[185px]">
                <div className="text-sm font-bold text-foreground">{copy.ui.workspace.progressTitle}</div>
                <div className="mt-1 text-sm text-muted">{copy.ui.workspace.progressBody}</div>
              </div>
              <div className="min-w-[160px]">
                <div className="flex items-baseline justify-between gap-3 text-sm font-semibold"><span>{copy.ui.workspace.progressLabel}</span><span className="text-primary">{briefReadiness}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-soft"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${briefReadiness}%` }} /></div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {workspaceModules.map((module, index) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => openModule(module.id)}
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                      module.complete ? "border-emerald-200 bg-emerald-50 text-emerald-800" : activeModule === module.id ? "border-primary bg-primary-soft text-primary" : "border-line bg-background text-muted hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] shadow-sm">{module.complete ? "✓" : index + 1}</span>
                    {copy.ui.workspace.journey[index]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-7 px-4 pb-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{copy.ui.workspace.cardsTitle}</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{copy.ui.workspace.cardsBody}</p>
              </div>
              <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{briefStatus}</span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {workspaceModules.map((module) => {
                const isLeadModule = module.id === "inspirations";

                return (
                  <button
                    key={module.id}
                    type="button"
                    aria-expanded={activeModule === module.id}
                    onClick={() => openModule(module.id)}
                    className={[
                      "group relative min-h-[220px] overflow-hidden rounded-3xl border bg-white p-5 text-left shadow-[0_12px_28px_rgba(57,31,92,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(57,31,92,0.10)]",
                      isLeadModule ? "sm:col-span-2 sm:min-h-[290px] sm:p-6" : "",
                      activeModule === module.id ? "border-primary bg-primary-soft/45 shadow-[0_12px_28px_rgba(103,48,211,0.12)]" : "border-[#e8e1f1] hover:border-primary/50",
                    ].join(" ")}
                  >
                    <div className={isLeadModule ? "sm:max-w-[52%]" : ""}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl bg-primary text-xs font-bold text-white">{workspaceModuleMarks[module.id]}</span>
                        <span className={module.complete ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800" : "rounded-full bg-background px-3 py-1 text-xs font-bold text-muted"}>
                          {module.complete
                            ? copy.ui.workspace.complete
                            : module.touched
                            ? copy.ui.workspace.inProgress
                            : copy.ui.workspace.statusEmpty}
                        </span>
                      </div>
                      <h3 className="mt-7 text-xl font-bold">{module.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{module.body}</p>
                      <div className="mt-5 border-t border-line pt-4 text-sm font-semibold text-primary">{module.preview}</div>
                    </div>
                    {!isLeadModule ? <span className="absolute bottom-5 right-5 text-xl text-primary transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span> : null}
                    {isLeadModule ? (
                      <div className="mt-5 grid h-[190px] grid-cols-2 grid-rows-[1.15fr_1fr] gap-2 sm:absolute sm:inset-y-6 sm:right-6 sm:mt-0 sm:h-auto sm:w-[41%] sm:max-w-[360px]">
                        {workspacePhotos.slice(0, 3).map((src, index) => (
                          <span key={src} className={index === 0 ? "col-span-2 min-h-0 overflow-hidden rounded-xl bg-primary-soft" : "min-h-0 overflow-hidden rounded-xl bg-primary-soft"}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {activeModule ? (
              <section id="project-compass-editor" className="mt-5 scroll-mt-24 rounded-3xl border border-primary/25 bg-white p-5 shadow-[0_18px_44px_rgba(57,31,92,0.09)] sm:p-7">
                <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-bold tracking-[0.14em] text-primary">{workspaceModuleMarks[activeModule]} · {copy.ui.workspace.journey[workspaceModules.findIndex((module) => module.id === activeModule)]}</div>
                    <h2 className="mt-2 text-2xl font-bold">{workspaceModules.find((module) => module.id === activeModule)?.title}</h2>
                  </div>
                  <button type="button" onClick={() => setActiveModule(null)} className="w-fit rounded-xl border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary">
                    {copy.ui.workspace.close}
                  </button>
                </div>

                {activeModule === "inspirations" ? (
                  <div className="mt-6 grid gap-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm leading-6 text-muted">{copy.ui.steps.photosBody}</p>
                      </div>
                      <span className="rounded-full bg-background px-3 py-1 text-sm font-bold text-muted">{referencePhotos.length}/{maxReferencePhotos}</span>
                    </div>
                    <label className={["mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/35 bg-primary-soft/40 px-4 py-10 text-center transition hover:border-primary", referencePhotos.length >= maxReferencePhotos || isPreparingPhotos ? "pointer-events-none opacity-60" : ""].join(" ")}>
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={referencePhotos.length >= maxReferencePhotos || isPreparingPhotos} onChange={addReferencePhotos} className="sr-only" />
                      <span className="text-base font-bold">{isPreparingPhotos ? copy.ui.steps.preparingPhotos : referencePhotos.length >= maxReferencePhotos ? copy.ui.steps.photoLimitReached : copy.ui.steps.addPhotos}</span>
                      <span className="mt-2 text-sm text-muted">{copy.ui.steps.photoTypes}</span>
                    </label>
                    {referencePhotos.length ? (
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {referencePhotos.map((photo) => (
                          <div key={photo.id} className="overflow-hidden rounded-2xl border border-line bg-background">
                            <div className="aspect-[4/3] overflow-hidden bg-primary-soft">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="grid gap-2 p-3"><div className="truncate text-xs font-semibold">{photo.name}</div><button type="button" onClick={() => removeReferencePhoto(photo.id)} className="rounded-lg border border-line bg-card px-3 py-2 text-xs font-semibold text-muted hover:border-primary hover:text-primary">{copy.ui.steps.removePhoto}</button></div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="mt-5 rounded-2xl border border-line bg-background p-4 text-sm leading-6 text-muted">{copy.ui.steps.noPhotos}</p>}
                    <div className="rounded-2xl border border-primary/25 bg-primary-soft/55 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div><div className="flex items-center gap-2"><span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white">AI</span><h3 className="font-bold text-primary">{copy.ui.steps.aiTitle}</h3></div><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{copy.ui.steps.aiBody}</p></div>
                        <button type="button" onClick={analyzeReferencePhotos} disabled={!referencePhotos.length || isAnalyzing || isPreparingPhotos} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{isAnalyzing ? copy.ui.steps.analyzing : copy.ui.steps.analyze}</button>
                      </div>
                      <p className="mt-4 rounded-xl border border-primary/15 bg-white/70 px-3 py-2 text-xs leading-5 text-muted">{copy.ui.steps.aiTransparencyNotice} <Link href={localeAppPath("/ai-transparency")} className="font-semibold text-primary underline">{copy.ui.steps.aiTransparencyLink}</Link>.</p>
                    </div>
                    {referencePhotos.length > maxAnalysisPhotos ? <p className="mt-3 text-xs leading-5 text-muted">{copy.ui.steps.manyPhotos(maxAnalysisPhotos)}</p> : null}
                    {styleAnalysis ? (
                      <div className="grid gap-4 rounded-2xl border border-primary/20 bg-[#fbfaff] p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{copy.ui.steps.suggestedStyle}</div><div className="mt-1 text-2xl font-bold">{styleAnalysis.primaryStyle}</div></div><span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">{copy.ui.steps.confidencePrefix} {confidenceLabel(styleAnalysis.confidence)}</span></div>
                        <p className="text-sm leading-6 text-muted">{styleAnalysis.summary}</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-line bg-white p-4 text-sm"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.steps.closestDirection}</div><div className="mt-2 font-semibold">{optionLabel(styles, styleAnalysis.styleDirection)}</div></div>
                          <div className="rounded-xl border border-line bg-white p-4 text-sm"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.steps.colors}</div><div className="mt-3"><PaletteLegend colors={styleAnalysis.colorPalette} /></div></div>
                          <div className="rounded-xl border border-line bg-white p-4 text-sm"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.steps.materials}</div><div className="mt-3 flex flex-wrap gap-2">{styleAnalysis.materials.length ? styleAnalysis.materials.map((material) => <span key={material} className="rounded-full bg-[#f5efe7] px-2.5 py-1 text-xs font-semibold">{material}</span>) : <span className="font-semibold text-muted">{copy.ui.steps.tooLittleData}</span>}</div></div>
                          <div className="rounded-xl border border-line bg-white p-4 text-sm"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.steps.styleClues}</div><div className="mt-3 flex flex-wrap gap-2">{styleAnalysis.styleClues.length ? styleAnalysis.styleClues.map((clue) => <span key={clue} className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{clue}</span>) : <span className="font-semibold text-muted">{copy.ui.steps.tooLittleData}</span>}</div></div>
                        </div>
                        <div className="rounded-xl border border-line bg-white p-4 text-sm leading-6"><div className="font-semibold">{copy.ui.steps.describeNeeds}</div><p className="mt-1 text-muted">{styleAnalysis.designerPrompt}</p></div>
                        {styleAnalysis.watchOuts.length ? <div><div className="text-sm font-semibold">{copy.ui.steps.watchOuts}</div><ul className="mt-2 grid gap-1 text-sm leading-6 text-muted">{styleAnalysis.watchOuts.map((item) => <li key={item}>- {item}</li>)}</ul></div> : null}
                        <ShareableStyleResult analysis={styleAnalysis} photos={referencePhotos} />
                      </div>
                    ) : null}
                    {analysisError ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"><div className="font-semibold">{copy.ui.steps.analysisUnavailable}</div><p className="mt-1">{analysisError}</p></div> : null}
                    <p className="text-xs leading-5 text-muted">{copy.ui.steps.aiPrivacyBefore} {maxAnalysisPhotos} {copy.ui.steps.aiPrivacyAfter} <Link href={localeAppPath("/privacy")} className="font-semibold underline">{copy.ui.steps.privacy}</Link>.</p>
                  </div>
                ) : null}

                {activeModule === "details" ? (
                  <div className="mt-6 grid gap-7">
                    <OptionGrid label={copy.ui.steps.projectType} onChange={(value) => { setProjectType(value); markModule("details"); }} options={projectTypes} value={projectType} />
                    <section><h3 className="text-base font-bold">{copy.ui.steps.space}</h3><p className="mt-1 text-sm leading-6 text-muted">{copy.ui.steps.spaceBody}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">{copy.ui.steps.area}<input type="number" min="1" max="2000" inputMode="decimal" aria-invalid={areaM2IsInvalid || undefined} value={areaM2} onChange={(event) => { setAreaM2(event.target.value); markModule("details"); }} placeholder={copy.ui.steps.areaPlaceholder} className={areaM2IsInvalid ? "mt-2 w-full rounded-xl border border-red-400 bg-background px-4 py-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2" : "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"} /></label><label className="text-sm font-semibold">{copy.ui.steps.roomsCount}<input type="number" min="1" max="50" inputMode="numeric" aria-invalid={roomCountIsInvalid || undefined} value={roomCount} onChange={(event) => { setRoomCount(event.target.value); markModule("details"); }} placeholder={copy.ui.steps.roomsCountPlaceholder} className={roomCountIsInvalid ? "mt-2 w-full rounded-xl border border-red-400 bg-background px-4 py-3 font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2" : "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"} /></label></div>{projectDetailsValidationMessage ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{projectDetailsValidationMessage}</p> : null}<div className="mt-4"><div className="text-sm font-semibold">{copy.ui.steps.roomsIncluded}</div><div className="mt-3 flex flex-wrap gap-2">{roomTypes.map((room) => { const selected = selectedRoomTypes.includes(room); return <button key={room} type="button" aria-pressed={selected} onClick={() => { toggleRoomType(room); markModule("details"); }} className={selected ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white" : "rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"}>{roomTypeLabels[room] || room}</button>; })}</div></div></section>
                    <OptionGrid label={copy.ui.steps.propertyStatus} onChange={(value) => { setPropertyStatus(value); markModule("details"); }} options={propertyStatuses} value={propertyStatus} />
                    <ProjectLocationSelect label={copy.ui.location} options={projectCompassLocationList} placeholder="Choose a city" value={location} invalid={locationIsInvalid} onChange={(value) => { setLocation(value); markModule("details"); }} />
                  </div>
                ) : null}

                {activeModule === "scope" ? (
                  <div className="mt-6 grid gap-7"><OptionGrid label={copy.ui.steps.goal} onChange={(value) => { setGoal(value); markModule("scope"); }} options={goals} value={goal} /><OptionGrid label={copy.ui.steps.scope} onChange={(value) => { setScope(value); markModule("scope"); }} options={scopes} value={scope} /><OptionGrid label={copy.ui.steps.visualization} onChange={(value) => { setVisualizationNeed(value); markModule("scope"); }} options={visualizationNeeds} value={visualizationNeed} /><OptionGrid label={copy.ui.steps.supervision} onChange={(value) => { setSupervisionNeed(value); markModule("scope"); }} options={supervisionNeeds} value={supervisionNeed} /></div>
                ) : null}

                {activeModule === "budget" ? (
                  <div className="mt-6 grid gap-7"><OptionGrid label={copy.ui.steps.budget} onChange={(value) => { setBudget(value); markModule("budget"); }} options={budgets} value={budget} /><OptionGrid label={copy.ui.steps.timeline} onChange={(value) => { setTimeline(value); markModule("budget"); }} options={timelines} value={timeline} /></div>
                ) : null}

                {activeModule === "preferences" ? (
                  <div className="mt-6 grid gap-7">
                    {styleAnalysis ? <div className="rounded-2xl border border-primary/20 bg-primary-soft/55 p-4 text-sm leading-6 text-muted"><span className="font-bold text-primary">AI</span> {styleAnalysis.primaryStyle}. {copy.ui.workspace.preferences.body}</div> : null}
                    <MultiOptionGrid label={copy.ui.steps.style} onChange={(values) => { setStyle(values.join(" | ")); markModule("preferences"); }} options={styles} values={selectedStyles} />
                    <section><h3 className="text-base font-bold">{copy.ui.steps.visualCues}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{visualCues.map((cue) => { const selected = selectedVisualCues.includes(cue.value); return <button key={cue.value} type="button" aria-pressed={selected} onClick={() => { toggleVisualCue(cue.value); markModule("preferences"); }} className={selected ? "rounded-2xl border border-primary bg-primary-soft p-4 text-left" : "rounded-2xl border border-line bg-background p-4 text-left hover:border-primary"}><span className="block text-sm font-bold">{cue.label}</span><span className="mt-1 block text-sm leading-6 text-muted">{cue.description}</span></button>; })}</div></section>
                    <label className="block text-sm font-semibold">{copy.ui.notes}<textarea value={notes} onChange={(event) => { setNotes(event.target.value); markModule("preferences"); }} placeholder={copy.ui.notesPlaceholder} rows={4} className="mt-2 w-full resize-y rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" /></label>
                  </div>
                ) : null}
              </section>
            ) : null}

            {showFullBrief ? <section className="mt-5 rounded-3xl border border-line bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">{copy.ui.workspace.fullBriefTitle}</h2><button type="button" onClick={() => setShowFullBrief(false)} className="text-sm font-semibold text-primary hover:underline">{copy.ui.workspace.hideFullBrief}</button></div><pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#21172c] p-4 text-xs leading-6 text-white/80">{briefText}</pre></section> : null}
          </div>

          <aside className="h-fit rounded-3xl border border-primary/20 bg-white p-5 shadow-[0_18px_44px_rgba(57,31,92,0.10)] lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-4"><div><div className="text-sm font-bold text-primary">{copy.ui.workspace.summaryTitle}</div><h2 className="mt-1 text-xl font-bold">{styleAnalysis?.primaryStyle || (hasPreferences ? styleLabels(style) : copy.ui.notProvided)}</h2></div><span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">AI</span></div>
            <p className="mt-3 text-sm leading-6 text-muted">{styleAnalysis?.summary || (manualStyleLabel ? copy.ui.workspace.manualStyleBody : copy.ui.workspace.summaryBody)}</p>
            {styleAnalysis?.colorPalette.length ? <div className="mt-4 rounded-2xl border border-line bg-background p-4"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.steps.colors}</div><div className="mt-3"><PaletteLegend colors={styleAnalysis.colorPalette} /></div></div> : null}
            <div className="mt-5 grid gap-3 border-y border-line py-5 text-sm">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-xl border border-line bg-background p-3"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.steps.materials}</div><div className="mt-2 flex flex-wrap gap-1.5">{styleAnalysis?.materials.length ? styleAnalysis.materials.slice(0, 5).map((material) => <span key={material} className="rounded-full bg-[#f5efe7] px-2 py-1 text-xs font-semibold">{material}</span>) : <span className="font-semibold text-muted">{copy.ui.notProvided}</span>}</div></div>
                <div className="rounded-xl border border-line bg-background p-3"><div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.ui.workspace.moodLabel}</div><div className="mt-2 flex flex-wrap gap-1.5">{styleAnalysis?.styleClues.length ? styleAnalysis.styleClues.slice(0, 4).map((clue) => <span key={clue} className="rounded-full bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">{clue}</span>) : selectedVisualCues.length ? selectedVisualCues.slice(0, 3).map((item) => <span key={item} className="rounded-full bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">{optionLabel(visualCues, item)}</span>) : <span className="font-semibold text-muted">{copy.ui.notProvided}</span>}</div></div>
              </div>
              {[[copy.ui.workspace.projectLabel, workspaceProjectSummary], [copy.ui.brief.support, workspaceScopeSummary], [copy.ui.brief.budget, workspaceBudgetSummary], [copy.ui.brief.timeline, workspaceTimelineSummary]].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4"><span className="text-muted">{label}</span><span className="max-w-[55%] text-right font-semibold">{value}</span></div>)}
            </div>
            <div className="mt-5 rounded-2xl bg-primary-soft p-4"><div className="flex items-center justify-between gap-3 text-sm font-bold"><span>{copy.ui.workspace.readinessTitle}</span><span className="text-primary">{briefReadiness}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${briefReadiness}%` }} /></div><p className="mt-3 text-xs leading-5 text-muted">{copy.ui.workspace.readinessBody}</p></div>
            <div className="mt-5 grid gap-3">
              {isDesigner ? <div className="rounded-xl border border-primary/25 bg-primary-soft p-3 text-sm leading-6 text-muted">{copy.ui.designerOnly}</div> : null}
              {isReadyForMatching ? <><div><div className="text-sm font-bold">{copy.ui.workspace.matchingReadyTitle}</div><p className="mt-1 text-sm leading-6 text-muted">{copy.ui.workspace.matchingReadyBody}</p></div><Link href={designerHref} onClick={persistProjectCompassDraft} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white hover:opacity-90">{copy.ui.viewMatches}</Link>{!isDesigner ? <><button type="button" onClick={() => saveBrief(true)} disabled={isSaving} className="rounded-xl border border-primary bg-white px-4 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-white disabled:opacity-60">{isSaving ? copy.ui.saving : isAuthenticated ? copy.ui.saveAndFind : journeyCopy.matches.findWithAccount}</button>{!isAuthenticated ? <p className="text-xs leading-5 text-muted">{copy.ui.saveAccountHint}</p> : null}</> : null}</> : <><div><div className="text-sm font-bold">{copy.ui.workspace.continueTitle}</div><p className="mt-1 text-sm leading-6 text-muted">{copy.ui.workspace.continueBody}</p></div><button type="button" onClick={() => openModule(recommendedModule)} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:opacity-90">{copy.ui.workspace.continue}</button>{!isDesigner && hasMeaningfulBrief ? <button type="button" onClick={() => saveBrief(false)} disabled={isSaving} className="rounded-xl border border-primary bg-white px-4 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-white disabled:opacity-60">{isSaving ? copy.ui.saving : isAuthenticated ? copy.ui.workspace.saveAndReturn : journeyCopy.matches.findWithAccount}</button> : null}</>}
              {!isReadyForMatching ? <button type="button" onClick={() => openModule(recommendedModule)} className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-bold hover:border-primary hover:text-primary">{copy.ui.workspace.continue}</button> : null}
              <button type="button" onClick={() => setShowFullBrief((current) => !current)} className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-bold hover:border-primary hover:text-primary">{showFullBrief ? copy.ui.workspace.hideFullBrief : copy.ui.workspace.showFullBrief}</button>
              <button type="button" onClick={copyBrief} className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-bold hover:border-primary hover:text-primary">{copied ? copy.ui.briefCopied : copy.ui.copyBrief}</button>
            </div>
            {savedBriefId ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><div className="font-semibold">{copy.ui.brief.savedTitle}</div><p className="mt-1">{copy.ui.brief.savedBody(savedReferenceCount ?? 0)}</p><Link href={localeAppPath("/client/briefs")} className="mt-2 inline-flex font-semibold underline">{copy.ui.brief.openSavedBriefs}</Link></div> : null}
            {saveError ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"><div className="font-semibold">{copy.ui.brief.saveFailed}</div><p className="mt-1">{saveError}</p></div> : null}
          </aside>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6"><div className="grid gap-4 rounded-3xl border border-[#e7e0f2] bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"><div><div className="text-sm font-bold text-primary">{copy.ui.workspace.supportTitle}</div><p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{copy.ui.workspace.supportBody}</p></div><Link href={localeAppPath("/ai-transparency")} className="w-fit rounded-xl border border-primary bg-primary-soft px-4 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-white">{copy.ui.steps.aiTransparencyLink}</Link></div></section>
      </main>
    );
  }

  return (
    <main className="bg-background pb-24 lg:pb-0">
      <section className="border-b border-primary/20 bg-[#2a1836] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#4fd8c7] px-3 py-1 text-xs font-bold text-[#173d39]">
              {copy.ui.hero.eyebrow}
            </div>
            <h1 className="mt-2 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
              {copy.ui.hero.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/72">
              {copy.ui.hero.body}
            </p>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-sm">
            <div className="text-sm font-semibold text-[#64dfd0]">{copy.ui.hero.insightTitle}</div>
            <p className="mt-2 text-sm leading-6 text-white/70">
              {copy.ui.hero.insightBody}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid gap-7 rounded-lg border border-line bg-card p-5 shadow-[0_18px_50px_rgba(54,31,73,0.08)] sm:p-6">
          <OptionGrid
            label={copy.ui.steps.projectType}
            onChange={setProjectType}
            options={projectTypes}
            value={projectType}
          />

          <section>
            <h2 className="text-base font-bold">{copy.ui.steps.space}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              {copy.ui.steps.spaceBody}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                {copy.ui.steps.area}
                <input
                  type="number"
                  min="1"
                  max="2000"
                  inputMode="decimal"
                  value={areaM2}
                  onChange={(event) => setAreaM2(event.target.value)}
                  placeholder={copy.ui.steps.areaPlaceholder}
                  className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
                />
              </label>
              <label className="block text-sm font-semibold">
                {copy.ui.steps.roomsCount}
                <input
                  type="number"
                  min="1"
                  max="50"
                  inputMode="numeric"
                  value={roomCount}
                  onChange={(event) => setRoomCount(event.target.value)}
                  placeholder={copy.ui.steps.roomsCountPlaceholder}
                  className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
                />
              </label>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold">{copy.ui.steps.roomsIncluded}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {roomTypes.map((room) => {
                  const isSelected = selectedRoomTypes.includes(room);
                  return (
                    <button
                      key={room}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleRoomType(room)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-semibold transition",
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-line bg-background text-muted hover:border-primary hover:text-primary",
                      ].join(" ")}
                    >
                      {roomTypeLabels[room] || room}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <OptionGrid
            label={copy.ui.steps.propertyStatus}
            onChange={setPropertyStatus}
            options={propertyStatuses}
            value={propertyStatus}
          />

          <OptionGrid
            label={copy.ui.steps.goal}
            onChange={setGoal}
            options={goals}
            value={goal}
          />

          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold">{copy.ui.steps.photos}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {copy.ui.steps.photosBody}
                </p>
              </div>
              <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold text-muted">
                {referencePhotos.length}/{maxReferencePhotos}
              </span>
            </div>

            <label
              className={[
                "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-background px-4 py-8 text-center transition hover:border-primary",
                referencePhotos.length >= maxReferencePhotos || isPreparingPhotos
                  ? "pointer-events-none opacity-60"
                  : "",
              ].join(" ")}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={referencePhotos.length >= maxReferencePhotos || isPreparingPhotos}
                onChange={addReferencePhotos}
                className="sr-only"
              />
              <span className="text-sm font-bold">
                {isPreparingPhotos
                  ? copy.ui.steps.preparingPhotos
                  : referencePhotos.length >= maxReferencePhotos
                  ? copy.ui.steps.photoLimitReached
                  : copy.ui.steps.addPhotos}
              </span>
              <span className="mt-1 text-sm text-muted">
                {copy.ui.steps.photoTypes}
              </span>
            </label>

            {referencePhotos.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {referencePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group overflow-hidden rounded-2xl border border-line bg-background"
                  >
                    <div className="aspect-square overflow-hidden bg-primary-soft">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="grid gap-2 p-3">
                      <div className="truncate text-xs font-semibold">{photo.name}</div>
                      <button
                        type="button"
                        onClick={() => removeReferencePhoto(photo.id)}
                        className="rounded-lg border border-line bg-card px-3 py-2 text-xs font-semibold text-muted hover:border-primary hover:text-primary"
                      >
                        {copy.ui.steps.removePhoto}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-line bg-background p-4 text-sm leading-6 text-muted">
                {copy.ui.steps.noPhotos}
              </div>
            )}

            <div className="mt-4 rounded-lg border-2 border-primary/25 bg-primary-soft p-4 shadow-[0_12px_30px_rgba(104,40,200,0.10)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white">AI</span>
                    <h3 className="text-sm font-bold text-primary">{copy.ui.steps.aiTitle}</h3>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {copy.ui.steps.aiBody}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={analyzeReferencePhotos}
                  disabled={!referencePhotos.length || isAnalyzing || isPreparingPhotos}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAnalyzing ? copy.ui.steps.analyzing : copy.ui.steps.analyze}
                </button>
              </div>

              <p className="mt-3 text-xs leading-5 text-muted">
                {copy.ui.steps.aiPrivacyBefore} {maxAnalysisPhotos} {copy.ui.steps.aiPrivacyAfter} {" "}
                <Link href={localeAppPath("/privacy")} className="underline">{copy.ui.steps.privacy}</Link>.
              </p>

              <p className="mt-2 rounded-lg border border-primary/15 bg-card/70 px-3 py-2 text-xs leading-5 text-muted">
                {copy.ui.steps.aiTransparencyNotice} {" "}
                <Link href={localeAppPath("/ai-transparency")} className="font-semibold text-primary underline">
                  {copy.ui.steps.aiTransparencyLink}
                </Link>.
              </p>

              {referencePhotos.length > maxAnalysisPhotos ? (
                <p className="mt-3 text-xs leading-5 text-muted">
                  {copy.ui.steps.manyPhotos(maxAnalysisPhotos)}
                </p>
              ) : null}

              {styleAnalysis ? (
                <div className="mt-4 grid gap-4 rounded-2xl border border-primary/20 bg-primary-soft p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        {copy.ui.steps.suggestedStyle}
                      </div>
                      <div className="mt-1 text-2xl font-bold">
                        {styleAnalysis.primaryStyle}
                      </div>
                    </div>
                    <span className="w-fit rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary">
                      {copy.ui.steps.confidencePrefix} {confidenceLabel(styleAnalysis.confidence)}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-muted">{styleAnalysis.summary}</p>

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    {[
                      [copy.ui.steps.closestDirection, optionLabel(styles, styleAnalysis.styleDirection)],
                      [
                        copy.ui.steps.colors,
                        styleAnalysis.colorPalette.length
                          ? styleAnalysis.colorPalette.join(", ")
                          : copy.ui.steps.tooLittleData,
                      ],
                      [
                        copy.ui.steps.materials,
                        styleAnalysis.materials.length
                          ? styleAnalysis.materials.join(", ")
                          : copy.ui.steps.tooLittleData,
                      ],
                      [
                        copy.ui.steps.styleClues,
                        styleAnalysis.styleClues.length
                          ? styleAnalysis.styleClues.join(", ")
                          : copy.ui.steps.tooLittleData,
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-line bg-card p-3">
                        <div className="text-muted">{label}</div>
                        <div className="mt-1 font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-line bg-card p-3 text-sm leading-6">
                    <div className="font-semibold">{copy.ui.steps.describeNeeds}</div>
                    <p className="mt-1 text-muted">{styleAnalysis.designerPrompt}</p>
                  </div>

                  {styleAnalysis.watchOuts.length ? (
                    <div>
                      <div className="text-sm font-semibold">{copy.ui.steps.watchOuts}</div>
                      <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted">
                        {styleAnalysis.watchOuts.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <ShareableStyleResult analysis={styleAnalysis} photos={referencePhotos} />
                </div>
              ) : null}

              {analysisError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  <div className="font-semibold">{copy.ui.steps.analysisUnavailable}</div>
                  <p className="mt-1">{analysisError}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-bold">{copy.ui.steps.visualCues}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {visualCues.map((cue) => {
                  const isSelected = selectedVisualCues.includes(cue.value);

                  return (
                    <button
                      key={cue.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleVisualCue(cue.value)}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        isSelected
                          ? "border-primary bg-primary-soft"
                          : "border-line bg-background hover:border-primary",
                      ].join(" ")}
                    >
                      <span className="block text-sm font-bold">{cue.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-muted">
                        {cue.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <MultiOptionGrid
            label={copy.ui.steps.style}
            onChange={(values) => setStyle(values.length ? values.join(" | ") : "Not sure yet")}
            options={styles}
            values={selectedStyles}
          />

          <OptionGrid
            label={copy.ui.steps.scope}
            onChange={setScope}
            options={scopes}
            value={scope}
          />

          <OptionGrid
            label={copy.ui.steps.budget}
            onChange={setBudget}
            options={budgets}
            value={budget}
          />

          <OptionGrid
            label={copy.ui.steps.timeline}
            onChange={setTimeline}
            options={timelines}
            value={timeline}
          />

          <OptionGrid
            label={copy.ui.steps.visualization}
            onChange={setVisualizationNeed}
            options={visualizationNeeds}
            value={visualizationNeed}
          />

          <OptionGrid
            label={copy.ui.steps.supervision}
            onChange={setSupervisionNeed}
            options={supervisionNeeds}
            value={supervisionNeed}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <ProjectLocationSelect
              label={copy.ui.location}
              options={projectCompassLocationList}
              placeholder="Choose a city"
              value={location}
              invalid={locationIsInvalid}
              onChange={setLocation}
            />

            <label className="block text-sm font-semibold">
              {copy.ui.notes}
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={copy.ui.notesPlaceholder}
                className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
            <div className="text-sm font-semibold text-primary">{copy.ui.ready}</div>
            <p className="mt-1 text-sm leading-6 text-muted">
              {copy.ui.readyBody}
            </p>
            {isDesigner ? (
              <div className="mt-4 rounded-xl border border-primary/30 bg-card p-3 text-sm leading-6 text-muted">
                {copy.ui.designerOnly}
              </div>
            ) : null}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => saveBrief(true)}
                disabled={isSaving || isDesigner}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? copy.ui.saving : copy.ui.saveAndFind}
              </button>
              <Link
                href={designerHref}
                className="rounded-xl border border-line bg-card px-5 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                {copy.ui.viewMatches}
              </Link>
              <button
                type="button"
                onClick={copyBrief}
                className="rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                {copied ? copy.ui.briefCopied : copy.ui.copyBrief}
              </button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">{copy.ui.brief.title}</div>
          <h2 className="mt-2 text-2xl font-bold">{optionLabel(projectTypes, projectType)} · {location || copy.ui.notProvided}</h2>

          <div className="mt-5 grid gap-3 text-sm">
            {[
              [copy.ui.brief.goal, optionLabel(goals, goal)],
              [copy.ui.brief.area, areaM2 ? `${areaM2} m²` : copy.ui.notProvided],
              [copy.ui.brief.rooms, roomCount || selectedRoomTypes.slice(0, 2).map((item) => roomTypeLabels[item] || item).join(", ") || copy.ui.notProvided],
              [copy.ui.brief.property, optionLabel(propertyStatuses, propertyStatus)],
              [copy.ui.brief.style, styleLabels(style)],
              [
                copy.ui.brief.photos,
                referencePhotos.length
                  ? `${referencePhotos.length}/${maxReferencePhotos}`
                  : copy.ui.none,
              ],
              [
                copy.ui.brief.visualCues,
                selectedVisualCues.length
                  ? selectedVisualCues.slice(0, 2).map((item) => optionLabel(visualCues, item)).join(", ")
                  : copy.ui.notSelected,
              ],
              [copy.ui.brief.support, optionLabel(scopes, scope)],
              [copy.ui.brief.budget, optionLabel(budgets, budget)],
              [copy.ui.brief.timeline, optionLabel(timelines, timeline)],
              [copy.ui.brief.visualization, optionLabel(visualizationNeeds, visualizationNeed)],
              [copy.ui.brief.supervision, optionLabel(supervisionNeeds, supervisionNeed)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-b-0 last:pb-0"
              >
                <span className="text-muted">{label}</span>
                <span className="text-right font-semibold">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-background p-4">
            <div className="text-sm font-semibold">{copy.ui.brief.nextStep}</div>
            <p className="mt-2 text-sm leading-6 text-muted">{nextStep}</p>
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-background p-4">
            <div className="text-sm font-semibold">{copy.ui.brief.designerTip}</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              {styleAnalysis
                ? styleAnalysis.designerPrompt
                : copy.ui.brief.designerTipBody(visualCueLabel, selectedScope.label)}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {isDesigner ? (
              <div className="rounded-xl border border-primary/30 bg-primary-soft p-4 text-sm leading-6 text-foreground">
                <div className="font-semibold text-primary">{copy.ui.brief.designerNoticeTitle}</div>
                <p className="mt-1 text-muted">
                  {copy.ui.brief.designerNoticeBody}
                </p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => saveBrief(true)}
              disabled={isSaving || isDesigner}
              className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? copy.ui.saving : copy.ui.saveAndFind}
            </button>
            <button
              type="button"
              onClick={() => saveBrief(false)}
              disabled={isSaving || isDesigner}
              className="rounded-xl border border-primary bg-primary-soft px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? copy.ui.saving : copy.ui.brief.saveForLater}
            </button>
            <Link
              href={designerHref}
              className="rounded-xl border border-line bg-background px-5 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
            >
              {copy.ui.viewMatches}
            </Link>
            <button
              type="button"
              onClick={copyBrief}
              className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              {copied ? copy.ui.briefCopied : copy.ui.copyBrief}
            </button>
          </div>

          {savedBriefId ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <div className="font-semibold">{copy.ui.brief.savedTitle}</div>
              <p className="mt-1">
                {copy.ui.brief.savedBody(savedReferenceCount ?? 0)}
              </p>
              <Link href={localeAppPath("/client/briefs")} className="mt-3 inline-flex font-semibold underline">
                {copy.ui.brief.openSavedBriefs}
              </Link>
            </div>
          ) : null}

          {saveError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              <div className="font-semibold">{copy.ui.brief.saveFailed}</div>
              <p className="mt-1">{saveError}</p>
            </div>
          ) : null}

          <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-[#1f172a] p-4 text-xs leading-6 text-white/78">
            {briefText}
          </pre>
        </aside>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card/96 p-3 shadow-[0_-12px_30px_rgba(54,31,73,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-3">
          {isDesigner ? (
            <Link href={designerHref} className="flex-1 rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white">
              {copy.ui.brief.mobileMatches}
            </Link>
          ) : (
            <button type="button" onClick={() => saveBrief(true)} disabled={isSaving} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
              {isSaving ? copy.ui.brief.mobileSaving : copy.ui.brief.mobileSaveAndFind}
            </button>
          )}
          <button type="button" onClick={copyBrief} className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-bold">
            {copied ? copy.ui.brief.mobileCopied : copy.ui.brief.mobileCopy}
          </button>
        </div>
      </div>
    </main>
  );
}

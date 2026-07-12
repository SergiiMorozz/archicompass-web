"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import ShareableStyleResult from "@/components/ShareableStyleResult";
import { polishCountLabel } from "@/lib/count-label";
import { copyText } from "@/lib/copy-text";

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

const maxReferencePhotos = 10;
const maxAnalysisPhotos = 6;
const projectCompassDraftKey = "archicompass-project-compass-draft";

const projectTypes: Option[] = [
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

const goals: Option[] = [
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

const styles: Option[] = [
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

const scopes: Option[] = [
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

const budgets: Option[] = [
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

const timelines: Option[] = [
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

const propertyStatuses: Option[] = [
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

const visualizationNeeds: Option[] = [
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

const supervisionNeeds: Option[] = [
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

const roomTypeLabels: Record<string, string> = {
  "Living room": "Salon",
  Kitchen: "Kuchnia",
  Bedroom: "Sypialnia",
  Bathroom: "Łazienka",
  "Home office": "Gabinet domowy",
  "Children's room": "Pokój dziecięcy",
  "Hall / storage": "Hol / przechowywanie",
  Other: "Inne",
};

const visualCues: Option[] = [
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

function selectedOption(options: Option[], value: string) {
  return options.find((option) => option.value === value) ?? options[0];
}

function optionLabel(options: Option[], value: string) {
  return options.find((option) => option.value === value)?.label || value;
}

function styleLabels(value: string) {
  return value
    .split(" | ")
    .filter(Boolean)
    .map((item) => optionLabel(styles, item))
    .join(" / ");
}

function confidenceLabel(confidence: StyleAnalysis["confidence"]) {
  return confidence === "high" ? "wysoka" : confidence === "medium" ? "średnia" : "niska";
}

function styleValues(value: string) {
  const values = value.split(" | ").filter(Boolean);
  return values.length ? values : ["Not sure yet"];
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
                "rounded-2xl border p-4 text-left transition",
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
  return (
    <section>
      <h2 className="text-base font-bold">{label}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        Wybierz jeden lub kilka kierunków, maksymalnie cztery. Łączenie stylów jest
        naturalne i pomaga w lepszym dopasowaniu projektanta.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
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
                "rounded-2xl border p-4 text-left transition",
                selected ? "border-primary bg-primary-soft" : "border-line bg-background hover:border-primary",
              ].join(" ")}
            >
              <span className="block text-sm font-bold">{option.label}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function ProjectCompass({ isDesigner = false }: { isDesigner?: boolean }) {
  const [projectType, setProjectType] = useState(projectTypes[0].value);
  const [goal, setGoal] = useState(goals[1].value);
  const [style, setStyle] = useState(styles[0].value);
  const [scope, setScope] = useState(scopes[1].value);
  const [budget, setBudget] = useState(budgets[1].value);
  const [timeline, setTimeline] = useState(timelines[1].value);
  const [areaM2, setAreaM2] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [propertyStatus, setPropertyStatus] = useState(propertyStatuses[0].value);
  const [visualizationNeed, setVisualizationNeed] = useState(visualizationNeeds[3].value);
  const [supervisionNeed, setSupervisionNeed] = useState(supervisionNeeds[0].value);
  const [location, setLocation] = useState("Warszawa");
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
  const objectUrls = useRef<string[]>([]);

  const selectedStyles = styleValues(style);
  const selectedStyle = selectedOption(styles, selectedStyles[0]);
  const selectedScope = selectedOption(scopes, scope);
  const selectedCueOptions = useMemo(
    () => visualCues.filter((cue) => selectedVisualCues.includes(cue.value)),
    [selectedVisualCues]
  );
  const visualSearchSpecialty =
    styleAnalysis?.searchSpecialty ||
    selectedCueOptions.find((cue) => cue.specialty)?.specialty ||
    styles.find((option) => selectedStyles.includes(option.value) && option.specialty)?.specialty ||
    selectedStyle.specialty;
  const visualCueLabel = selectedVisualCues.length
    ? selectedVisualCues.slice(0, 3).map((item) => optionLabel(visualCues, item)).join(", ")
    : selectedStyle.label;

  const designerParams = new URLSearchParams({
    match: "brief",
    sort: "recommended",
    view: "list",
    projectType,
    goal,
    style: styleAnalysis?.styleDirection || style,
    support: scope,
    budget,
    timeline,
    propertyStatus,
    visualization: visualizationNeed,
    supervision: supervisionNeed,
  });

  if (areaM2) designerParams.set("area", areaM2);
  if (roomCount) designerParams.set("roomCount", roomCount);
  if (selectedRoomTypes.length) designerParams.set("rooms", selectedRoomTypes.join(","));
  if (location.trim()) designerParams.set("location", location.trim());
  if (visualSearchSpecialty) designerParams.set("specialty", visualSearchSpecialty);
  if (selectedVisualCues.length) designerParams.set("cues", selectedVisualCues.slice(0, 5).join(","));
  if (savedBriefId) designerParams.set("brief", savedBriefId);

  const designerHref = `/designers?${designerParams.toString()}`;

  const briefText = useMemo(
    () =>
      [
        `Rodzaj inwestycji: ${optionLabel(projectTypes, projectType)}`,
        `Główny cel: ${optionLabel(goals, goal)}`,
        `Powierzchnia: ${areaM2 ? `${areaM2} m²` : "nie podano"}`,
        `Liczba pomieszczeń: ${roomCount || "nie podano"}`,
        selectedRoomTypes.length ? `Pomieszczenia: ${selectedRoomTypes.map((item) => roomTypeLabels[item] || item).join(", ")}` : null,
        `Status nieruchomości: ${optionLabel(propertyStatuses, propertyStatus)}`,
        `Kierunek stylistyczny: ${styleLabels(style)}`,
        referencePhotos.length
          ? `Zdjęcia referencyjne: przesłano ${referencePhotos.length} (${referencePhotos
              .map((photo) => photo.name)
              .slice(0, 5)
              .join(", ")}${referencePhotos.length > 5 ? ", ..." : ""})`
          : "Zdjęcia referencyjne: jeszcze nie dodano",
        styleAnalysis
          ? [
              `Analiza stylu AI: ${styleAnalysis.primaryStyle} (pewność: ${confidenceLabel(styleAnalysis.confidence)})`,
              `Podsumowanie AI: ${styleAnalysis.summary}`,
              styleAnalysis.colorPalette.length
                ? `Paleta kolorów AI: ${styleAnalysis.colorPalette.join(", ")}`
                : null,
              styleAnalysis.materials.length
                ? `Materiały AI: ${styleAnalysis.materials.join(", ")}`
                : null,
              styleAnalysis.designerPrompt
                ? `Wskazówki do wyboru projektanta: ${styleAnalysis.designerPrompt}`
                : null,
            ]
              .filter(Boolean)
              .join("\n")
          : null,
        selectedVisualCues.length
          ? `Cechy wizualne: ${selectedVisualCues.map((item) => optionLabel(visualCues, item)).join(", ")}`
          : null,
        `Potrzebny zakres wsparcia: ${optionLabel(scopes, scope)}`,
        `Całkowity budżet inwestycji: ${optionLabel(budgets, budget)}`,
        `Planowany termin: ${optionLabel(timelines, timeline)}`,
        `Wizualizacje 3D: ${optionLabel(visualizationNeeds, visualizationNeed)}`,
        `Nadzór: ${optionLabel(supervisionNeeds, supervisionNeed)}`,
        `Lokalizacja: ${location.trim() || "nie podano"}`,
        notes.trim() ? `Dodatkowe informacje: ${notes.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    [
      budget,
      areaM2,
      goal,
      location,
      notes,
      projectType,
      propertyStatus,
      referencePhotos,
      roomCount,
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

  const nextStep = useMemo(() => {
    if (scope === "Consultation") {
      return "Umów jedną konkretną konsultację i wykorzystaj brief, aby od początku rozmawiać o realnych potrzebach.";
    }

    if (scope === "End-to-end support") {
      return "Wybierz 2-3 projektantów z rozbudowanym portfolio i zapytaj o proces, dostępność oraz wsparcie podczas realizacji.";
    }

    if (goal === "Clarify direction") {
      return "Zacznij od projektu koncepcyjnego, zanim zamówisz dokumentację lub podejmiesz decyzje remontowe.";
    }

    return "Porównaj projektantów na podstawie podobnych realizacji, a następnie wyślij ten brief jako pierwszą wiadomość.";
  }, [goal, scope]);

  async function copyBrief() {
    try {
      await copyText(briefText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Nie udało się skopiować briefu.");
    }
  }

  function addReferencePhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (!files.length) return;

    setReferencePhotos((current) => {
      const remainingSlots = Math.max(0, maxReferencePhotos - current.length);
      const nextPhotos = files.slice(0, remainingSlots).map((file) => {
        const url = URL.createObjectURL(file);
        objectUrls.current.push(url);

        return {
          file,
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          name: file.name,
          url,
        };
      });

      return [...current, ...nextPhotos];
    });

    setStyleAnalysis(null);
    setAnalysisError(null);
    event.currentTarget.value = "";
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
  }

  async function analyzeReferencePhotos() {
    if (!referencePhotos.length) {
      setAnalysisError("Dodaj co najmniej jedno zdjęcie referencyjne przed uruchomieniem analizy AI.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const formData = new FormData();
    formData.set("project_type", optionLabel(projectTypes, projectType));
    formData.set("style_direction", styleLabels(primaryStyleValue(style)));
    formData.set(
      "visual_cues",
      selectedVisualCues.length
        ? selectedVisualCues.map((item) => optionLabel(visualCues, item)).join(", ")
        : "Brak wybranych cech"
    );

    referencePhotos.slice(0, maxAnalysisPhotos).forEach((photo) => {
      formData.append("reference_photos", photo.file, photo.name);
    });

    try {
      const response = await fetch("/api/style-analysis", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        analysis?: StyleAnalysis;
        code?: string;
        error?: string;
      };

      if (!response.ok || !payload.analysis) {
        throw new Error(payload.error ?? "Nie udało się przeprowadzić analizy stylu AI.");
      }

      setStyleAnalysis(payload.analysis);
      if (styles.some((option) => option.value === payload.analysis?.styleDirection)) {
        setStyle((current) => mergeStyleValue(current, payload.analysis!.styleDirection));
      }

      setSelectedVisualCues((current) =>
        Array.from(new Set([...current, ...payload.analysis!.visualCues]))
      );
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Nie udało się przeprowadzić analizy stylu AI."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function saveBrief(openMatches = false) {
    if (openMatches && savedBriefId && savedBriefSignature === briefText) {
      const matchesUrl = new URL(designerHref, window.location.origin);
      matchesUrl.searchParams.set("brief", savedBriefId);
      window.location.href = `${matchesUrl.pathname}?${matchesUrl.searchParams.toString()}`;
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSavedBriefId(null);
    setSavedReferenceCount(null);

    const formData = new FormData();
    formData.set("project_type", projectType);
    formData.set("goal", goal);
    formData.set("style_direction", style);
    formData.set("support_scope", scope);
    formData.set("budget_signal", budget);
    formData.set("timeline", timeline);
    formData.set("area_m2", areaM2);
    formData.set("room_count", roomCount);
    formData.set("room_types", JSON.stringify(selectedRoomTypes));
    formData.set("property_status", propertyStatus);
    formData.set("visualization_need", visualizationNeed);
    formData.set("supervision_need", supervisionNeed);
    formData.set("location", location);
    formData.set("notes", notes);
    formData.set("visual_cues", JSON.stringify(selectedVisualCues));
    formData.set("brief_text", briefText);
    formData.set("designer_search_href", designerHref);

    referencePhotos.forEach((photo) => {
      formData.append("reference_photos", photo.file, photo.name);
    });

    try {
      const response = await fetch("/api/project-briefs", {
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
        window.sessionStorage.setItem(
          projectCompassDraftKey,
          JSON.stringify({
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
          })
        );
        window.location.href =
          payload.code === "ONBOARDING_REQUIRED"
            ? "/onboarding?intent=client&next=%2Fproject-compass"
            : "/login?next=%2Fproject-compass";
        return;
      }

      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "Nie udało się zapisać briefu.");
      }

      setSavedBriefId(payload.id);
      setSavedBriefSignature(briefText);
      setSavedReferenceCount(payload.referencePhotoCount ?? 0);
      window.sessionStorage.removeItem(projectCompassDraftKey);

      if (openMatches) {
        const matchesUrl = new URL(designerHref, window.location.origin);
        matchesUrl.searchParams.set("brief", payload.id);
        window.location.href = `${matchesUrl.pathname}?${matchesUrl.searchParams.toString()}`;
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Nie udało się zapisać briefu.");
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

  useEffect(() => {
    const rawDraft = window.sessionStorage.getItem(projectCompassDraftKey);
    if (rawDraft) {
      try {
        const draft = JSON.parse(rawDraft) as Partial<{
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
        }>;
        if (draft.projectType) setProjectType(draft.projectType);
        if (draft.goal) setGoal(draft.goal);
        if (draft.style) setStyle(draft.style);
        if (draft.scope) setScope(draft.scope);
        if (draft.budget) setBudget(draft.budget);
        if (draft.timeline) setTimeline(draft.timeline);
        if (typeof draft.areaM2 === "string") setAreaM2(draft.areaM2);
        if (typeof draft.roomCount === "string") setRoomCount(draft.roomCount);
        if (Array.isArray(draft.selectedRoomTypes)) setSelectedRoomTypes(draft.selectedRoomTypes);
        if (draft.propertyStatus) setPropertyStatus(draft.propertyStatus);
        if (draft.visualizationNeed) setVisualizationNeed(draft.visualizationNeed);
        if (draft.supervisionNeed) setSupervisionNeed(draft.supervisionNeed);
        if (typeof draft.location === "string") setLocation(draft.location);
        if (typeof draft.notes === "string") setNotes(draft.notes);
        if (Array.isArray(draft.selectedVisualCues)) {
          setSelectedVisualCues(draft.selectedVisualCues);
        }
      } catch {
        // Ignore an invalid browser draft and continue with the default brief.
      }
      window.sessionStorage.removeItem(projectCompassDraftKey);
    }

    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current = [];
    };
  }, []);

  return (
    <main className="bg-background pb-24 lg:pb-0">
      <section className="border-b border-primary/20 bg-[#2a1836] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#4fd8c7] px-3 py-1 text-xs font-bold text-[#173d39]">
              AI Project Compass
            </div>
            <h1 className="mt-2 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
              Zamień niejasny pomysł w konkretny brief projektowy
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/72">
              Styl ma znaczenie, ale trafne dopasowanie zależy także od zakresu,
              budżetu, rodzaju wnętrza, zdjęć referencyjnych, terminu i potrzebnego wsparcia.
            </p>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-sm">
            <div className="text-sm font-semibold text-[#64dfd0]">Dlaczego to działa lepiej</div>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Zamiast zgadywać nazwę stylu ArchiCompass porządkuje informacje, których
              projektant potrzebuje, aby ocenić, czy inwestycja pasuje do jego specjalizacji.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid gap-7 rounded-lg border border-line bg-card p-5 shadow-[0_18px_50px_rgba(54,31,73,0.08)] sm:p-6">
          <OptionGrid
            label="1. Co planujesz?"
            onChange={setProjectType}
            options={projectTypes}
            value={projectType}
          />

          <section>
            <h2 className="text-base font-bold">2. Opowiedz o przestrzeni</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Wystarczą dane orientacyjne. Pomogą projektantom oszacować zakres pracy
              jeszcze przed pierwszą rozmową.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Powierzchnia, m²
                <input
                  type="number"
                  min="1"
                  max="5000"
                  inputMode="decimal"
                  value={areaM2}
                  onChange={(event) => setAreaM2(event.target.value)}
                  placeholder="np. 72"
                  className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
                />
              </label>
              <label className="block text-sm font-semibold">
                Liczba pomieszczeń
                <input
                  type="number"
                  min="1"
                  max="50"
                  inputMode="numeric"
                  value={roomCount}
                  onChange={(event) => setRoomCount(event.target.value)}
                  placeholder="np. 3"
                  className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
                />
              </label>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold">Pomieszczenia objęte projektem</div>
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
            label="3. Jaki jest status nieruchomości?"
            onChange={setPropertyStatus}
            options={propertyStatuses}
            value={propertyStatus}
          />

          <OptionGrid
            label="4. Czego potrzebujesz najbardziej?"
            onChange={setGoal}
            options={goals}
            value={goal}
          />

          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold">5. Dodaj zdjęcia referencyjne</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Dodaj 4-10 zdjęć wnętrz, detali lub nastrojów, które Ci się podobają.
                  Podgląd pozostaje w tej przeglądarce do chwili uruchomienia analizy lub
                  zapisania briefu. Zapisane pliki trafiają do prywatnego briefu.
                </p>
              </div>
              <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold text-muted">
                {referencePhotos.length}/{maxReferencePhotos}
              </span>
            </div>

            <label
              className={[
                "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-background px-4 py-8 text-center transition hover:border-primary",
                referencePhotos.length >= maxReferencePhotos
                  ? "pointer-events-none opacity-60"
                  : "",
              ].join(" ")}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={referencePhotos.length >= maxReferencePhotos}
                onChange={addReferencePhotos}
                className="sr-only"
              />
              <span className="text-sm font-bold">
                {referencePhotos.length >= maxReferencePhotos
                  ? "Osiągnięto limit zdjęć"
                  : "Dodaj zdjęcia referencyjne"}
              </span>
              <span className="mt-1 text-sm text-muted">
                JPEG, PNG lub WebP. Dodaj kilka zdjęć, aby łatwiej rozpoznać wspólne cechy.
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
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-line bg-background p-4 text-sm leading-6 text-muted">
                Nie dodano jeszcze zdjęć. Zacznij od obrazów, które najlepiej oddają
                oczekiwany nastrój, materiał, światło lub detal.
              </div>
            )}

            <div className="mt-4 rounded-lg border-2 border-primary/25 bg-primary-soft p-4 shadow-[0_12px_30px_rgba(104,40,200,0.10)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white">AI</span>
                    <h3 className="text-sm font-bold text-primary">Analiza stylu ze zdjęć</h3>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    ArchiCompass przeanalizuje zdjęcia i zaproponuje nazwę stylu, materiały,
                    kolory oraz wskazówki pomocne przy wyborze projektanta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={analyzeReferencePhotos}
                  disabled={!referencePhotos.length || isAnalyzing}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAnalyzing ? "Analizowanie..." : "Analizuj zdjęcia"}
                </button>
              </div>

              <p className="mt-3 text-xs leading-5 text-muted">
                Uruchomienie analizy wysyła maksymalnie {maxAnalysisPhotos} zdjęć do dostawcy
                usługi AI. Nie przesyłaj zdjęć osób, adresów ani informacji poufnych.
                Szczegóły znajdziesz w <Link href="/privacy" className="underline">Polityce prywatności</Link>.
              </p>

              {referencePhotos.length > maxAnalysisPhotos ? (
                <p className="mt-3 text-xs leading-5 text-muted">
                  Analiza AI wykorzysta pierwsze {maxAnalysisPhotos} zdjęć, aby wynik był
                  szybki i precyzyjny. Wszystkie zdjęcia nadal można zapisać w briefie.
                </p>
              ) : null}

              {styleAnalysis ? (
                <div className="mt-4 grid gap-4 rounded-2xl border border-primary/20 bg-primary-soft p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        Sugerowany styl
                      </div>
                      <div className="mt-1 text-2xl font-bold">
                        {styleAnalysis.primaryStyle}
                      </div>
                    </div>
                    <span className="w-fit rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary">
                      pewność: {confidenceLabel(styleAnalysis.confidence)}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-muted">{styleAnalysis.summary}</p>

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    {[
                      ["Najbliższy kierunek", optionLabel(styles, styleAnalysis.styleDirection)],
                      [
                        "Kolory",
                        styleAnalysis.colorPalette.length
                          ? styleAnalysis.colorPalette.join(", ")
                          : "Za mało danych",
                      ],
                      [
                        "Materiały",
                        styleAnalysis.materials.length
                          ? styleAnalysis.materials.join(", ")
                          : "Za mało danych",
                      ],
                      [
                        "Cechy stylu",
                        styleAnalysis.styleClues.length
                          ? styleAnalysis.styleClues.join(", ")
                          : "Za mało danych",
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-line bg-card p-3">
                        <div className="text-muted">{label}</div>
                        <div className="mt-1 font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-line bg-card p-3 text-sm leading-6">
                    <div className="font-semibold">Jak opisać potrzeby projektantowi</div>
                    <p className="mt-1 text-muted">{styleAnalysis.designerPrompt}</p>
                  </div>

                  {styleAnalysis.watchOuts.length ? (
                    <div>
                      <div className="text-sm font-semibold">Na co uważać</div>
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
                  <div className="font-semibold">Analiza AI jest niedostępna</div>
                  <p className="mt-1">{analysisError}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-bold">Co łączy te zdjęcia?</h3>
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
            label="6. Które kierunki są Ci najbliższe?"
            onChange={(values) => setStyle(values.length ? values.join(" | ") : "Not sure yet")}
            options={styles}
            values={selectedStyles}
          />

          <OptionGrid
            label="7. Jakiego zakresu pomocy potrzebujesz?"
            onChange={setScope}
            options={scopes}
            value={scope}
          />

          <OptionGrid
            label="8. Całkowity budżet inwestycji (projektant + materiały + wykonanie)"
            onChange={setBudget}
            options={budgets}
            value={budget}
          />

          <OptionGrid
            label="9. Kiedy chcesz rozpocząć?"
            onChange={setTimeline}
            options={timelines}
            value={timeline}
          />

          <OptionGrid
            label="10. Czy potrzebujesz wizualizacji 3D?"
            onChange={setVisualizationNeed}
            options={visualizationNeeds}
            value={visualizationNeed}
          />

          <OptionGrid
            label="11. Jakiego nadzoru potrzebujesz?"
            onChange={setSupervisionNeed}
            options={supervisionNeeds}
            value={supervisionNeed}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">
              Lokalizacja
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Warszawa, Kraków, Gdańsk..."
                className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
              />
            </label>

            <label className="block text-sm font-semibold">
              Dodatkowe informacje
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Dzieci, wynajem, termin, wykonawca..."
                className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
            <div className="text-sm font-semibold text-primary">Gotowe?</div>
            <p className="mt-1 text-sm leading-6 text-muted">
              Możesz zapisać brief, od razu przejść do dopasowanych projektantów albo
              skopiować tekst i wysłać go poza platformą.
            </p>
            {isDesigner ? (
              <div className="mt-4 rounded-xl border border-primary/30 bg-card p-3 text-sm leading-6 text-muted">
                Jako projektant możesz korzystać z analizy AI i podglądu dopasowań, ale
                zapisywanie oraz wysyłanie briefów klienta jest zablokowane.
              </div>
            ) : null}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => saveBrief(true)}
                disabled={isSaving || isDesigner}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Zapisywanie briefu..." : "Zapisz brief i znajdź projektantów"}
              </button>
              <Link
                href={designerHref}
                className="rounded-xl border border-line bg-card px-5 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Zobacz dopasowania bez zapisywania
              </Link>
              <button
                type="button"
                onClick={copyBrief}
                className="rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                {copied ? "Brief skopiowany" : "Kopiuj brief"}
              </button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">Twój brief</div>
          <h2 className="mt-2 text-2xl font-bold">{optionLabel(projectTypes, projectType)} · {location || "Polska"}</h2>

          <div className="mt-5 grid gap-3 text-sm">
            {[
              ["Cel", optionLabel(goals, goal)],
              ["Powierzchnia", areaM2 ? `${areaM2} m²` : "Nie podano"],
              ["Pomieszczenia", roomCount || selectedRoomTypes.slice(0, 2).map((item) => roomTypeLabels[item] || item).join(", ") || "Nie podano"],
              ["Nieruchomość", optionLabel(propertyStatuses, propertyStatus)],
              ["Styl", styleLabels(style)],
              [
                "Zdjęcia",
                referencePhotos.length
                  ? `${referencePhotos.length}/${maxReferencePhotos}`
                  : "Brak",
              ],
              [
                "Cechy wizualne",
                selectedVisualCues.length
                  ? selectedVisualCues.slice(0, 2).map((item) => optionLabel(visualCues, item)).join(", ")
                  : "Nie oznaczono",
              ],
              ["Wsparcie", optionLabel(scopes, scope)],
              ["Budżet", optionLabel(budgets, budget)],
              ["Termin", optionLabel(timelines, timeline)],
              ["3D", optionLabel(visualizationNeeds, visualizationNeed)],
              ["Nadzór", optionLabel(supervisionNeeds, supervisionNeed)],
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
            <div className="text-sm font-semibold">Rekomendowany następny krok</div>
            <p className="mt-2 text-sm leading-6 text-muted">{nextStep}</p>
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-background p-4">
            <div className="text-sm font-semibold">Wskazówka do wyboru projektanta</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              {styleAnalysis
                ? styleAnalysis.designerPrompt
                : `Szukaj portfolio z cechami takimi jak ${visualCueLabel.toLowerCase()} i zapytaj,
              czy projektant oferuje zakres: ${selectedScope.label.toLowerCase()}.`}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {isDesigner ? (
              <div className="rounded-xl border border-primary/30 bg-primary-soft p-4 text-sm leading-6 text-foreground">
                <div className="font-semibold text-primary">Jesteś zalogowany jako projektant</div>
                <p className="mt-1 text-muted">
                  Analiza zdjęć AI, wskazówki stylistyczne, kopiowanie i podgląd dopasowań
                  pozostają dostępne. Konto projektanta nie może zapisywać ani wysyłać briefów klienta.
                </p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => saveBrief(true)}
              disabled={isSaving || isDesigner}
              className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Zapisywanie briefu..." : "Zapisz brief i znajdź projektantów"}
            </button>
            <button
              type="button"
              onClick={() => saveBrief(false)}
              disabled={isSaving || isDesigner}
              className="rounded-xl border border-primary bg-primary-soft px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Zapisywanie briefu..." : "Zapisz na później"}
            </button>
            <Link
              href={designerHref}
              className="rounded-xl border border-line bg-background px-5 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Zobacz dopasowania bez zapisywania
            </Link>
            <button
              type="button"
              onClick={copyBrief}
              className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              {copied ? "Brief skopiowany" : "Kopiuj brief"}
            </button>
          </div>

          {savedBriefId ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <div className="font-semibold">Brief zapisany</div>
              <p className="mt-1">
                Zapisano {polishCountLabel(savedReferenceCount ?? 0, "zdjęcie referencyjne", "zdjęcia referencyjne", "zdjęć referencyjnych")}. Brief jest gotowy do wysłania projektantowi.
              </p>
              <Link href="/client/briefs" className="mt-3 inline-flex font-semibold underline">
                Otwórz zapisane briefy
              </Link>
            </div>
          ) : null}

          {saveError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              <div className="font-semibold">Nie udało się zapisać briefu</div>
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
              Zobacz dopasowanych projektantów
            </Link>
          ) : (
            <button type="button" onClick={() => saveBrief(true)} disabled={isSaving} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
              {isSaving ? "Zapisywanie..." : "Zapisz i znajdź projektantów"}
            </button>
          )}
          <button type="button" onClick={copyBrief} className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-bold">
            {copied ? "Skopiowano" : "Kopiuj"}
          </button>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import ShareableStyleResult from "@/components/ShareableStyleResult";
import { countLabel } from "@/lib/count-label";
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
    label: "Apartment",
    value: "Apartment",
    description: "Flat, rental, or city home.",
  },
  {
    label: "House",
    value: "House",
    description: "Private home or larger renovation.",
  },
  {
    label: "Single room",
    value: "Single room",
    description: "Kitchen, bathroom, bedroom, or living room.",
  },
  {
    label: "Office",
    value: "Office",
    description: "Workspace, studio, or client-facing office.",
  },
];

const goals: Option[] = [
  {
    label: "Clarify direction",
    value: "Clarify direction",
    description: "I need a concept before spending more money.",
  },
  {
    label: "Plan renovation",
    value: "Plan renovation",
    description: "I need layout, materials, and practical decisions.",
  },
  {
    label: "Full design project",
    value: "Full design project",
    description: "I want a designer to guide the whole process.",
  },
  {
    label: "Find the right pro",
    value: "Find the right pro",
    description: "I know the need, but not who should help.",
  },
];

const styles: Option[] = [
  {
    label: "Warm minimalism",
    value: "Warm minimalism",
    description: "Calm, clean, natural, but not cold.",
    specialty: "minimalist",
  },
  {
    label: "Scandinavian",
    value: "Scandinavian",
    description: "Light, practical, soft textures, simple forms.",
    specialty: "scandinavian",
  },
  {
    label: "Modern classic",
    value: "Modern classic",
    description: "Elegant, balanced, timeless details.",
    specialty: "modern",
  },
  {
    label: "Industrial",
    value: "Industrial",
    description: "Loft feeling, texture, metal, concrete, contrast.",
    specialty: "industrial",
  },
  {
    label: "Japandi",
    value: "Japandi",
    description: "Japanese calm with Nordic warmth.",
    specialty: "minimalist",
  },
  {
    label: "Contemporary",
    value: "Contemporary",
    description: "Current forms, tailored details, and a balanced material palette.",
    specialty: "contemporary",
  },
  {
    label: "Mid-century modern",
    value: "Mid-century modern",
    description: "Clean lines, warm timber, vintage references, functional furniture.",
    specialty: "mid-century",
  },
  {
    label: "Art Deco",
    value: "Art Deco",
    description: "Geometry, rich materials, symmetry, and elegant statement details.",
    specialty: "art deco",
  },
  {
    label: "Mediterranean",
    value: "Mediterranean",
    description: "Sun-washed color, stone, plaster, timber, and relaxed texture.",
    specialty: "mediterranean",
  },
  {
    label: "Bohemian",
    value: "Bohemian",
    description: "Layered textiles, collected objects, color, and personal expression.",
    specialty: "bohemian",
  },
  {
    label: "Eclectic",
    value: "Eclectic",
    description: "A deliberate mix of eras, colors, art, and custom pieces.",
    specialty: "eclectic",
  },
  {
    label: "Rustic / organic",
    value: "Rustic / organic",
    description: "Natural stone, aged timber, handmade texture, and earthy warmth.",
    specialty: "rustic",
  },
  {
    label: "Traditional",
    value: "Traditional",
    description: "Classic proportions, detailed joinery, and familiar forms.",
    specialty: "traditional",
  },
  {
    label: "Luxury contemporary",
    value: "Luxury contemporary",
    description: "Bespoke joinery, premium stone, lighting, and polished detailing.",
    specialty: "luxury",
  },
  {
    label: "Not sure yet",
    value: "Not sure yet",
    description: "I want the system to help me name it.",
  },
];

const scopes: Option[] = [
  {
    label: "Consultation",
    value: "Consultation",
    description: "A short session to avoid wrong early decisions.",
  },
  {
    label: "Concept package",
    value: "Concept package",
    description: "Moodboard, layout direction, materials, priorities.",
  },
  {
    label: "Technical design",
    value: "Technical design",
    description: "Drawings, specifications, and contractor-ready details.",
  },
  {
    label: "End-to-end support",
    value: "End-to-end support",
    description: "Design, sourcing, coordination, and implementation help.",
  },
];

const budgets: Option[] = [
  {
    label: "Under 50k PLN",
    value: "Under 50k PLN total project budget",
    description: "One room, furnishing, or a focused light renovation.",
  },
  {
    label: "50k-100k PLN",
    value: "50k-100k PLN total project budget",
    description: "Several rooms or a compact apartment with controlled scope.",
  },
  {
    label: "100k-200k PLN",
    value: "100k-200k PLN total project budget",
    description: "A substantial apartment renovation or compact full interior.",
  },
  {
    label: "200k-400k PLN",
    value: "200k-400k PLN total project budget",
    description: "A complete apartment or house interior with custom elements.",
  },
  {
    label: "400k-800k PLN",
    value: "400k-800k PLN total project budget",
    description: "Larger home, premium materials, and extensive implementation.",
  },
  {
    label: "800k+ PLN",
    value: "800k+ PLN total project budget",
    description: "Large-scale or high-end design and construction scope.",
  },
  {
    label: "Not sure yet",
    value: "Total project budget not decided",
    description: "I need a designer to help establish a realistic total budget.",
  },
];

const timelines: Option[] = [
  {
    label: "As soon as possible",
    value: "As soon as possible",
    description: "I am ready to speak with available professionals now.",
  },
  {
    label: "In 1-3 months",
    value: "In 1-3 months",
    description: "I am preparing decisions and want to shortlist soon.",
  },
  {
    label: "In 3-6 months",
    value: "In 3-6 months",
    description: "I am planning ahead before the project starts.",
  },
  {
    label: "Just exploring",
    value: "Just exploring",
    description: "I want clarity before choosing a start date.",
  },
];

const propertyStatuses: Option[] = [
  {
    label: "New build",
    value: "New build / developer condition",
    description: "A new property before fit-out or handover.",
  },
  {
    label: "Existing property",
    value: "Existing property",
    description: "A lived-in, furnished, or previously finished space.",
  },
  {
    label: "Renovation in progress",
    value: "Renovation in progress",
    description: "Work has started and design decisions are still needed.",
  },
  {
    label: "Not purchased yet",
    value: "Not purchased yet",
    description: "I am planning before choosing or receiving the property.",
  },
];

const visualizationNeeds: Option[] = [
  {
    label: "Not needed",
    value: "Not needed",
    description: "Plans, samples, or a moodboard are enough for me.",
  },
  {
    label: "Selected rooms",
    value: "Selected rooms",
    description: "I want realistic views for the most important spaces.",
  },
  {
    label: "Full project",
    value: "Full project",
    description: "I want 3D visualization across the complete project.",
  },
  {
    label: "Not sure yet",
    value: "Not sure yet",
    description: "I want the designer to recommend the useful level.",
  },
];

const supervisionNeeds: Option[] = [
  {
    label: "Not needed",
    value: "Not needed",
    description: "I only need the design package and documentation.",
  },
  {
    label: "Consultations / site visits",
    value: "Consultations / site visits",
    description: "Occasional checks and help with on-site decisions.",
  },
  {
    label: "Author's supervision",
    value: "Author's supervision",
    description: "The designer should protect the design intent during works.",
  },
  {
    label: "Full project coordination",
    value: "Full project coordination",
    description: "I need active coordination of contractors, orders, and delivery.",
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

const visualCues: Option[] = [
  {
    label: "Natural wood",
    value: "Natural wood",
    description: "Oak, veneer, visible texture, warm materials.",
    specialty: "eco-friendly",
  },
  {
    label: "Bright neutral palette",
    value: "Bright neutral palette",
    description: "White, beige, greige, soft daylight.",
    specialty: "minimalist",
  },
  {
    label: "Hidden storage",
    value: "Hidden storage",
    description: "Built-ins, cleaner lines, less visual clutter.",
  },
  {
    label: "Bold color accents",
    value: "Bold color accents",
    description: "Strong walls, art, textiles, expressive contrast.",
  },
  {
    label: "Dark contrast",
    value: "Dark contrast",
    description: "Black details, moody rooms, stronger geometry.",
    specialty: "industrial",
  },
  {
    label: "Luxury details",
    value: "Luxury details",
    description: "Stone, brass, custom joinery, premium finish.",
    specialty: "luxury",
  },
  {
    label: "Eco materials",
    value: "Eco materials",
    description: "Natural, durable, lower-impact choices.",
    specialty: "eco-friendly",
  },
  {
    label: "Smart home",
    value: "Smart home",
    description: "Lighting scenes, automation, integrated tech.",
    specialty: "smart home",
  },
  {
    label: "Compact solutions",
    value: "Compact solutions",
    description: "Small-space ideas, flexible furniture, storage.",
  },
  {
    label: "Soft curves",
    value: "Soft curves",
    description: "Rounded furniture, calm shapes, gentle lines.",
  },
];

function selectedOption(options: Option[], value: string) {
  return options.find((option) => option.value === value) ?? options[0];
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
      <p className="mt-1 text-sm leading-6 text-muted">Choose one or several directions. Mixed tastes are normal and useful for matching.</p>
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
  const [location, setLocation] = useState("Warsaw");
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

  const selectedStyles = style.split(" | ").filter(Boolean);
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
    ? selectedVisualCues.slice(0, 3).join(", ")
    : selectedStyle.label;

  const designerParams = new URLSearchParams({
    match: "brief",
    sort: "recommended",
    view: "list",
    projectType,
    goal,
    style: styleAnalysis?.primaryStyle || style,
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
        `Project type: ${projectType}`,
        `Main goal: ${goal}`,
        `Area: ${areaM2 ? `${areaM2} m2` : "Not specified"}`,
        `Room count: ${roomCount || "Not specified"}`,
        selectedRoomTypes.length ? `Rooms: ${selectedRoomTypes.join(", ")}` : null,
        `Property status: ${propertyStatus}`,
        `Style direction: ${style}`,
        referencePhotos.length
          ? `Reference photos: ${referencePhotos.length} uploaded (${referencePhotos
              .map((photo) => photo.name)
              .slice(0, 5)
              .join(", ")}${referencePhotos.length > 5 ? ", ..." : ""})`
          : "Reference photos: none yet",
        styleAnalysis
          ? [
              `AI style read: ${styleAnalysis.primaryStyle} (${styleAnalysis.confidence} confidence)`,
              `AI summary: ${styleAnalysis.summary}`,
              styleAnalysis.colorPalette.length
                ? `AI color palette: ${styleAnalysis.colorPalette.join(", ")}`
                : null,
              styleAnalysis.materials.length
                ? `AI materials: ${styleAnalysis.materials.join(", ")}`
                : null,
              styleAnalysis.designerPrompt
                ? `Designer search prompt: ${styleAnalysis.designerPrompt}`
                : null,
            ]
              .filter(Boolean)
              .join("\n")
          : null,
        selectedVisualCues.length
          ? `Visual cues: ${selectedVisualCues.join(", ")}`
          : null,
        `Support needed: ${scope}`,
        `Budget signal: ${budget}`,
        `Preferred timeline: ${timeline}`,
        `3D visualization: ${visualizationNeed}`,
        `Supervision: ${supervisionNeed}`,
        `Location: ${location.trim() || "Not specified"}`,
        notes.trim() ? `Notes: ${notes.trim()}` : null,
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
      return "Book one focused consultation and use the brief to avoid vague conversations.";
    }

    if (scope === "End-to-end support") {
      return "Shortlist 2-3 designers with portfolio depth and ask about process, availability, and implementation support.";
    }

    if (goal === "Clarify direction") {
      return "Start with a concept package before committing to drawings or renovation decisions.";
    }

    return "Compare designers by similar projects, then send this brief as the first message.";
  }, [goal, scope]);

  async function copyBrief() {
    try {
      await copyText(briefText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Brief could not be copied.");
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
      setAnalysisError("Add at least one reference photo before running AI analysis.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const formData = new FormData();
    formData.set("project_type", projectType);
    formData.set("style_direction", style);
    formData.set("visual_cues", selectedVisualCues.join(", "));

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
        throw new Error(payload.error ?? "AI style analysis could not be completed.");
      }

      setStyleAnalysis(payload.analysis);
      if (styles.some((option) => option.value === payload.analysis?.styleDirection)) {
        setStyle(payload.analysis.styleDirection);
      }

      setSelectedVisualCues((current) =>
        Array.from(new Set([...current, ...payload.analysis!.visualCues]))
      );
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "AI style analysis could not be completed."
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
        throw new Error(payload.error ?? "Brief could not be saved.");
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
      setSaveError(error instanceof Error ? error.message : "Brief could not be saved.");
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
              Turn a vague idea into a usable project brief
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/72">
              Style matters, but the real match depends on scope, budget, room type,
              reference images, timeline, and the kind of help you need.
            </p>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-sm">
            <div className="text-sm font-semibold text-[#64dfd0]">Why this is better</div>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Instead of guessing a style name, ArchiCompass prepares the information a
              designer needs to decide if the project is a good fit.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid gap-7 rounded-lg border border-line bg-card p-5 shadow-[0_18px_50px_rgba(54,31,73,0.08)] sm:p-6">
          <OptionGrid
            label="1. What are you planning?"
            onChange={setProjectType}
            options={projectTypes}
            value={projectType}
          />

          <section>
            <h2 className="text-base font-bold">2. Tell us about the space</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Approximate details are enough. They help professionals estimate workload
              before the first conversation.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Area, m2
                <input
                  type="number"
                  min="1"
                  max="5000"
                  inputMode="decimal"
                  value={areaM2}
                  onChange={(event) => setAreaM2(event.target.value)}
                  placeholder="e.g. 72"
                  className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
                />
              </label>
              <label className="block text-sm font-semibold">
                Number of rooms
                <input
                  type="number"
                  min="1"
                  max="50"
                  inputMode="numeric"
                  value={roomCount}
                  onChange={(event) => setRoomCount(event.target.value)}
                  placeholder="e.g. 3"
                  className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
                />
              </label>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold">Rooms included</div>
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
                      {room}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <OptionGrid
            label="3. What is the property status?"
            onChange={setPropertyStatus}
            options={propertyStatuses}
            value={propertyStatus}
          />

          <OptionGrid
            label="4. What do you need most?"
            onChange={setGoal}
            options={goals}
            value={goal}
          />

          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold">5. Add reference photos</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Add 4-10 rooms, details, or moods you like. Previews stay in this
                  browser until you choose analysis or save the brief. Saving uploads
                  them to private brief storage.
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
                  ? "Photo limit reached"
                  : "Add reference photos"}
              </span>
              <span className="mt-1 text-sm text-muted">
                JPEG, PNG, or WebP. Use several photos to spot patterns.
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
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-line bg-background p-4 text-sm leading-6 text-muted">
                No photos yet. Start with images that make you say: this is the
                atmosphere, material, light, or detail I want.
              </div>
            )}

            <div className="mt-4 rounded-lg border-2 border-primary/25 bg-primary-soft p-4 shadow-[0_12px_30px_rgba(104,40,200,0.10)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white">AI</span>
                    <h3 className="text-sm font-bold text-primary">Photo style analysis</h3>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Let ArchiCompass read the reference photos and suggest a style name,
                    materials, colors, and designer-search clues.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={analyzeReferencePhotos}
                  disabled={!referencePhotos.length || isAnalyzing}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze photos"}
                </button>
              </div>

              <p className="mt-3 text-xs leading-5 text-muted">
                Choosing Analyze sends up to {maxAnalysisPhotos} photos to the configured
                AI provider. Do not submit photos containing people, addresses, or
                confidential information. See the <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </p>

              {referencePhotos.length > maxAnalysisPhotos ? (
                <p className="mt-3 text-xs leading-5 text-muted">
                  AI analysis uses the first {maxAnalysisPhotos} photos to keep the result
                  fast and focused. All photos can still be saved in the brief.
                </p>
              ) : null}

              {styleAnalysis ? (
                <div className="mt-4 grid gap-4 rounded-2xl border border-primary/20 bg-primary-soft p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        Suggested style
                      </div>
                      <div className="mt-1 text-2xl font-bold">
                        {styleAnalysis.primaryStyle}
                      </div>
                    </div>
                    <span className="w-fit rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary">
                      {styleAnalysis.confidence} confidence
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-muted">{styleAnalysis.summary}</p>

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    {[
                      ["Closest option", styleAnalysis.styleDirection],
                      [
                        "Colors",
                        styleAnalysis.colorPalette.length
                          ? styleAnalysis.colorPalette.join(", ")
                          : "Not enough signal",
                      ],
                      [
                        "Materials",
                        styleAnalysis.materials.length
                          ? styleAnalysis.materials.join(", ")
                          : "Not enough signal",
                      ],
                      [
                        "Style clues",
                        styleAnalysis.styleClues.length
                          ? styleAnalysis.styleClues.join(", ")
                          : "Not enough signal",
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-line bg-card p-3">
                        <div className="text-muted">{label}</div>
                        <div className="mt-1 font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-line bg-card p-3 text-sm leading-6">
                    <div className="font-semibold">How to brief a designer</div>
                    <p className="mt-1 text-muted">{styleAnalysis.designerPrompt}</p>
                  </div>

                  {styleAnalysis.watchOuts.length ? (
                    <div>
                      <div className="text-sm font-semibold">Watch-outs</div>
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
                  <div className="font-semibold">AI analysis unavailable</div>
                  <p className="mt-1">{analysisError}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-bold">What do these photos have in common?</h3>
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
            label="6. Which directions feel closest?"
            onChange={(values) => setStyle(values.length ? values.join(" | ") : "Not sure yet")}
            options={styles}
            values={selectedStyles}
          />

          <OptionGrid
            label="7. What level of help do you want?"
            onChange={setScope}
            options={scopes}
            value={scope}
          />

          <OptionGrid
            label="8. Total project budget (designer fee + materials + construction)"
            onChange={setBudget}
            options={budgets}
            value={budget}
          />

          <OptionGrid
            label="9. When do you want to start?"
            onChange={setTimeline}
            options={timelines}
            value={timeline}
          />

          <OptionGrid
            label="10. Do you need 3D visualization?"
            onChange={setVisualizationNeed}
            options={visualizationNeeds}
            value={visualizationNeed}
          />

          <OptionGrid
            label="11. What supervision do you need?"
            onChange={setSupervisionNeed}
            options={supervisionNeeds}
            value={supervisionNeed}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">
              Location
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Warsaw, Krakow, Gdansk..."
                className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
              />
            </label>

            <label className="block text-sm font-semibold">
              Extra context
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Kids, rental, deadline, contractor..."
                className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-primary"
              />
            </label>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">Your brief</div>
          <h2 className="mt-2 text-2xl font-bold">{projectType} in {location || "Poland"}</h2>

          <div className="mt-5 grid gap-3 text-sm">
            {[
              ["Goal", goal],
              ["Area", areaM2 ? `${areaM2} m2` : "Not specified"],
              ["Rooms", roomCount || selectedRoomTypes.slice(0, 2).join(", ") || "Not specified"],
              ["Property", propertyStatus],
              ["Style", style],
              [
                "Photos",
                referencePhotos.length
                  ? `${referencePhotos.length}/${maxReferencePhotos}`
                  : "None yet",
              ],
              [
                "Visual cues",
                selectedVisualCues.length
                  ? selectedVisualCues.slice(0, 2).join(", ")
                  : "Not tagged",
              ],
              ["Support", scope],
              ["Budget", budget],
              ["Timeline", timeline],
              ["3D", visualizationNeed],
              ["Supervision", supervisionNeed],
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
            <div className="text-sm font-semibold">Recommended next step</div>
            <p className="mt-2 text-sm leading-6 text-muted">{nextStep}</p>
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-background p-4">
            <div className="text-sm font-semibold">Designer fit signal</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              {styleAnalysis
                ? styleAnalysis.designerPrompt
                : `Look for portfolios with ${visualCueLabel.toLowerCase()} and ask whether
              the designer offers ${selectedScope.label.toLowerCase()}.`}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {isDesigner ? (
              <div className="rounded-xl border border-primary/30 bg-primary-soft p-4 text-sm leading-6 text-foreground">
                <div className="font-semibold text-primary">You are signed in as a designer</div>
                <p className="mt-1 text-muted">
                  AI photo analysis, style guidance, copying, and match previews remain
                  available. Designer accounts cannot save or send client briefs.
                </p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => saveBrief(true)}
              disabled={isSaving || isDesigner}
              className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving brief..." : "Save brief & find designers"}
            </button>
            <button
              type="button"
              onClick={() => saveBrief(false)}
              disabled={isSaving || isDesigner}
              className="rounded-xl border border-primary bg-primary-soft px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving brief..." : "Save for later"}
            </button>
            <Link
              href={designerHref}
              className="rounded-xl border border-line bg-background px-5 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Preview matches without saving
            </Link>
            <button
              type="button"
              onClick={copyBrief}
              className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              {copied ? "Brief copied" : "Copy brief"}
            </button>
          </div>

          {savedBriefId ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <div className="font-semibold">Brief saved</div>
              <p className="mt-1">
                Saved with {countLabel(savedReferenceCount ?? 0, "reference photo")}. It is ready to send to a designer.
              </p>
              <Link href="/client/briefs" className="mt-3 inline-flex font-semibold underline">
                Open saved briefs
              </Link>
            </div>
          ) : null}

          {saveError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              <div className="font-semibold">Brief was not saved</div>
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
              Preview designer matches
            </Link>
          ) : (
            <button type="button" onClick={() => saveBrief(true)} disabled={isSaving} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
              {isSaving ? "Saving..." : "Save & find designers"}
            </button>
          )}
          <button type="button" onClick={copyBrief} className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-bold">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </main>
  );
}

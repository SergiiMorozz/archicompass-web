"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

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

const maxReferencePhotos = 10;

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
    label: "Under 10k PLN",
    value: "Under 10k PLN",
    description: "Advice, light concept, or one focused area.",
  },
  {
    label: "10k-30k PLN",
    value: "10k-30k PLN",
    description: "Small project, concept, or selected rooms.",
  },
  {
    label: "30k-80k PLN",
    value: "30k-80k PLN",
    description: "Serious renovation or full interior design scope.",
  },
  {
    label: "80k+ PLN",
    value: "80k+ PLN",
    description: "Full home, premium scope, or implementation support.",
  },
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

export default function ProjectCompass() {
  const [projectType, setProjectType] = useState(projectTypes[0].value);
  const [goal, setGoal] = useState(goals[1].value);
  const [style, setStyle] = useState(styles[0].value);
  const [scope, setScope] = useState(scopes[1].value);
  const [budget, setBudget] = useState(budgets[1].value);
  const [location, setLocation] = useState("Warsaw");
  const [notes, setNotes] = useState("");
  const [referencePhotos, setReferencePhotos] = useState<ReferencePhoto[]>([]);
  const [selectedVisualCues, setSelectedVisualCues] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedBriefId, setSavedBriefId] = useState<string | null>(null);
  const [savedReferenceCount, setSavedReferenceCount] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const objectUrls = useRef<string[]>([]);

  const selectedStyle = selectedOption(styles, style);
  const selectedScope = selectedOption(scopes, scope);
  const selectedCueOptions = useMemo(
    () => visualCues.filter((cue) => selectedVisualCues.includes(cue.value)),
    [selectedVisualCues]
  );
  const visualSearchSpecialty =
    selectedCueOptions.find((cue) => cue.specialty)?.specialty ?? selectedStyle.specialty;
  const visualCueLabel = selectedVisualCues.length
    ? selectedVisualCues.slice(0, 3).join(", ")
    : selectedStyle.label;

  const designerParams = new URLSearchParams({
    sort: "recommended",
    view: "list",
  });

  if (location.trim()) designerParams.set("location", location.trim());
  if (visualSearchSpecialty) designerParams.set("specialty", visualSearchSpecialty);

  const designerHref = `/designers?${designerParams.toString()}`;

  const briefText = useMemo(
    () =>
      [
        `Project type: ${projectType}`,
        `Main goal: ${goal}`,
        `Style direction: ${style}`,
        referencePhotos.length
          ? `Reference photos: ${referencePhotos.length} uploaded (${referencePhotos
              .map((photo) => photo.name)
              .slice(0, 5)
              .join(", ")}${referencePhotos.length > 5 ? ", ..." : ""})`
          : "Reference photos: none yet",
        selectedVisualCues.length
          ? `Visual cues: ${selectedVisualCues.join(", ")}`
          : null,
        `Support needed: ${scope}`,
        `Budget signal: ${budget}`,
        `Location: ${location.trim() || "Not specified"}`,
        notes.trim() ? `Notes: ${notes.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    [
      budget,
      goal,
      location,
      notes,
      projectType,
      referencePhotos,
      scope,
      selectedVisualCues,
      style,
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
    await navigator.clipboard.writeText(briefText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
  }

  async function saveBrief() {
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

      if (response.status === 401 || payload.code === "AUTH_REQUIRED") {
        window.location.href = "/login";
        return;
      }

      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "Brief could not be saved.");
      }

      setSavedBriefId(payload.id);
      setSavedReferenceCount(payload.referencePhotoCount ?? 0);
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

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current = [];
    };
  }, []);

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
          <div>
            <div className="text-sm font-semibold text-primary">Project Compass</div>
            <h1 className="mt-2 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
              Turn a vague idea into a usable project brief
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              Style matters, but the real match depends on scope, budget, room type,
              reference images, timeline, and the kind of help you need.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
            <div className="text-sm font-semibold text-muted">Why this is better</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Instead of guessing a style name, ArchiCompass prepares the information a
              designer needs to decide if the project is a good fit.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid gap-7 rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">
          <OptionGrid
            label="1. What are you planning?"
            onChange={setProjectType}
            options={projectTypes}
            value={projectType}
          />

          <OptionGrid
            label="2. What do you need most?"
            onChange={setGoal}
            options={goals}
            value={goal}
          />

          <OptionGrid
            label="3. Which direction feels closest?"
            onChange={setStyle}
            options={styles}
            value={style}
          />

          <section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold">4. Add reference photos</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Add 4-10 rooms, details, or moods you like. Photos stay in this
                  browser for now, but their names and visual cues are included in the
                  copied brief.
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

          <OptionGrid
            label="5. What level of help do you want?"
            onChange={setScope}
            options={scopes}
            value={scope}
          />

          <OptionGrid
            label="6. What budget range should the designer respect?"
            onChange={setBudget}
            options={budgets}
            value={budget}
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
              Look for portfolios with {visualCueLabel.toLowerCase()} and ask whether
              the designer offers {selectedScope.label.toLowerCase()}.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href={designerHref}
              className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
            >
              Find matching designers
            </Link>
            <button
              type="button"
              onClick={saveBrief}
              disabled={isSaving}
              className="rounded-xl border border-primary bg-primary-soft px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving brief..." : "Save brief"}
            </button>
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
                Saved with {savedReferenceCount ?? 0} reference photo
                {(savedReferenceCount ?? 0) === 1 ? "" : "s"}. We can connect this to
                designer inquiries next.
              </p>
              <Link href="/account/briefs" className="mt-3 inline-flex font-semibold underline">
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
    </main>
  );
}

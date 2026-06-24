"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Option = {
  label: string;
  value: string;
  description: string;
  specialty?: string;
};

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
  const [copied, setCopied] = useState(false);

  const selectedStyle = selectedOption(styles, style);
  const selectedScope = selectedOption(scopes, scope);

  const designerHref = useMemo(() => {
    const params = new URLSearchParams({
      sort: "recommended",
      view: "list",
    });

    if (location.trim()) params.set("location", location.trim());
    if (selectedStyle.specialty) params.set("specialty", selectedStyle.specialty);

    return `/designers?${params.toString()}`;
  }, [location, selectedStyle.specialty]);

  const briefText = useMemo(
    () =>
      [
        `Project type: ${projectType}`,
        `Main goal: ${goal}`,
        `Style direction: ${style}`,
        `Support needed: ${scope}`,
        `Budget signal: ${budget}`,
        `Location: ${location.trim() || "Not specified"}`,
        notes.trim() ? `Notes: ${notes.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    [budget, goal, location, notes, projectType, scope, style]
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
              timeline, and the kind of help you need.
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

          <OptionGrid
            label="4. What level of help do you want?"
            onChange={setScope}
            options={scopes}
            value={scope}
          />

          <OptionGrid
            label="5. What budget range should the designer respect?"
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
              Look for {selectedStyle.label.toLowerCase()} work and ask whether the
              designer offers {selectedScope.label.toLowerCase()}.
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
              onClick={copyBrief}
              className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              {copied ? "Brief copied" : "Copy brief"}
            </button>
          </div>

          <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-[#1f172a] p-4 text-xs leading-6 text-white/78">
            {briefText}
          </pre>
        </aside>
      </section>
    </main>
  );
}

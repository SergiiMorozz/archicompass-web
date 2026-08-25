import { cleanDesignerAnalysis, designerAnalysisPromptVersion, designerAnalysisSchema } from "./designer-analysis-schema";
import { cleanSubclusterResult, subclusterPromptVersion, subclusterSchema } from "./subcluster-schema";
import { cleanProfileDraft, profileDraftPromptVersion, profileDraftSchema } from "./profile-draft-schema";
import type { AIImageInput, AIProfileDraftResult, AIProvider, AIProviderResult, AISubclusterResult } from "./provider";
import type { DesignerIntelligenceProfile } from "@/lib/portfolio-ingestion/aggregate-profile";

const geminiPortfolioModel = process.env.GEMINI_PORTFOLIO_MODEL || "gemini-3.1-flash-lite";
const maxOutputTokens = 1000;
const maxImagesPerAnalysis = 8;
const maxImagesPerSubcluster = 24;
const maxSubclusterOutputTokens = 1500;
const maxProfileDraftOutputTokens = 1200;

function schemaForGemini(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(schemaForGemini);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "additionalProperties")
      .map(([key, item]) => [key, schemaForGemini(item)])
  );
}

function geminiText(payload: Record<string, unknown>) {
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const content = (candidate as Record<string, unknown>).content;
    if (!content || typeof content !== "object") continue;
    const parts = Array.isArray((content as Record<string, unknown>).parts)
      ? ((content as Record<string, unknown>).parts as unknown[])
      : [];
    for (const part of parts) {
      if (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string") {
        return (part as Record<string, unknown>).text as string;
      }
    }
  }
  return null;
}

async function callGemini(
  prompt: string,
  images: AIImageInput[],
  schema: unknown,
  maxTokens: number
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI analysis is not configured." };

  const model = encodeURIComponent(geminiPortfolioModel);
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }, ...images.map((image) => ({ inline_data: { data: image.base64, mime_type: image.mimeType } }))],
            },
          ],
          generationConfig: {
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
            responseSchema: schemaForGemini(schema),
          },
        }),
      }
    );
  } catch {
    return { ok: false, error: "Could not reach the AI service." };
  }

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      typeof payload.error === "object" && payload.error && typeof (payload.error as Record<string, unknown>).message === "string"
        ? ((payload.error as Record<string, unknown>).message as string)
        : "AI analysis failed.";
    return { ok: false, error: message };
  }

  const text = geminiText(payload);
  if (!text) return { ok: false, error: "The AI service did not return a readable analysis." };
  return { ok: true, text };
}

function analysisPrompt(projectTitle: string | null, imageCount: number, locale: "pl" | "en") {
  const scraped = projectTitle ? `The page this was scraped from was titled "${projectTitle}" - use it only as a weak hint, it is often a site-navigation label, not a real project name.` : "No page title was available.";

  if (locale === "pl") {
    return [
      "Te zdjęcia zostały automatycznie pobrane ze strony internetowej pracowni projektowania wnętrz podczas importu portfolio dla ArchiCompass. Mogą to być zdjęcia zrealizowanego projektu wnętrza, ale równie dobrze mogą to być zdjęcia niezwiązane z konkretnym projektem: portrety zespołu, zdjęcie profilowe projektanta, logo, moodboard, nagroda/certyfikat, zdjęcie biura pracowni, pojedynczy produkt/mebel na białym tle albo inny materiał marketingowy.",
      `Liczba zdjęć: ${imageCount}.`,
      scraped,
      "isInteriorProject: ustaw true tylko jeśli zdjęcia rzeczywiście pokazują zaprojektowaną lub wyremontowaną przestrzeń wnętrza (mieszkanie, dom, biuro, lokal usługowy itp.). Ustaw false dla portretów osób, zdjęć zespołu, logo, moodboardów, nagród/dyplomów, zdjęć biura pracowni, pojedynczych produktów na białym tle lub innych treści niebędących projektem wnętrza.",
      "irrelevanceReason: jeśli isInteriorProject to false, napisz jednym krótkim zdaniem po polsku, co faktycznie przedstawiają zdjęcia (np. \"portret biznesowy projektanta\"). Jeśli isInteriorProject to true, zostaw puste.",
      "Pozostałe pola wypełnij najlepiej jak potrafisz nawet jeśli isInteriorProject to false - zostaną zignorowane, ale pole musi być obecne w odpowiedzi.",
      "suggestedTitle: zaproponuj krótką, konkretną nazwę projektu po polsku, jaką mógłby użyć projektant w swoim portfolio (np. \"Ciepły minimalistyczny apartament\"), a nie techniczny tytuł strony.",
      "Zwróć strukturalną wiedzę projektową, nie tekst marketingowy: dominujące i drugorzędne style z pewnością 0-1, typy pomieszczeń, widoczne materiały, krótką dominującą paletę kolorów oraz liczbowe oceny 0-1 dla minimalizmu, ciepła, kolorowości, zdobienia i luksusu.",
      "Opisuj wyłącznie to, co faktycznie widać na zdjęciach. Nie zgaduj marek, cen ani niewidocznych szczegółów.",
      "summary: jedno lub dwa rzeczowe zdania po polsku opisujące charakter projektu, do wewnętrznego dopasowywania (nie tekst marketingowy).",
      "Wszystkie pola tekstowe (suggestedTitle, summary, irrelevanceReason, nazwy stylów, materiałów, kolorów, pomieszczeń) zwróć po polsku.",
    ].join("\n");
  }

  return [
    "These photos were automatically scraped from an interior design studio's website during a portfolio import for ArchiCompass. They might show a completed interior design project, but they could equally be unrelated content: team portraits, a designer's headshot, a logo, a moodboard, an award/certificate, a photo of the studio's own office, a single product/furniture shot on a plain background, or other marketing material.",
    `Photo count: ${imageCount}.`,
    scraped,
    "isInteriorProject: set true only if the photos genuinely show a designed or renovated interior space (an apartment, house, office, commercial space, etc). Set false for people's portraits, team photos, logos, moodboards, awards/certificates, photos of the studio's own office, single product shots on a plain background, or any other non-project content.",
    "irrelevanceReason: if isInteriorProject is false, give one short sentence saying what the photos actually show (e.g. \"designer's business headshot\"). Leave it empty if isInteriorProject is true.",
    "Fill in the remaining fields as best you can even when isInteriorProject is false - they will be ignored, but the field must still be present in the response.",
    "suggestedTitle: propose a short, concrete project name a designer could use in their portfolio (e.g. \"Warm Minimalist Apartment\"), not a technical page title.",
    "Return structured design intelligence, not marketing prose: dominant and secondary styles with a confidence 0-1 each, room types shown, materials visible, a short dominant color palette, and numeric 0-1 attribute scores for minimalism, warmth, colorfulness, ornamentation and luxury.",
    "Only describe what is visibly present in the photos. Do not guess brands, exact prices, or invisible details.",
    "summary should be one or two factual sentences describing the project's design character, for internal matching use (not public marketing copy).",
  ].join("\n");
}

function subclusterPrompt(imageCount: number, locale: "pl" | "en") {
  if (locale === "pl") {
    return [
      `Poniżej znajduje się ${imageCount} zdjęć pobranych automatycznie z JEDNEJ strony (galerii) na stronie internetowej pracowni projektowania wnętrz. Nie mamy żadnych podpisów ani linków - tylko same zdjęcia w kolejności, w jakiej wystąpiły na stronie (indeksy od 0).`,
      "WAŻNE: jeden projekt (np. jedno mieszkanie lub dom) niemal zawsze zawiera wiele różnych typów pomieszczeń - kuchnię, salon, sypialnię, łazienkę, pokój dziecięcy, gabinet, przedpokój. To, że dwa zdjęcia przedstawiają różne pomieszczenia (np. kuchnię i sypialnię), NIE oznacza, że to różne projekty. Różny typ pomieszczenia to nie granica projektu.",
      "Twoim zadaniem jest znalezienie dowodów na to, że te zdjęcia pochodzą z KILKU RÓŻNYCH, NIEZWIĄZANYCH ZE SOBĄ realizacji (np. innych mieszkań, innych klientów) - a nie po prostu z różnych pomieszczeń tej samej realizacji.",
      "Domyślnie zakładaj, że to JEDEN spójny projekt i zwróć dokładnie jedną grupę zawierającą wszystkie indeksy.",
      "Dziel na osobne grupy TYLKO wtedy, gdy widzisz wyraźne, silne dowody na zupełnie inny charakter projektu pomiędzy zestawami zdjęć - np. wyraźnie inna ogólna stylistyka, zupełnie inna paleta kolorów całej przestrzeni, inny poziom wykończenia/standardu, lub inny typ nieruchomości (np. mieszkanie vs biuro vs restauracja). Sama różnica pomieszczeń, oświetlenia na zdjęciu czy kąta ujęcia to za mało.",
      "Zwracaj jak najmniej grup (maksymalnie 3) i tylko takie, które zawierają co najmniej 3 zdjęcia. Jeśli nie masz pewności co do podziału, nie dziel wcale.",
      "Każda grupa musi mieć krótką etykietę po polsku opisującą całą realizację, nie pojedyncze pomieszczenie (np. \"Jasny apartament w stylu skandynawskim\", nie \"Kuchnia\") oraz listę indeksów zdjęć (0-based) należących do tej grupy.",
      "Każdy indeks zdjęcia może wystąpić tylko w jednej grupie.",
    ].join("\n");
  }
  return [
    `Below are ${imageCount} photos scraped automatically from ONE page (gallery) on an interior design studio's website. There are no captions or links - only the photos themselves, in the order they appeared on the page (0-based indexes).`,
    "IMPORTANT: a single project (e.g. one apartment or house) almost always includes many different room types - kitchen, living room, bedroom, bathroom, kids room, home office, hallway. Two photos showing different rooms (e.g. a kitchen and a bedroom) does NOT mean they're different projects. Different room type is not a project boundary.",
    "Your job is to find evidence that these photos come from SEVERAL DIFFERENT, UNRELATED projects (e.g. different apartments, different clients) - not just evidence that they show different rooms of the same project.",
    "Default to assuming this is ONE coherent project and return exactly one group containing every index.",
    "Only split into separate groups when you see clear, strong evidence of a genuinely different project character between sets of photos - e.g. a clearly different overall design style, a completely different color palette for the whole space, a different finish/standard level, or a different property type (e.g. apartment vs office vs restaurant). A difference in room, lighting, or camera angle alone is not enough.",
    "Return as few groups as possible (at most 3), and only groups with at least 3 photos each. If you're not confident about a split, don't split at all.",
    "Each group needs a short label describing the whole realization, not a single room (e.g. \"Bright Scandinavian-style apartment\", not \"Kitchen\"), and a list of the (0-based) photo indexes that belong to it.",
    "Each photo index may appear in only one group.",
  ].join("\n");
}

function profileDraftPrompt(
  profile: DesignerIntelligenceProfile,
  projectSummaries: string[],
  allowedServiceCapabilities: readonly string[],
  locale: "pl" | "en"
) {
  const styles = [...profile.dominant_styles, ...profile.secondary_styles].map((s) => s.name).join(", ") || "-";
  const facts = [
    `Styles: ${styles}`,
    `Materials: ${profile.materials.join(", ") || "-"}`,
    `Colors: ${profile.colors.join(", ") || "-"}`,
    `Room experience: ${profile.room_experience.join(", ") || "-"}`,
    `Attributes (0-1): minimalism ${profile.attributes.minimalism.toFixed(2)}, warmth ${profile.attributes.warmth.toFixed(2)}, colorfulness ${profile.attributes.colorfulness.toFixed(2)}, ornamentation ${profile.attributes.ornamentation.toFixed(2)}, luxury ${profile.attributes.luxury.toFixed(2)}`,
    `Project summaries: ${projectSummaries.map((s, i) => `(${i + 1}) ${s}`).join(" ") || "-"}`,
  ].join("\n");

  if (locale === "pl") {
    return [
      "Na podstawie poniższej analizy portfolio interior designera, napisz szkic tekstów do jego profilu publicznego na ArchiCompass. To TYLKO szkic - projektant przejrzy i zatwierdzi lub zmieni każde pole, więc pisz naturalnie, ale nie zmyślaj faktów spoza podanych danych (np. lat doświadczenia, liczby klientów, cen, lokalizacji).",
      "Dane o portfolio:",
      facts,
      "headline: jedno krótkie, konkretne zdanie (max ok. 12 słów) opisujące specjalizację projektanta, np. \"Ciepłe, minimalistyczne wnętrza mieszkalne w duchu japandi\".",
      "about: 2-4 zdania po polsku opisujące podejście projektowe i charakter pracy, w pierwszej osobie liczby pojedynczej lub bezosobowo (nie \"my\", to jeden projektant), bez wymyślania konkretnych liczb (lat doświadczenia, liczby projektów) ani twierdzeń, których nie widać w danych.",
      "specialties: 3-6 krótkich tagów specjalizacji po polsku (np. \"mieszkania\", \"wnętrza w stylu japandi\", \"kuchnie\").",
      `suggestedServiceCapabilities: wybierz spośród dokładnie tych wartości (po angielsku, bez zmian): ${allowedServiceCapabilities.join(", ")}. Wybierz tylko te usługi, na które są dowody w danych o portfolio (np. wizualizacje widoczne w projektach sugerują "3D visualization"). Jeśli brak dowodów, zwróć pustą listę.`,
      "Wszystkie pola tekstowe (headline, about, specialties) zwróć po polsku, oprócz suggestedServiceCapabilities które musi zostać po angielsku dokładnie tak jak podano.",
    ].join("\n");
  }

  return [
    "Based on the interior designer portfolio analysis below, draft public-profile copy for their ArchiCompass profile. This is ONLY a draft - the designer will review and confirm or edit every field, so write naturally, but do not invent facts beyond the given data (e.g. years of experience, number of clients, prices, location).",
    "Portfolio data:",
    facts,
    "headline: one short, concrete sentence (max ~12 words) describing the designer's specialization, e.g. \"Warm, minimalist residential interiors with a Japandi sensibility\".",
    "about: 2-4 sentences describing the design approach and character of the work, without inventing specific numbers (years of experience, project counts) or claims not visible in the data.",
    "specialties: 3-6 short specialization tags (e.g. \"apartments\", \"Japandi interiors\", \"kitchens\").",
    `suggestedServiceCapabilities: choose only from exactly these values (unchanged): ${allowedServiceCapabilities.join(", ")}. Only include a service if the portfolio data actually supports it (e.g. visualizations visible in the projects suggest "3D visualization"). Return an empty list if there's no evidence.`,
  ].join("\n");
}

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  readonly modelVersion = geminiPortfolioModel;

  async analyzeDesignerProject(input: {
    images: AIImageInput[];
    projectTitle: string | null;
    locale: "pl" | "en";
  }): Promise<AIProviderResult> {
    const images = input.images.slice(0, maxImagesPerAnalysis);
    const response = await callGemini(
      analysisPrompt(input.projectTitle, images.length, input.locale),
      images,
      designerAnalysisSchema,
      maxOutputTokens
    );
    if (!response.ok) return response;

    try {
      return { ok: true, result: cleanDesignerAnalysis(JSON.parse(response.text)) };
    } catch {
      return { ok: false, error: "The AI service returned an unreadable analysis." };
    }
  }

  async suggestSubclusters(input: { images: AIImageInput[]; locale: "pl" | "en" }): Promise<AISubclusterResult> {
    const images = input.images.slice(0, maxImagesPerSubcluster);
    const response = await callGemini(subclusterPrompt(images.length, input.locale), images, subclusterSchema, maxSubclusterOutputTokens);
    if (!response.ok) return response;

    try {
      return { ok: true, result: cleanSubclusterResult(JSON.parse(response.text), images.length) };
    } catch {
      return { ok: false, error: "The AI service returned an unreadable grouping." };
    }
  }

  async suggestProfileDraft(input: {
    profile: DesignerIntelligenceProfile;
    projectSummaries: string[];
    allowedServiceCapabilities: readonly string[];
    locale: "pl" | "en";
  }): Promise<AIProfileDraftResult> {
    const response = await callGemini(
      profileDraftPrompt(input.profile, input.projectSummaries.slice(0, 10), input.allowedServiceCapabilities, input.locale),
      [],
      profileDraftSchema(input.allowedServiceCapabilities),
      maxProfileDraftOutputTokens
    );
    if (!response.ok) return response;

    try {
      return { ok: true, result: cleanProfileDraft(JSON.parse(response.text), input.allowedServiceCapabilities) };
    } catch {
      return { ok: false, error: "The AI service returned an unreadable profile draft." };
    }
  }
}

export { designerAnalysisPromptVersion, subclusterPromptVersion, profileDraftPromptVersion };

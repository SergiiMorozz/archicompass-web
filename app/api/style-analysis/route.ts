import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { siteLocale } from "@/lib/site-locale";
import { logError, logInfo } from "@/lib/observability";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const maxAnalysisPhotos = 6;
const maxImageSize = 8 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const styleProvider = process.env.STYLE_ANALYSIS_PROVIDER || "openai";
const openAiStyleModel = process.env.OPENAI_STYLE_MODEL || "gpt-4.1-mini";
const geminiStyleModel = process.env.GEMINI_STYLE_MODEL || "gemini-3.1-flash-lite";
const anonymousDailyLimit = positiveLimit(process.env.STYLE_ANALYSIS_DAILY_ANON_LIMIT, 5);
const accountDailyLimit = positiveLimit(process.env.STYLE_ANALYSIS_DAILY_ACCOUNT_LIMIT, 15);
const isEnglish = siteLocale === "en";

function localized(pl: string, en: string) {
  return isEnglish ? en : pl;
}

const allowedVisualCues = [
  "Natural wood",
  "Bright neutral palette",
  "Hidden storage",
  "Bold color accents",
  "Dark contrast",
  "Luxury details",
  "Eco materials",
  "Smart home",
  "Compact solutions",
  "Soft curves",
];

const allowedStyles = [
  "Warm minimalism",
  "Scandinavian",
  "Modern classic",
  "Industrial",
  "Japandi",
  "Contemporary",
  "Mid-century modern",
  "Art Deco",
  "Mediterranean",
  "Bohemian",
  "Eclectic",
  "Rustic / organic",
  "Traditional",
  "Luxury contemporary",
  "Not sure yet",
];

const polishStyleNames: Record<string, string> = {
  "Warm minimalism": "Ciepły minimalizm",
  Scandinavian: "Styl skandynawski",
  "Modern classic": "Modern classic",
  Industrial: "Styl industrialny",
  Japandi: "Japandi",
  Contemporary: "Styl współczesny",
  "Mid-century modern": "Mid-century modern",
  "Art Deco": "Art déco",
  Mediterranean: "Styl śródziemnomorski",
  Bohemian: "Boho",
  Eclectic: "Styl eklektyczny",
  "Rustic / organic": "Styl rustykalny / organiczny",
  Traditional: "Styl tradycyjny",
  "Luxury contemporary": "Współczesny luksus",
  "Not sure yet": "Kierunek do doprecyzowania",
};

const polishKnownTerms: Record<string, string> = {
  "Natural wood": "naturalne drewno",
  "Bright neutral palette": "jasna neutralna paleta",
  "Hidden storage": "ukryte przechowywanie",
  "Bold color accents": "wyraziste akcenty kolorystyczne",
  "Dark contrast": "ciemny kontrast",
  "Luxury details": "luksusowe detale",
  "Eco materials": "materiały ekologiczne",
  "Smart home": "smart home",
  "Compact solutions": "rozwiązania do małych przestrzeni",
  "Soft curves": "miękkie linie",
  Cream: "kremowy",
  "Off-white": "złamana biel",
  Beige: "beż",
  Greige: "greige",
  "Warm beige": "ciepły beż",
  "Light oak": "jasny dąb",
  Oak: "dąb",
  Walnut: "orzech",
  Stone: "kamień",
  "Natural stone": "naturalny kamień",
  Marble: "marmur",
  Brass: "mosiądz",
  Rattan: "rattan",
  "Textured plaster": "tynk strukturalny",
  "Light wood": "jasne drewno",
  "Dark wood": "ciemne drewno",
  "Bouclé fabric": "tkanina boucle",
};

const englishStyleNames: Record<string, string> = {
  "Warm minimalism": "Warm minimalism",
  Scandinavian: "Scandinavian",
  "Modern classic": "Modern classic",
  Industrial: "Industrial",
  Japandi: "Japandi",
  Contemporary: "Contemporary",
  "Mid-century modern": "Mid-century modern",
  "Art Deco": "Art Deco",
  Mediterranean: "Mediterranean",
  Bohemian: "Bohemian",
  Eclectic: "Eclectic",
  "Rustic / organic": "Rustic / organic",
  Traditional: "Traditional",
  "Luxury contemporary": "Contemporary luxury",
  "Not sure yet": "Direction to refine",
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

type ImageInput = {
  base64: string;
  mimeType: string;
};

type AnalysisInput = {
  currentCues: string;
  currentStyle: string;
  images: ImageInput[];
  projectType: string;
};

type QuotaResult = {
  allowed: boolean;
  remaining: number;
  reset_at: string;
};

function positiveLimit(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 100 ? parsed : fallback;
}

function requestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

async function consumeAnalysisQuota(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const identity = user
    ? `account:${user.id}`
    : `guest:${requestIp(request)}:${request.headers.get("user-agent")?.slice(0, 160) || "unknown"}`;
  const actorHash = createHash("sha256").update(identity).digest("hex");
  const dailyLimit = user ? accountDailyLimit : anonymousDailyLimit;
  const admin = createSupabaseAdminClient();
  const { data: quotaData, error } = await admin.rpc("consume_style_analysis_quota", {
    target_actor_hash: actorHash,
    daily_limit: dailyLimit,
  });

  if (error) return { error, quota: null, actorId: user?.id ?? null };
  const quota = Array.isArray(quotaData) ? (quotaData[0] as QuotaResult | undefined) : null;
  return { error: null, quota, actorId: user?.id ?? null };
}

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "primaryStyle",
    "styleDirection",
    "confidence",
    "summary",
    "colorPalette",
    "materials",
    "styleClues",
    "visualCues",
    "searchSpecialty",
    "designerPrompt",
    "watchOuts",
  ],
  properties: {
    primaryStyle: { type: "string" },
    styleDirection: { type: "string", enum: allowedStyles },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    summary: { type: "string" },
    colorPalette: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
    },
    materials: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
    },
    styleClues: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
    },
    visualCues: {
      type: "array",
      items: { type: "string", enum: allowedVisualCues },
      maxItems: 5,
    },
    searchSpecialty: { type: "string" },
    designerPrompt: { type: "string" },
    watchOuts: {
      type: "array",
      items: { type: "string" },
      maxItems: 4,
    },
  },
};

function schemaForGemini(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(schemaForGemini);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "additionalProperties")
      .map(([key, item]) => [key, schemaForGemini(item)])
  );
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function fileValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => typeof value !== "string" && value.size > 0);
}

function arrayOfStrings(value: unknown, fallback: string[] = []) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : fallback;
}

function localizedKnownTerm(value: string) {
  const trimmed = value.trim();
  return isEnglish ? trimmed : polishKnownTerms[trimmed] ?? trimmed;
}

function cleanUserTextList(value: unknown, maxItems: number) {
  return arrayOfStrings(value)
    .map(localizedKnownTerm)
    .slice(0, maxItems);
}

function cleanAnalysis(value: unknown, imageCount: number): StyleAnalysis {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const styleDirection =
    typeof data.styleDirection === "string" && allowedStyles.includes(data.styleDirection)
      ? data.styleDirection
      : "Not sure yet";
  const reportedConfidence =
    data.confidence === "high" || data.confidence === "medium" || data.confidence === "low"
      ? data.confidence
      : "medium";
  const confidence = imageCount < 2 && reportedConfidence === "high" ? "medium" : reportedConfidence;
  const visualCues = arrayOfStrings(data.visualCues).filter((cue) =>
    allowedVisualCues.includes(cue)
  );

  return {
    primaryStyle:
      typeof data.primaryStyle === "string" && data.primaryStyle.trim()
        ? ((isEnglish ? englishStyleNames : polishStyleNames)[data.primaryStyle.trim()] ?? data.primaryStyle.trim())
        : (isEnglish ? englishStyleNames : polishStyleNames)[styleDirection],
    styleDirection,
    confidence,
    summary:
      typeof data.summary === "string" && data.summary.trim()
        ? data.summary.trim()
        : localized(
            "Zdjęcia wskazują na spójny kierunek wnętrza, ale do precyzyjnego określenia stylu potrzeba nieco więcej kontekstu.",
            "The photos point to a coherent interior direction, but a little more context is needed to identify the style precisely."
          ),
    colorPalette: cleanUserTextList(data.colorPalette, 6),
    materials: cleanUserTextList(data.materials, 6),
    styleClues: cleanUserTextList(data.styleClues, 6),
    visualCues: visualCues.slice(0, 5),
    searchSpecialty:
      typeof data.searchSpecialty === "string" ? data.searchSpecialty.trim() : "",
    designerPrompt:
      typeof data.designerPrompt === "string" && data.designerPrompt.trim()
        ? data.designerPrompt.trim()
        : localized(
            "Szukaj projektantów, których portfolio pokazuje podobny nastrój, materiały i sposób pracy ze światłem.",
            "Look for designers whose portfolios show a similar mood, material palette, and approach to light."
          ),
    watchOuts: cleanUserTextList(data.watchOuts, 4),
  };
}

function responseText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text;

  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? ((item as Record<string, unknown>).content as unknown[])
      : [];

    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") continue;
      const record = contentItem as Record<string, unknown>;
      if (typeof record.text === "string") return record.text;
    }
  }

  return null;
}

function userFacingOpenAiError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("quota") ||
    normalized.includes("billing") ||
    normalized.includes("plan")
  ) {
    return localized(
      "Usługa AI jest połączona, ale konto OpenAI nie ma obecnie dostępnego limitu. Spróbuj ponownie później.",
      "The AI service is connected, but the OpenAI account has no available quota right now. Please try again later."
    );
  }

  if (normalized.includes("api key") || normalized.includes("unauthorized")) {
    return localized(
      "Usługa AI jest chwilowo niedostępna z powodu błędu konfiguracji. Spróbuj ponownie później.",
      "The AI service is temporarily unavailable because of a configuration issue. Please try again later."
    );
  }

  return message || localized("Nie udało się przeprowadzić analizy AI.", "The AI analysis could not be completed.");
}

function userFacingGeminiError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("api key") ||
    normalized.includes("permission") ||
    normalized.includes("unauthenticated") ||
    normalized.includes("forbidden")
  ) {
    return localized(
      "Usługa AI jest chwilowo niedostępna z powodu błędu konfiguracji. Spróbuj ponownie później.",
      "The AI service is temporarily unavailable because of a configuration issue. Please try again later."
    );
  }

  if (
    normalized.includes("quota") ||
    normalized.includes("billing") ||
    normalized.includes("rate")
  ) {
    return localized(
      "Dzienny limit analizy AI został chwilowo wyczerpany. Spróbuj ponownie później.",
      "The daily AI analysis limit has been reached. Please try again later."
    );
  }

  return message || localized("Nie udało się przeprowadzić analizy AI.", "The AI analysis could not be completed.");
}

async function fileToImageInput(file: File): Promise<ImageInput> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    base64: buffer.toString("base64"),
    mimeType: file.type,
  };
}

function analysisPrompt({
  currentCues,
  currentStyle,
  projectType,
  images,
}: AnalysisInput) {
  const prompt = isEnglish
    ? [
        "Analyse these interior reference photos for ArchiCompass.",
        "Prepare practical style guidance for a client looking for the right interior designer.",
        `Reference photo count: ${images.length}.`,
        `Project type: ${projectType}.`,
        `Style selected by the client before the analysis: ${currentStyle}.`,
        `Visual cues selected by the client before the analysis: ${currentCues}.`,
        "Return every user-facing field in natural, professional English: primaryStyle, summary, colorPalette, materials, styleClues, designerPrompt and watchOuts.",
        "Do not classify the interior as Japandi solely because it has light wood and a neutral palette. Choose Japandi only when Japanese restraint, calm composition, and Scandinavian softness are all clearly visible. Otherwise choose a more accurate general direction, for example Contemporary.",
        "For a single photo, use confidence: medium or low. Explain the limitation in summary when the full style cannot be confirmed without more images.",
        "Describe only materials and details visible in the images. Do not guess wood species, technology, or material when it is not clear.",
        `styleDirection must be one of: ${allowedStyles.join(", ")}.`,
        `visualCues must only use these values: ${allowedVisualCues.join(", ")}.`,
        "Only the technical fields styleDirection, visualCues and searchSpecialty may use English enum values.",
        "searchSpecialty should be one short marketplace keyword such as minimalist, scandinavian, modern, industrial, luxury, eco-friendly, smart home, or an empty string.",
      ]
    : [
        "Przeanalizuj te zdjęcia referencyjne wnętrz dla ArchiCompass.",
        "Przygotuj praktyczne wskazówki stylistyczne dla klienta, który chce znaleźć właściwego projektanta wnętrz.",
    `Liczba zdjęć referencyjnych: ${images.length}.`,
    `Typ inwestycji: ${projectType}.`,
    `Styl wybrany przez klienta przed analizą: ${currentStyle}.`,
    `Cechy wizualne wybrane przez klienta przed analizą: ${currentCues}.`,
    "Wszystkie treści przeznaczone dla użytkownika zwróć wyłącznie po polsku: primaryStyle, summary, colorPalette, materials, styleClues, designerPrompt i watchOuts.",
    "Jeśli w analizie pojawi się angielski opis materiału, koloru, stylu lub wskazówki, przetłumacz go na naturalny polski przed zwróceniem JSON.",
    "Pisz naturalnym, profesjonalnym językiem polskim. Bądź konkretny, ale nie sugeruj pewności, jeśli zdjęcia są niespójne.",
    "Nie klasyfikuj wnętrza jako Japandi wyłącznie na podstawie jasnego drewna i neutralnej palety. Wybierz Japandi tylko wtedy, gdy wyraźnie widać połączenie japońskiej powściągliwości, spokojnej kompozycji i skandynawskiej miękkości. W przeciwnym razie wybierz bardziej ogólny, trafny kierunek, np. Contemporary.",
    "Przy jednym zdjęciu używaj confidence: medium lub low. Zaznacz ograniczenie w summary, gdy bez dodatkowych ujęć nie da się potwierdzić pełnego stylu.",
    "Opisuj wyłącznie materiały i detale widoczne na zdjęciu. Nie zgaduj gatunku drewna, technologii ani materiału, jeśli nie są jednoznaczne.",
    `styleDirection must be one of: ${allowedStyles.join(", ")}.`,
    `visualCues must only use these values: ${allowedVisualCues.join(", ")}.`,
    "Tylko pola techniczne styleDirection, visualCues i searchSpecialty mogą używać angielskich wartości enum.",
        "searchSpecialty should be one short marketplace keyword such as minimalist, scandinavian, modern, industrial, luxury, eco-friendly, smart home, or an empty string.",
      ];

  return prompt.join("\n");
}

async function analyzeWithOpenAi(input: AnalysisInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        code: "AI_NOT_CONFIGURED",
        error: localized("Analiza zdjęć AI jest chwilowo niedostępna.", "AI photo analysis is temporarily unavailable."),
      },
      { status: 501 }
    );
  }

  const openAiImageParts = input.images.map((image) => ({
    type: "input_image",
    image_url: `data:${image.mimeType};base64,${image.base64}`,
  }));

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openAiStyleModel,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: analysisPrompt(input) },
            ...openAiImageParts,
          ],
        },
      ],
      max_output_tokens: 900,
      text: {
        format: {
          type: "json_schema",
          name: "interior_style_analysis",
          strict: true,
          schema: analysisSchema,
        },
      },
    }),
  });

  const payload = (await openAiResponse.json()) as Record<string, unknown>;
  if (!openAiResponse.ok) {
    const error =
      typeof payload.error === "object" &&
      payload.error &&
      typeof (payload.error as Record<string, unknown>).message === "string"
        ? ((payload.error as Record<string, unknown>).message as string)
        : "AI analysis failed.";

    return NextResponse.json(
      { error: userFacingOpenAiError(error) },
      { status: openAiResponse.status }
    );
  }

  const text = responseText(payload);
  if (!text) {
    return NextResponse.json(
      { error: localized("Usługa AI nie zwróciła czytelnego wyniku analizy.", "The AI service did not return a readable analysis.") },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json({ analysis: cleanAnalysis(JSON.parse(text), input.images.length) });
  } catch {
    return NextResponse.json(
      { error: localized("Usługa AI zwróciła nieczytelny wynik analizy.", "The AI service returned an unreadable analysis.") },
      { status: 502 }
    );
  }
}

function geminiText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text;

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

async function analyzeWithGemini(input: AnalysisInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        code: "AI_NOT_CONFIGURED",
        error: localized("Analiza zdjęć AI jest chwilowo niedostępna.", "AI photo analysis is temporarily unavailable."),
      },
      { status: 501 }
    );
  }

  const model = encodeURIComponent(geminiStyleModel);
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: analysisPrompt(input) },
              ...input.images.map((image) => ({
                inline_data: {
                  data: image.base64,
                  mime_type: image.mimeType,
                },
              })),
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 900,
          responseMimeType: "application/json",
          responseSchema: schemaForGemini(analysisSchema),
        },
      }),
    }
  );

  const payload = (await geminiResponse.json()) as Record<string, unknown>;
  if (!geminiResponse.ok) {
    const error =
      typeof payload.error === "object" &&
      payload.error &&
      typeof (payload.error as Record<string, unknown>).message === "string"
        ? ((payload.error as Record<string, unknown>).message as string)
        : "Gemini analysis failed.";

    return NextResponse.json(
      { error: userFacingGeminiError(error) },
      { status: geminiResponse.status }
    );
  }

  const text = geminiText(payload);
  if (!text) {
    return NextResponse.json(
      { error: localized("Usługa AI nie zwróciła czytelnego wyniku analizy.", "The AI service did not return a readable analysis.") },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json({ analysis: cleanAnalysis(JSON.parse(text), input.images.length) });
  } catch {
    return NextResponse.json(
      { error: localized("Usługa AI zwróciła nieczytelny wynik analizy.", "The AI service returned an unreadable analysis.") },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: localized("Przed uruchomieniem analizy dodaj zdjęcia referencyjne.", "Add reference photos before starting the analysis.") },
      { status: 400 }
    );
  }
  const photos = fileValues(formData, "reference_photos");

  if (!photos.length) {
    return NextResponse.json(
      { error: localized("Dodaj co najmniej jedno zdjęcie referencyjne przed uruchomieniem analizy AI.", "Add at least one reference photo before starting the AI analysis.") },
      { status: 400 }
    );
  }

  if (photos.length > maxAnalysisPhotos) {
    return NextResponse.json(
      { error: localized(`Jednocześnie możesz przeanalizować maksymalnie ${maxAnalysisPhotos} zdjęć.`, `You can analyse up to ${maxAnalysisPhotos} photos at a time.`) },
      { status: 400 }
    );
  }

  for (const photo of photos) {
    if (!allowedImageTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: localized("Analiza AI obsługuje pliki JPEG, PNG i WebP.", "AI analysis supports JPEG, PNG and WebP files.") },
        { status: 400 }
      );
    }

    if (photo.size > maxImageSize) {
      return NextResponse.json(
        { error: localized("Każde zdjęcie do analizy AI musi mieć mniej niż 8 MB.", "Each photo for AI analysis must be smaller than 8 MB.") },
        { status: 400 }
      );
    }
  }

  let quotaResult: Awaited<ReturnType<typeof consumeAnalysisQuota>>;
  try {
    quotaResult = await consumeAnalysisQuota(request);
  } catch {
    logError("ai_analysis_quota_unavailable", { durationMs: Date.now() - startedAt });
    return NextResponse.json(
      { error: localized("Analiza AI jest chwilowo niedostępna. Spróbuj ponownie za moment.", "AI analysis is temporarily unavailable. Please try again in a moment.") },
      { status: 503 }
    );
  }

  const { error: quotaError, quota, actorId } = quotaResult;
  if (quotaError || !quota) {
    logError("ai_analysis_quota_failed", { durationMs: Date.now() - startedAt, code: quotaError?.code ?? null });
    return NextResponse.json(
      { error: localized("Analiza AI jest chwilowo niedostępna. Spróbuj ponownie za moment.", "AI analysis is temporarily unavailable. Please try again in a moment.") },
      { status: 503 }
    );
  }
  if (!quota.allowed) {
    logInfo("ai_analysis_rate_limited", { authenticated: Boolean(actorId), durationMs: Date.now() - startedAt });
    return NextResponse.json(
      {
        code: "AI_DAILY_LIMIT_REACHED",
        error: localized("Dzienny limit analizy zdjęć AI został wyczerpany. Spróbuj ponownie jutro.", "The daily AI photo analysis limit has been reached. Please try again tomorrow."),
        resetAt: quota.reset_at,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(60, Math.ceil((new Date(quota.reset_at).getTime() - Date.now()) / 1000))
          ),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const projectType = textValue(formData, "project_type") ?? "Interior project";
  const currentStyle = textValue(formData, "style_direction") ?? "Not sure yet";
  const currentCues = textValue(formData, "visual_cues") ?? "None selected yet";
  const images = await Promise.all(photos.map(fileToImageInput));
  const input = { currentCues, currentStyle, images, projectType };

  const response = styleProvider === "gemini"
    ? await analyzeWithGemini(input)
    : await analyzeWithOpenAi(input);

  if (response.ok) {
    try {
      const admin = createSupabaseAdminClient();
      await admin.from("product_events").insert({
        event_type: "ai_analysis_completed",
        actor_id: actorId,
        metadata: { authenticated: Boolean(actorId), photo_count: photos.length, provider: styleProvider },
      });
    } catch {
      logError("ai_analysis_metric_write_failed", { durationMs: Date.now() - startedAt });
    }
    logInfo("ai_analysis_completed", {
      authenticated: Boolean(actorId),
      durationMs: Date.now() - startedAt,
      photoCount: photos.length,
      provider: styleProvider,
    });
  } else {
    logError("ai_analysis_failed", { durationMs: Date.now() - startedAt, status: response.status, provider: styleProvider });
  }
  response.headers.set("X-RateLimit-Remaining", String(quota.remaining));
  return response;
}

import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
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
  const { data: quotaData, error } = await supabase.rpc("consume_style_analysis_quota", {
    target_actor_hash: actorHash,
    daily_limit: dailyLimit,
  });

  if (error) return { error, quota: null };
  const quota = Array.isArray(quotaData) ? (quotaData[0] as QuotaResult | undefined) : null;
  return { error: null, quota };
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

function cleanAnalysis(value: unknown): StyleAnalysis {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const styleDirection =
    typeof data.styleDirection === "string" && allowedStyles.includes(data.styleDirection)
      ? data.styleDirection
      : "Not sure yet";
  const confidence =
    data.confidence === "high" || data.confidence === "medium" || data.confidence === "low"
      ? data.confidence
      : "medium";
  const visualCues = arrayOfStrings(data.visualCues).filter((cue) =>
    allowedVisualCues.includes(cue)
  );

  return {
    primaryStyle:
      typeof data.primaryStyle === "string" && data.primaryStyle.trim()
        ? data.primaryStyle.trim()
        : styleDirection,
    styleDirection,
    confidence,
    summary:
      typeof data.summary === "string" && data.summary.trim()
        ? data.summary.trim()
        : "Zdjęcia wskazują na spójny kierunek wnętrza, ale do precyzyjnego określenia stylu potrzeba nieco więcej kontekstu.",
    colorPalette: arrayOfStrings(data.colorPalette).slice(0, 6),
    materials: arrayOfStrings(data.materials).slice(0, 6),
    styleClues: arrayOfStrings(data.styleClues).slice(0, 6),
    visualCues: visualCues.slice(0, 5),
    searchSpecialty:
      typeof data.searchSpecialty === "string" ? data.searchSpecialty.trim() : "",
    designerPrompt:
      typeof data.designerPrompt === "string" && data.designerPrompt.trim()
        ? data.designerPrompt.trim()
        : "Szukaj projektantów, których portfolio pokazuje podobny nastrój, materiały i sposób pracy ze światłem.",
    watchOuts: arrayOfStrings(data.watchOuts).slice(0, 4),
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
    return "Usługa AI jest połączona, ale konto OpenAI nie ma obecnie dostępnego limitu. Spróbuj ponownie później.";
  }

  if (normalized.includes("api key") || normalized.includes("unauthorized")) {
    return "Usługa AI jest chwilowo niedostępna z powodu błędu konfiguracji. Spróbuj ponownie później.";
  }

  return message || "Nie udało się przeprowadzić analizy AI.";
}

function userFacingGeminiError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("api key") ||
    normalized.includes("permission") ||
    normalized.includes("unauthenticated") ||
    normalized.includes("forbidden")
  ) {
    return "Usługa AI jest chwilowo niedostępna z powodu błędu konfiguracji. Spróbuj ponownie później.";
  }

  if (
    normalized.includes("quota") ||
    normalized.includes("billing") ||
    normalized.includes("rate")
  ) {
    return "Dzienny limit analizy AI został chwilowo wyczerpany. Spróbuj ponownie później.";
  }

  return message || "Nie udało się przeprowadzić analizy AI.";
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
}: Pick<AnalysisInput, "currentCues" | "currentStyle" | "projectType">) {
  return [
    "Przeanalizuj te zdjęcia referencyjne wnętrz dla ArchiCompass.",
    "Przygotuj praktyczne wskazówki stylistyczne dla klienta, który chce znaleźć właściwego projektanta wnętrz.",
    `Typ inwestycji: ${projectType}.`,
    `Styl wybrany przez klienta przed analizą: ${currentStyle}.`,
    `Cechy wizualne wybrane przez klienta przed analizą: ${currentCues}.`,
    "Wszystkie treści przeznaczone dla użytkownika zwróć wyłącznie po polsku: primaryStyle, summary, colorPalette, materials, styleClues, designerPrompt i watchOuts.",
    "Jeśli w analizie pojawi się angielski opis materiału, koloru, stylu lub wskazówki, przetłumacz go na naturalny polski przed zwróceniem JSON.",
    "Pisz naturalnym, profesjonalnym językiem polskim. Bądź konkretny, ale nie sugeruj pewności, jeśli zdjęcia są niespójne.",
    `styleDirection must be one of: ${allowedStyles.join(", ")}.`,
    `visualCues must only use these values: ${allowedVisualCues.join(", ")}.`,
    "Tylko pola techniczne styleDirection, visualCues i searchSpecialty mogą używać angielskich wartości enum.",
    "searchSpecialty should be one short marketplace keyword such as minimalist, scandinavian, modern, industrial, luxury, eco-friendly, smart home, or an empty string.",
  ].join("\n");
}

async function analyzeWithOpenAi(input: AnalysisInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        code: "AI_NOT_CONFIGURED",
        error: "Analiza zdjęć AI jest chwilowo niedostępna.",
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
      { error: "Usługa AI nie zwróciła czytelnego wyniku analizy." },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json({ analysis: cleanAnalysis(JSON.parse(text)) });
  } catch {
    return NextResponse.json(
      { error: "Usługa AI zwróciła nieczytelny wynik analizy." },
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
        error: "Analiza zdjęć AI jest chwilowo niedostępna.",
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
      { error: "Usługa AI nie zwróciła czytelnego wyniku analizy." },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json({ analysis: cleanAnalysis(JSON.parse(text)) });
  } catch {
    return NextResponse.json(
      { error: "Usługa AI zwróciła nieczytelny wynik analizy." },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Przed uruchomieniem analizy dodaj zdjęcia referencyjne." },
      { status: 400 }
    );
  }
  const photos = fileValues(formData, "reference_photos");

  if (!photos.length) {
    return NextResponse.json(
      { error: "Dodaj co najmniej jedno zdjęcie referencyjne przed uruchomieniem analizy AI." },
      { status: 400 }
    );
  }

  if (photos.length > maxAnalysisPhotos) {
    return NextResponse.json(
      { error: `Jednocześnie możesz przeanalizować maksymalnie ${maxAnalysisPhotos} zdjęć.` },
      { status: 400 }
    );
  }

  for (const photo of photos) {
    if (!allowedImageTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: "Analiza AI obsługuje pliki JPEG, PNG i WebP." },
        { status: 400 }
      );
    }

    if (photo.size > maxImageSize) {
      return NextResponse.json(
        { error: "Każde zdjęcie do analizy AI musi mieć mniej niż 8 MB." },
        { status: 400 }
      );
    }
  }

  const { error: quotaError, quota } = await consumeAnalysisQuota(request);
  if (quotaError || !quota) {
    console.error("Style analysis quota check failed", quotaError);
    return NextResponse.json(
      { error: "Analiza AI jest chwilowo niedostępna. Spróbuj ponownie za moment." },
      { status: 503 }
    );
  }
  if (!quota.allowed) {
    return NextResponse.json(
      {
        code: "AI_DAILY_LIMIT_REACHED",
        error: "Dzienny limit analizy zdjęć AI został wyczerpany. Spróbuj ponownie jutro.",
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
  response.headers.set("X-RateLimit-Remaining", String(quota.remaining));
  return response;
}

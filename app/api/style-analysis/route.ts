import { NextResponse } from "next/server";

export const runtime = "nodejs";

const maxAnalysisPhotos = 6;
const maxImageSize = 8 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const styleModel = process.env.OPENAI_STYLE_MODEL || "gpt-4.1-mini";

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
        : "The images suggest a coherent interior direction, but the style needs a little more context.",
    colorPalette: arrayOfStrings(data.colorPalette).slice(0, 6),
    materials: arrayOfStrings(data.materials).slice(0, 6),
    styleClues: arrayOfStrings(data.styleClues).slice(0, 6),
    visualCues: visualCues.slice(0, 5),
    searchSpecialty:
      typeof data.searchSpecialty === "string" ? data.searchSpecialty.trim() : "",
    designerPrompt:
      typeof data.designerPrompt === "string" && data.designerPrompt.trim()
        ? data.designerPrompt.trim()
        : "Look for designers with similar mood, materials, and lighting in their portfolio.",
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

async function imagePart(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  return {
    type: "input_image",
    image_url: `data:${file.type};base64,${base64}`,
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        code: "AI_NOT_CONFIGURED",
        error: "AI photo analysis is not configured yet. Add OPENAI_API_KEY to enable it.",
      },
      { status: 501 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Send reference photos as a multipart form before running AI analysis." },
      { status: 400 }
    );
  }
  const photos = fileValues(formData, "reference_photos");

  if (!photos.length) {
    return NextResponse.json(
      { error: "Add at least one reference photo before running AI analysis." },
      { status: 400 }
    );
  }

  if (photos.length > maxAnalysisPhotos) {
    return NextResponse.json(
      { error: `Analyze up to ${maxAnalysisPhotos} photos at once.` },
      { status: 400 }
    );
  }

  for (const photo of photos) {
    if (!allowedImageTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: "AI analysis supports JPEG, PNG, and WebP images." },
        { status: 400 }
      );
    }

    if (photo.size > maxImageSize) {
      return NextResponse.json(
        { error: "Each photo for AI analysis must be smaller than 8 MB." },
        { status: 400 }
      );
    }
  }

  const projectType = textValue(formData, "project_type") ?? "Interior project";
  const currentStyle = textValue(formData, "style_direction") ?? "Not sure yet";
  const currentCues = textValue(formData, "visual_cues") ?? "None selected yet";
  const imageParts = await Promise.all(photos.map(imagePart));
  const prompt = [
    "Analyze these interior reference photos for ArchiCompass.",
    "Return practical interior-design style guidance for a client who is trying to find the right designer.",
    `Project type: ${projectType}.`,
    `Client-selected style before analysis: ${currentStyle}.`,
    `Client-selected visual cues before analysis: ${currentCues}.`,
    "Use plain English. Be specific, but avoid pretending certainty if photos conflict.",
    `styleDirection must be one of: ${allowedStyles.join(", ")}.`,
    `visualCues must only use these values: ${allowedVisualCues.join(", ")}.`,
    "searchSpecialty should be one short marketplace keyword such as minimalist, scandinavian, modern, industrial, luxury, eco-friendly, smart home, or an empty string.",
  ].join("\n");

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: styleModel,
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }, ...imageParts],
        },
      ],
      max_output_tokens: 900,
      text: {
        format: {
          type: "json_schema",
          name: "interior_style_analysis",
          strict: true,
          schema: {
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
          },
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

    return NextResponse.json({ error }, { status: openAiResponse.status });
  }

  const text = responseText(payload);
  if (!text) {
    return NextResponse.json(
      { error: "AI analysis returned no readable style result." },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json({ analysis: cleanAnalysis(JSON.parse(text)) });
  } catch {
    return NextResponse.json(
      { error: "AI analysis returned an unreadable style result." },
      { status: 502 }
    );
  }
}

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourceDirectory = resolve("content/legal-source");
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_STYLE_MODEL || "gemini-2.5-flash";

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is required to translate the legal source files.");
}

const documents = [
  ["terms-pl-source.txt", "terms-en-source.txt"],
  ["privacy-pl-source.txt", "privacy-en-source.txt"],
  ["cookies-pl-source.txt", "cookies-en-source.txt"],
  ["ai-transparency-pl-source.txt", "ai-transparency-en-source.txt"],
];

function splitIntoChunks(text, maximumLength = 8500) {
  const paragraphs = text.trim().split(/\n\s*\n/);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;

    if (current && next.length > maximumLength) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(source, documentName, chunkIndex, totalChunks) {
  const prompt = [
    "You are translating a Polish legal document for a public website into professional, precise British English.",
    "Translate every word and every provision. Do not summarise, omit, simplify, add legal advice, or change the legal effect.",
    "Preserve the exact order, numbering, headings, list markers, quotations, URLs, email addresses, and paragraph boundaries.",
    "Keep paragraph breaks exactly as they appear. Return only the translated text, without commentary, Markdown fences, or a title.",
    `Document: ${documentName}. Part ${chunkIndex} of ${totalChunks}.`,
    "",
    source,
  ].join("\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: "Prioritise legal fidelity and preserve the source structure exactly." }],
      },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
    }),
  });

  if (!response.ok) {
    throw new Error(`${documentName} part ${chunkIndex}: Gemini returned ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const translated = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!translated) {
    throw new Error(`${documentName} part ${chunkIndex}: Gemini returned no translation.`);
  }

  return translated;
}

for (const [sourceName, targetName] of documents) {
  const source = await readFile(resolve(sourceDirectory, sourceName), "utf8");
  const chunks = splitIntoChunks(source);
  const translation = [];

  for (const [index, chunk] of chunks.entries()) {
    process.stdout.write(`Translating ${sourceName}: ${index + 1}/${chunks.length}\n`);
    translation.push(await translateChunk(chunk, sourceName, index + 1, chunks.length));
  }

  await writeFile(resolve(sourceDirectory, targetName), `${translation.join("\n\n")}\n`, "utf8");
}

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourceDirectory = resolve("content/legal-source");
const documents = ["terms", "privacy", "cookies", "ai-transparency"];

function headingNumbers(source) {
  return [...source.matchAll(/^(?:§\s*)?(\d+)\.\s+[^\n]+$/gm)].map((match) => match[1]);
}

function bulletCount(source) {
  return [...source.matchAll(/^\*\s+/gm)].length;
}

for (const document of documents) {
  const [polish, english] = await Promise.all([
    readFile(resolve(sourceDirectory, `${document}-pl-source.txt`), "utf8"),
    readFile(resolve(sourceDirectory, `${document}-en-source.txt`), "utf8"),
  ]);
  const polishHeadings = headingNumbers(polish);
  const englishHeadings = headingNumbers(english);

  if (polishHeadings.join(",") !== englishHeadings.join(",")) {
    throw new Error(`${document}: section numbering differs between PL and EN.`);
  }

  if (bulletCount(polish) !== bulletCount(english)) {
    throw new Error(`${document}: bullet count differs between PL and EN.`);
  }

  if (/\b(?:TODO|TRANSLATE|translation pending)\b/i.test(english) || /[А-Яа-яЁё]/.test(english)) {
    throw new Error(`${document}: English source contains an unfinished translation marker.`);
  }

  console.log(`${document}: ${polishHeadings.length} numbered headings, ${bulletCount(polish)} bullets`);
}

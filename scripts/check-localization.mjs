import { readFileSync } from "node:fs";

const sharedSourceFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/login/page.tsx",
  "app/get-started/page.tsx",
  "app/forgot-password/page.tsx",
  "app/reset-password/page.tsx",
  "app/onboarding/page.tsx",
  "app/inspiration/page.tsx",
  "app/inspiration/[slug]/page.tsx",
  "components/Header.tsx",
  "components/Footer.tsx",
];

const failures = sharedSourceFiles.flatMap((file) => {
  const source = readFileSync(file, "utf8");
  const errors = [];

  if (!source.includes("@/content/site-copy")) {
    errors.push(`${file}: missing the shared locale contract`);
  }
  const importsPolishOnlyPageCopy = /import\s*{[^}]*\b(?:inspirationCopy|projectCompassCopy)\b[^}]*}\s*from\s*["']@\/content\/pl\/copy["']/.test(source);
  if (importsPolishOnlyPageCopy) {
    errors.push(`${file}: imports Polish-only page copy instead of the shared locale contract`);
  }

  return errors;
});

if (failures.length) {
  console.error("Locale architecture check failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`Locale architecture check passed for ${sharedSourceFiles.length} shared source files.`);

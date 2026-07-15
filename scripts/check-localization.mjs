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

const workspaceSourceFiles = [
  "app/client/page.tsx",
  "app/client/messages/page.tsx",
  "app/client/favorites/page.tsx",
  "app/client/briefs/page.tsx",
  "app/studio/page.tsx",
  "app/studio/inbox/page.tsx",
  "app/studio/analytics/page.tsx",
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

for (const file of workspaceSourceFiles) {
  const source = readFileSync(file, "utf8");
  if (!source.includes("@/content/workspace-copy")) {
    failures.push(`${file}: missing the shared workspace locale contract`);
  }
}

if (failures.length) {
  console.error("Locale architecture check failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`Locale architecture check passed for ${sharedSourceFiles.length + workspaceSourceFiles.length} shared source files.`);

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
  "app/account/page.tsx",
  "app/account/profile/page.tsx",
  "app/account/projects/page.tsx",
  "app/client/page.tsx",
  "app/client/messages/page.tsx",
  "app/client/favorites/page.tsx",
  "app/client/briefs/page.tsx",
  "app/studio/page.tsx",
  "app/studio/inbox/page.tsx",
  "app/studio/inbox/[id]/page.tsx",
  "app/studio/team/page.tsx",
  "app/studio/analytics/page.tsx",
  "app/admin/page.tsx",
  "app/admin/activity/page.tsx",
  "app/admin/team/page.tsx",
  "app/admin/users/page.tsx",
  "app/admin/users/[id]/page.tsx",
  "components/AdminNav.tsx",
  "components/ProjectCreateForm.tsx",
];

const publicProfileSourceFiles = ["components/ProjectGallery.tsx"];
const designerProfileSourceFiles = ["app/designers/[id]/page.tsx"];
const interactiveSourceFiles = [
  "components/FavoriteButton.tsx",
  "components/GoogleRating.tsx",
  "components/SocialLinks.tsx",
  "components/ReferencePhotoGrid.tsx",
  "components/MessageAttachments.tsx",
  "components/ConversationAutoRefresh.tsx",
];
const accountFlowSourceFiles = [
  "app/account/briefs/page.tsx",
  "app/account/inquiries/page.tsx",
  "app/account/inquiries/[id]/page.tsx",
];
const projectCompassSourceFiles = [
  "app/project-compass/page.tsx",
  "app/ai-style-finder/ProjectCompass.tsx",
  "components/ShareableStyleResult.tsx",
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

for (const file of publicProfileSourceFiles) {
  const source = readFileSync(file, "utf8");
  if (!source.includes("@/content/public-profile-copy")) {
    failures.push(`${file}: missing the public profile locale contract`);
  }
}

for (const file of designerProfileSourceFiles) {
  const source = readFileSync(file, "utf8");
  if (!source.includes("@/content/designer-profile-copy")) {
    failures.push(`${file}: missing the designer profile locale contract`);
  }
}

for (const file of interactiveSourceFiles) {
  const source = readFileSync(file, "utf8");
  if (!source.includes("@/content/interactive-copy")) {
    failures.push(`${file}: missing the shared interactive locale contract`);
  }
}

for (const file of accountFlowSourceFiles) {
  const source = readFileSync(file, "utf8");
  if (!source.includes("@/content/account-flow-copy")) {
    failures.push(`${file}: missing the account flow locale contract`);
  }
}

for (const file of projectCompassSourceFiles) {
  const source = readFileSync(file, "utf8");
  if (!source.includes("@/content/project-compass-copy")) {
    failures.push(`${file}: missing the shared AI Project Compass locale contract`);
  }
}

if (failures.length) {
  console.error("Locale architecture check failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`Locale architecture check passed for ${sharedSourceFiles.length + workspaceSourceFiles.length + publicProfileSourceFiles.length + designerProfileSourceFiles.length + interactiveSourceFiles.length + accountFlowSourceFiles.length + projectCompassSourceFiles.length} shared source files.`);

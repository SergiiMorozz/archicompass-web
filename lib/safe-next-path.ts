export function safeInternalPath(value: string | null | undefined, fallback = "/account") {
  const path = value?.trim();

  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\") || /[\r\n]/.test(path)) {
    return fallback;
  }

  try {
    const url = new URL(path, "https://archicompass.local");
    return url.origin === "https://archicompass.local"
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}

export function stripLocalePrefix(path: string) {
  return path.replace(/^\/en(?=\/|$)/, "") || "/";
}

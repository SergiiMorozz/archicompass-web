import { headers } from "next/headers";

export async function currentRequestPath(fallback: string) {
  const value = (await headers()).get("x-archicompass-path");
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

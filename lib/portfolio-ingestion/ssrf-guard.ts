import dns from "node:dns/promises";
import net from "node:net";

const fetchTimeoutMs = 10_000;
const maxRedirects = 3;

class UnsafeUrlError extends Error {}

function isDisallowedIp(address: string) {
  const type = net.isIP(address);
  if (type === 4) {
    const octets = address.split(".").map(Number);
    if (octets[0] === 10) return true;
    if (octets[0] === 127) return true;
    if (octets[0] === 169 && octets[1] === 254) return true;
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    if (octets[0] === 192 && octets[1] === 168) return true;
    if (octets[0] === 0) return true;
    if (octets[0] >= 224) return true; // multicast/reserved
    return false;
  }
  if (type === 6) {
    const normalized = address.toLowerCase();
    if (normalized === "::1") return true;
    if (normalized.startsWith("fe80:")) return true; // link-local
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local
    if (normalized.startsWith("::ffff:")) {
      return isDisallowedIp(normalized.replace("::ffff:", ""));
    }
    return false;
  }
  return true; // not a parseable IP - treat as unsafe
}

async function assertSafeHost(hostname: string) {
  if (hostname === "localhost") throw new UnsafeUrlError("Local addresses are not allowed.");
  const directIp = net.isIP(hostname) ? hostname : null;
  const addresses = directIp
    ? [directIp]
    : (await dns.lookup(hostname, { all: true })).map((entry) => entry.address);

  if (!addresses.length) throw new UnsafeUrlError("Could not resolve host.");
  for (const address of addresses) {
    if (isDisallowedIp(address)) {
      throw new UnsafeUrlError("This address is not allowed.");
    }
  }
}

export async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("Enter a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new UnsafeUrlError("Only http and https URLs are allowed.");
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("URLs with credentials are not allowed.");
  }
  await assertSafeHost(url.hostname);
  return url;
}

export type SafeFetchResult = {
  finalUrl: string;
  contentType: string;
  bytes: Buffer;
};

/**
 * fetch() with manual redirect handling (each hop is re-validated against the
 * SSRF blocklist), a hard timeout, and a response size cap. Treats the
 * response body as untrusted bytes only - callers must not execute or
 * interpret it as instructions.
 */
export async function safeFetch(rawUrl: string, maxBytes: number): Promise<SafeFetchResult> {
  let currentUrl = await assertSafeUrl(rawUrl);

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);
    try {
      const response = await fetch(currentUrl, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "ArchiCompassPortfolioBot/1.0" },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new UnsafeUrlError("Redirect without a location.");
        currentUrl = await assertSafeUrl(new URL(location, currentUrl).toString());
        continue;
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && Number(contentLength) > maxBytes) {
        throw new UnsafeUrlError("Response is too large.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Empty response body.");
      const chunks: Uint8Array[] = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > maxBytes) {
          await reader.cancel();
          throw new UnsafeUrlError("Response is too large.");
        }
        chunks.push(value);
      }

      return {
        finalUrl: currentUrl.toString(),
        contentType: response.headers.get("content-type") ?? "application/octet-stream",
        bytes: Buffer.concat(chunks),
      };
    } finally {
      // Keep the timeout active while the response body streams. A server can
      // send headers and then never finish the image body.
      clearTimeout(timeout);
    }
  }

  throw new UnsafeUrlError("Too many redirects.");
}

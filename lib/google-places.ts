export type GooglePlaceSummary = {
  placeId: string;
  businessUrl: string | null;
  displayName: string | null;
  rating: number | null;
  reviewCount: number | null;
};

type PlaceDetailsPayload = {
  id?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  error?: { message?: string };
};

function cleanGoogleInput(input: string) {
  return input.trim();
}

function isLikelyPlaceId(value: string) {
  return /^ChI[A-Za-z0-9_-]{10,}$/.test(value) || /^places\/[A-Za-z0-9_-]+$/.test(value);
}

function placeIdFromUrl(value: string) {
  try {
    const url = new URL(value);
    const queryPlaceId = url.searchParams.get("query_place_id");
    if (queryPlaceId) return queryPlaceId;
    const placeId = url.searchParams.get("place_id") || url.searchParams.get("placeid");
    if (placeId) return placeId;
    const decoded = decodeURIComponent(url.href);
    const placeIdMatch = decoded.match(/(?:place_id:|placeid=)(ChI[A-Za-z0-9_-]+)/i);
    if (placeIdMatch?.[1]) return placeIdMatch[1];
    const bangMatch = decoded.match(/!1s(ChI[A-Za-z0-9_-]+)/);
    if (bangMatch?.[1]) return bangMatch[1];
  } catch {
    return null;
  }
  return null;
}

async function resolveRedirectedUrl(value: string) {
  if (!/^https:\/\/(maps\.app\.goo\.gl|goo\.gl|g\.co)\//i.test(value)) return value;
  try {
    const response = await fetch(value, { method: "GET", redirect: "follow", cache: "no-store" });
    return response.url || value;
  } catch {
    return value;
  }
}

async function searchPlaceId(input: string, apiKey: string) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: input, languageCode: "pl", regionCode: "PL" }),
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    places?: Array<{ id?: string }>;
    error?: { message?: string };
  };
  if (!response.ok) {
    return { placeId: null, error: payload.error?.message || "Google nie znalazł tego profilu firmy." };
  }
  const placeId = payload.places?.[0]?.id ?? null;
  return {
    placeId,
    error: placeId ? null : "Google nie znalazł pasującego profilu firmy.",
  };
}

async function resolvePlaceId(input: string, apiKey: string) {
  const clean = cleanGoogleInput(input);
  if (!clean) return { placeId: null, error: "Dodaj link Google Maps albo Place ID." };
  if (isLikelyPlaceId(clean)) return { placeId: clean.replace(/^places\//, ""), error: null };

  const redirected = await resolveRedirectedUrl(clean);
  const fromUrl = placeIdFromUrl(redirected);
  if (fromUrl) return { placeId: fromUrl, error: null };

  return searchPlaceId(redirected, apiKey);
}

export async function fetchGooglePlaceSummary(
  placeInput: string
): Promise<{ data: GooglePlaceSummary | null; error: string | null }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      data: null,
      error: "Google Places nie jest jeszcze skonfigurowane. Dodaj GOOGLE_PLACES_API_KEY, aby zweryfikować profil.",
    };
  }

  try {
    const resolved = await resolvePlaceId(placeInput, apiKey);
    if (!resolved.placeId) {
      return { data: null, error: resolved.error };
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(resolved.placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri",
        },
        cache: "no-store",
      }
    );
    const payload = (await response.json()) as PlaceDetailsPayload;

    if (!response.ok) {
      return {
        data: null,
        error: payload.error?.message || "Google nie mógł zweryfikować tego Place ID.",
      };
    }

    return {
      data: {
        placeId: payload.id || resolved.placeId,
        businessUrl: payload.googleMapsUri || null,
        displayName: payload.displayName?.text || null,
        rating: typeof payload.rating === "number" ? payload.rating : null,
        reviewCount:
          typeof payload.userRatingCount === "number" ? payload.userRatingCount : null,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "Synchronizacja ocen Google jest chwilowo niedostępna." };
  }
}

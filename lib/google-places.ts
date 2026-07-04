export type GooglePlaceSummary = {
  placeId: string;
  businessUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
};

export async function fetchGooglePlaceSummary(
  placeId: string
): Promise<{ data: GooglePlaceSummary | null; error: string | null }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      data: null,
      error: "Google rating sync is not configured yet. Your Place ID was saved for the next sync.",
    };
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,rating,userRatingCount,googleMapsUri",
        },
        cache: "no-store",
      }
    );
    const payload = (await response.json()) as {
      id?: string;
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      error?: { message?: string };
    };

    if (!response.ok) {
      return {
        data: null,
        error: payload.error?.message || "Google could not verify this Place ID.",
      };
    }

    return {
      data: {
        placeId: payload.id || placeId,
        businessUrl: payload.googleMapsUri || null,
        rating: typeof payload.rating === "number" ? payload.rating : null,
        reviewCount:
          typeof payload.userRatingCount === "number" ? payload.userRatingCount : null,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "Google rating sync is temporarily unavailable." };
  }
}

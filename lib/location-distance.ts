type City = { names: string[]; lat: number; lon: number };
type Coordinates = { lat: number; lon: number };

type GoogleLocationResponse = {
  places?: Array<{
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
  }>;
};

const cities: City[] = [
  { names: ["warsaw", "warszawa"], lat: 52.2297, lon: 21.0122 },
  { names: ["piaseczno", "05-500"], lat: 52.0742, lon: 21.026 },
  { names: ["konstancin-jeziorna", "konstancin jeziorna", "05-510"], lat: 52.093, lon: 21.117 },
  { names: ["pruszkow", "pruszków", "05-800"], lat: 52.1614, lon: 20.8026 },
  { names: ["legionowo", "05-120"], lat: 52.4016, lon: 20.9464 },
  { names: ["grodzisk mazowiecki", "05-825"], lat: 52.1035, lon: 20.6347 },
  { names: ["otwock", "05-400"], lat: 52.103, lon: 21.269 },
  { names: ["zabki", "ząbki", "05-091"], lat: 52.2927, lon: 21.1054 },
  { names: ["lomianki", "łomianki", "05-092"], lat: 52.3347, lon: 20.8874 },
  { names: ["krakow", "kraków"], lat: 50.0647, lon: 19.945 },
  { names: ["lodz", "łódź"], lat: 51.7592, lon: 19.456 },
  { names: ["wroclaw", "wrocław"], lat: 51.1079, lon: 17.0385 },
  { names: ["poznan", "poznań"], lat: 52.4064, lon: 16.9252 },
  { names: ["gdansk", "gdańsk"], lat: 54.352, lon: 18.6466 },
  { names: ["szczecin"], lat: 53.4285, lon: 14.5528 },
  { names: ["lublin"], lat: 51.2465, lon: 22.5684 },
  { names: ["bydgoszcz"], lat: 53.1235, lon: 18.0084 },
  { names: ["bialystok", "białystok"], lat: 53.1325, lon: 23.1688 },
  { names: ["katowice"], lat: 50.2649, lon: 19.0238 },
  { names: ["gdynia"], lat: 54.5189, lon: 18.5305 },
  { names: ["sopot"], lat: 54.4416, lon: 18.5601 },
  { names: ["rzeszow", "rzeszów"], lat: 50.0412, lon: 21.9991 },
  { names: ["torun", "toruń"], lat: 53.0138, lon: 18.5984 },
  { names: ["kielce"], lat: 50.8661, lon: 20.6286 },
  { names: ["olsztyn"], lat: 53.7784, lon: 20.4801 },
  { names: ["opole"], lat: 50.6751, lon: 17.9213 },
  { names: ["zielona gora", "zielona góra"], lat: 51.9356, lon: 15.5062 },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function cityFor(value: string) {
  const normalized = normalize(value);
  return cities.find((city) => city.names.some((name) => normalized.includes(normalize(name)))) ?? null;
}

function distanceBetweenCoordinates(a: Coordinates, b: Coordinates) {
  if (!a || !b) return null;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)));
}

const resolvedLocationCache = new Map<string, Coordinates | null>();

async function resolveWithGoogle(value: string): Promise<Coordinates | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || value.trim().length < 2) return null;

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.location,places.formattedAddress,places.displayName",
      },
      body: JSON.stringify({
        textQuery: `${value.trim()}, Polska`,
        languageCode: "pl",
        regionCode: "PL",
      }),
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as GoogleLocationResponse;
    const place = payload.places?.[0];
    const lat = place?.location?.latitude;
    const lon = place?.location?.longitude;
    return typeof lat === "number" && typeof lon === "number" ? { lat, lon } : null;
  } catch {
    return null;
  }
}

async function resolveLocation(value: string): Promise<Coordinates | null> {
  const cacheKey = normalize(value).trim();
  if (!cacheKey) return null;

  const known = cityFor(value);
  if (known) return known;
  if (resolvedLocationCache.has(cacheKey)) return resolvedLocationCache.get(cacheKey) ?? null;

  const resolved = await resolveWithGoogle(value);
  resolvedLocationCache.set(cacheKey, resolved);
  return resolved;
}

export function distanceBetweenLocations(first: string, second: string) {
  const a = cityFor(first);
  const b = cityFor(second);
  if (!a || !b) return null;
  return distanceBetweenCoordinates(a, b);
}

export async function distanceMapFromLocation(
  origin: string,
  candidates: Array<string | null | undefined>
) {
  const resolvedOrigin = await resolveLocation(origin);
  const distances = new Map<string, number>();
  if (!resolvedOrigin) return distances;

  const uniqueCandidates = [...new Set(candidates.filter((candidate): candidate is string => Boolean(candidate?.trim())))];
  const resolvedCandidates = await Promise.all(
    uniqueCandidates.map(async (candidate) => [candidate, await resolveLocation(candidate)] as const)
  );

  for (const [candidate, coordinates] of resolvedCandidates) {
    if (!coordinates) continue;
    const distance = distanceBetweenCoordinates(resolvedOrigin, coordinates);
    if (distance !== null) distances.set(normalize(candidate), distance);
  }

  return distances;
}

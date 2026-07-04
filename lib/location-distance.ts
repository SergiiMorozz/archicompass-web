type City = { names: string[]; lat: number; lon: number };

const cities: City[] = [
  { names: ["warsaw", "warszawa"], lat: 52.2297, lon: 21.0122 },
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

export function distanceBetweenLocations(first: string, second: string) {
  const a = cityFor(first);
  const b = cityFor(second);
  if (!a || !b) return null;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)));
}

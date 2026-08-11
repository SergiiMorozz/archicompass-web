import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type LocationOption = readonly [pl: string, en: string];

const cities: LocationOption[] = [
  ["Warszawa", "Warsaw"], ["Piaseczno", "Piaseczno"], ["Pruszków", "Pruszków"], ["Legionowo", "Legionowo"], ["Otwock", "Otwock"], ["Wołomin", "Wołomin"], ["Grodzisk Mazowiecki", "Grodzisk Mazowiecki"], ["Nowy Dwór Mazowiecki", "Nowy Dwór Mazowiecki"],
  ["Kraków", "Krakow"], ["Wieliczka", "Wieliczka"], ["Skawina", "Skawina"], ["Niepołomice", "Niepołomice"], ["Tarnów", "Tarnow"], ["Nowy Sącz", "Nowy Sącz"], ["Zakopane", "Zakopane"],
  ["Wrocław", "Wroclaw"], ["Legnica", "Legnica"], ["Wałbrzych", "Walbrzych"], ["Jelenia Góra", "Jelenia Gora"], ["Lubin", "Lubin"], ["Oleśnica", "Olesnica"],
  ["Gdańsk", "Gdansk"], ["Gdynia", "Gdynia"], ["Sopot", "Sopot"], ["Pruszcz Gdański", "Pruszcz Gdanski"], ["Tczew", "Tczew"], ["Wejherowo", "Wejherowo"], ["Słupsk", "Slupsk"],
  ["Poznań", "Poznan"], ["Kalisz", "Kalisz"], ["Konin", "Konin"], ["Leszno", "Leszno"], ["Gniezno", "Gniezno"], ["Piła", "Pila"], ["Swarzędz", "Swarzedz"],
  ["Łódź", "Lodz"], ["Pabianice", "Pabianice"], ["Zgierz", "Zgierz"], ["Piotrków Trybunalski", "Piotrkow Trybunalski"], ["Bełchatów", "Belchatow"], ["Tomaszów Mazowiecki", "Tomaszow Mazowiecki"],
  ["Katowice", "Katowice"], ["Gliwice", "Gliwice"], ["Zabrze", "Zabrze"], ["Bytom", "Bytom"], ["Tychy", "Tychy"], ["Rybnik", "Rybnik"], ["Bielsko-Biała", "Bielsko-Biala"], ["Częstochowa", "Czestochowa"], ["Sosnowiec", "Sosnowiec"], ["Dąbrowa Górnicza", "Dabrowa Gornicza"], ["Chorzów", "Chorzow"],
  ["Szczecin", "Szczecin"], ["Koszalin", "Koszalin"], ["Świnoujście", "Swinoujscie"], ["Stargard", "Stargard"],
  ["Lublin", "Lublin"], ["Zamość", "Zamosc"], ["Chełm", "Chelm"], ["Biała Podlaska", "Biala Podlaska"], ["Puławy", "Pulawy"],
  ["Białystok", "Bialystok"], ["Suwałki", "Suwalki"], ["Łomża", "Lomza"], ["Augustów", "Augustow"],
  ["Rzeszów", "Rzeszow"], ["Krosno", "Krosno"], ["Przemyśl", "Przemysl"], ["Stalowa Wola", "Stalowa Wola"], ["Mielec", "Mielec"], ["Tarnobrzeg", "Tarnobrzeg"],
  ["Kielce", "Kielce"], ["Ostrowiec Świętokrzyski", "Ostrowiec Swietokrzyski"], ["Sandomierz", "Sandomierz"], ["Starachowice", "Starachowice"],
  ["Bydgoszcz", "Bydgoszcz"], ["Toruń", "Torun"], ["Włocławek", "Wloclawek"], ["Grudziądz", "Grudziadz"], ["Inowrocław", "Inowroclaw"], ["Brodnica", "Brodnica"],
  ["Olsztyn", "Olsztyn"], ["Elbląg", "Elblag"], ["Ełk", "Elk"], ["Iława", "Ilawa"], ["Giżycko", "Gizycko"],
  ["Opole", "Opole"], ["Nysa", "Nysa"], ["Kędzierzyn-Koźle", "Kedzierzyn-Kozle"], ["Brzeg", "Brzeg"],
  ["Zielona Góra", "Zielona Gora"], ["Gorzów Wielkopolski", "Gorzow Wielkopolski"], ["Nowa Sól", "Nowa Sol"], ["Żary", "Zary"],
  ["Radom", "Radom"], ["Płock", "Plock"], ["Siedlce", "Siedlce"], ["Ciechanów", "Ciechanow"], ["Ostrołęka", "Ostroleka"], ["Żyrardów", "Zyrardow"],
];

export const polishLocationOptions = cities.map((city) => `${city[0]}, Polska`);

export function locationOptions(locale: SiteLocale = siteLocale) {
  return cities.map((city) => `${city[locale === "pl" ? 0 : 1]}, ${locale === "pl" ? "Polska" : "Poland"}`);
}

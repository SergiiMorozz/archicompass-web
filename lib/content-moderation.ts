const blockedPatterns = [
  /\b(?:fuck|fucking|shit|bitch|cunt|asshole|motherfucker)\b/i,
  /\b(?:kurw[a-ząćęłńóśźż]*|chuj[a-ząćęłńóśźż]*|pierd[a-ząćęłńóśźż]*|jeb[a-ząćęłńóśźż]*|skurw[a-ząćęłńóśźż]*|spierdal[a-ząćęłńóśźż]*)\b/i,
  /\b(?:хуй|хуе|пизд|ебат|ёбат|бляд|сука)\w*/iu,
  /\b(?:хуй|хує|пизд|їбат|єбат|бляд|сука)\w*/iu,
];

const placeholderPatterns = [
  /\b(?:lorem ipsum|asdf|qwerty|text opis|studio name|unnamed professional)\b/i,
];

const repeatedLinkPattern = /(?:https?:\/\/|www\.)/gi;

const messages = {
  pl: {
    offensive: "Usuń obraźliwe słowa przed publikacją tekstu.",
    placeholder: "Uzupełnij tekst docelową treścią zamiast placeholderów lub testowych wpisów.",
    links: "Usuń nadmiarowe linki promocyjne przed publikacją tekstu.",
  },
  en: {
    offensive: "Remove offensive language before publishing this text.",
    placeholder: "Replace placeholders or test content with final text before publishing.",
    links: "Remove excessive promotional links before publishing this text.",
  },
} as const;

export function publicTextError(
  values: Array<string | null | undefined>,
  locale: SiteLocale = siteLocale
) {
  const copy = messages[locale];
  const text = values.filter(Boolean).join(" \n ");
  if (!text) return null;

  if (blockedPatterns.some((pattern) => pattern.test(text))) {
    return copy.offensive;
  }

  if (placeholderPatterns.some((pattern) => pattern.test(text))) {
    return copy.placeholder;
  }

  if ((text.match(repeatedLinkPattern) ?? []).length > 3) {
    return copy.links;
  }

  return null;
}
import { siteLocale, type SiteLocale } from "@/lib/site-locale";

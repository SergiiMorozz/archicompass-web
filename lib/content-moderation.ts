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

export function publicTextError(values: Array<string | null | undefined>) {
  const text = values.filter(Boolean).join(" \n ");
  if (!text) return null;

  if (blockedPatterns.some((pattern) => pattern.test(text))) {
    return "Usuń obraźliwe słowa przed publikacją tekstu.";
  }

  if (placeholderPatterns.some((pattern) => pattern.test(text))) {
    return "Uzupełnij tekst docelową treścią zamiast placeholderów lub testowych wpisów.";
  }

  if ((text.match(repeatedLinkPattern) ?? []).length > 3) {
    return "Usuń nadmiarowe linki promocyjne przed publikacją tekstu.";
  }

  return null;
}

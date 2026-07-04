const blockedPatterns = [
  /\b(?:fuck|fucking|shit|bitch|cunt|asshole)\b/i,
  /\b(?:kurwa|chuj|pierdoli|jeb[a-ząćęłńóśźż]*)\b/i,
  /\b(?:хуй|хуе|пизд|ебат|ёбат|бляд|сука)\w*/iu,
  /\b(?:хуй|хує|пизд|їбат|єбат|бляд|сука)\w*/iu,
];

const repeatedLinkPattern = /(?:https?:\/\/|www\.)/gi;

export function publicTextError(values: Array<string | null | undefined>) {
  const text = values.filter(Boolean).join(" \n ");
  if (!text) return null;

  if (blockedPatterns.some((pattern) => pattern.test(text))) {
    return "Please remove offensive language before publishing this text.";
  }

  if ((text.match(repeatedLinkPattern) ?? []).length > 3) {
    return "Please remove repeated promotional links before publishing this text.";
  }

  return null;
}

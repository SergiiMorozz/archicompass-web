import type { SiteLocale } from "@/lib/site-locale";

type CountWords = {
  singular: string;
  plural: string;
  few?: string;
};

export function localizedCount(locale: SiteLocale, count: number, words: CountWords) {
  if (locale !== "pl") {
    return `${count} ${count === 1 ? words.singular : words.plural}`;
  }

  const absolute = Math.abs(count);
  const lastTwo = absolute % 100;
  const last = absolute % 10;
  const noun = absolute === 1
    ? words.singular
    : last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)
      ? (words.few || words.plural)
      : words.plural;

  return `${count} ${noun}`;
}

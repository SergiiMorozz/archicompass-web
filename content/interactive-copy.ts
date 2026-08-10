import { siteLocale, type SiteLocale } from "@/lib/site-locale";
import { polishPlural } from "@/lib/polish-plural";

type InteractiveCopy = {
  favorite: {
    save: string;
    saved: string;
    saving: string;
    addTitle: string;
    removeTitle: string;
    updateError: string;
    authRequired: string;
    invalidRequest: string;
    invalidFavorite: string;
    unavailable: string;
    rateLimited: string;
  };
  googleRating: {
    reviewCount: (count: number) => string;
    verified: string;
  };
  social: {
    profileLinks: string;
  };
  referencePhotos: {
    defaultTitle: string;
    photoCount: (count: number) => string;
    openFullSize: (name: string) => string;
    imageAlt: (title: string, index: number, name: string) => string;
    caption: (name: string) => string;
  };
  conversation: {
    openAttachment: string;
    autoRefresh: string;
  };
};

const interactiveCopy: Record<SiteLocale, InteractiveCopy> = {
  pl: {
    favorite: {
      save: "Zapisz",
      saved: "Zapisano",
      saving: "Zapisywanie...",
      addTitle: "Dodaj do ulubionych",
      removeTitle: "Usuń z ulubionych",
      updateError: "Nie udało się zaktualizować ulubionych.",
      authRequired: "Zaloguj się, aby zapisywać ulubione.",
      invalidRequest: "Nieprawidłowe żądanie zapisu ulubionych.",
      invalidFavorite: "Nieprawidłowy element ulubionych.",
      unavailable: "Ten element nie jest już dostępny.",
      rateLimited: "Osiągnięto dzienny limit zapisywania ulubionych. Spróbuj ponownie jutro.",
    },
    googleRating: {
      reviewCount: (count) => `${count} ${polishPlural(count, "opinia", "opinie", "opinii")} Google`,
      verified: "zweryfikowano",
    },
    social: { profileLinks: "Linki społecznościowe profilu" },
    referencePhotos: {
      defaultTitle: "Zdjęcia referencyjne",
      photoCount: (count) => `${count} ${polishPlural(count, "zdjęcie", "zdjęcia", "zdjęć")}`,
      openFullSize: (name) => `Otwórz ${name} w pełnym rozmiarze`,
      imageAlt: (title, index, name) => `${title} ${index}: ${name}`,
      caption: (name) => `${name} - otwórz pełny rozmiar`,
    },
    conversation: { openAttachment: "Otwórz", autoRefresh: "Odświeżane automatycznie" },
  },
  en: {
    favorite: {
      save: "Save",
      saved: "Saved",
      saving: "Saving...",
      addTitle: "Add to favourites",
      removeTitle: "Remove from favourites",
      updateError: "Your favourites could not be updated.",
      authRequired: "Sign in to save favourites.",
      invalidRequest: "The favourites request is invalid.",
      invalidFavorite: "This favourite item is invalid.",
      unavailable: "This item is no longer available.",
      rateLimited: "You've reached today's limit for saving favourites. Please try again tomorrow.",
    },
    googleRating: {
      reviewCount: (count) => `${count} Google ${count === 1 ? "review" : "reviews"}`,
      verified: "verified",
    },
    social: { profileLinks: "Profile social links" },
    referencePhotos: {
      defaultTitle: "Reference photos",
      photoCount: (count) => `${count} ${count === 1 ? "photo" : "photos"}`,
      openFullSize: (name) => `Open ${name} at full size`,
      imageAlt: (title, index, name) => `${title} ${index}: ${name}`,
      caption: (name) => `${name} - open full size`,
    },
    conversation: { openAttachment: "Open", autoRefresh: "Updates automatically" },
  },
};

export function getInteractiveCopy(locale: SiteLocale = siteLocale) {
  return interactiveCopy[locale];
}

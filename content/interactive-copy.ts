import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type InteractiveCopy = {
  favorite: {
    save: string;
    saved: string;
    saving: string;
    addTitle: string;
    removeTitle: string;
    updateError: string;
  };
  googleRating: {
    reviewCount: (count: number) => string;
    verified: string;
  };
  social: {
    profileLinks: string;
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
    },
    googleRating: {
      reviewCount: (count) => `${count} ${count === 1 ? "opinia" : count < 5 ? "opinie" : "opinii"} Google`,
      verified: "zweryfikowano",
    },
    social: { profileLinks: "Linki społecznościowe profilu" },
  },
  en: {
    favorite: {
      save: "Save",
      saved: "Saved",
      saving: "Saving...",
      addTitle: "Add to favourites",
      removeTitle: "Remove from favourites",
      updateError: "Your favourites could not be updated.",
    },
    googleRating: {
      reviewCount: (count) => `${count} Google ${count === 1 ? "review" : "reviews"}`,
      verified: "verified",
    },
    social: { profileLinks: "Profile social links" },
  },
};

export function getInteractiveCopy(locale: SiteLocale = siteLocale) {
  return interactiveCopy[locale];
}

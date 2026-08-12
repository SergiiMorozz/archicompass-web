"use client";

import { useMemo, useState } from "react";
import { pricingModels, pricingModelLabel } from "@/lib/profile-pricing";
import type { ServiceOffering } from "@/lib/professional-profile-details";
import { siteLocale } from "@/lib/site-locale";

type ServiceOfferingsEditorProps = {
  initialValue?: ServiceOffering[] | null;
};

const fieldClass =
  "mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm font-normal text-foreground outline-none transition focus:border-primary";

const labels = siteLocale === "pl"
  ? {
      add: "Dodaj usługę lub pakiet",
      remove: "Usuń",
      empty: "Nie dodano jeszcze usług z indywidualnymi cenami.",
      titlePl: "Nazwa po polsku",
      titleEn: "Name in English",
      descriptionPl: "Opis po polsku",
      descriptionEn: "Description in English",
      model: "Model rozliczenia",
      from: "Cena od",
      to: "Cena do",
      priceHint: "PLN",
    }
  : {
      add: "Add a service or package",
      remove: "Remove",
      empty: "No individually priced services have been added yet.",
      titlePl: "Name in Polish",
      titleEn: "Name in English",
      descriptionPl: "Description in Polish",
      descriptionEn: "Description in English",
      model: "Pricing model",
      from: "Price from",
      to: "Price to",
      priceHint: "PLN",
    };

function emptyOffer(): ServiceOffering {
  return { pricing_model: "Fixed package" };
}

export default function ServiceOfferingsEditor({ initialValue }: ServiceOfferingsEditorProps) {
  const [offers, setOffers] = useState<ServiceOffering[]>(initialValue?.slice(0, 8) ?? []);
  const serialized = useMemo(() => JSON.stringify(offers), [offers]);

  function update(index: number, patch: Partial<ServiceOffering>) {
    setOffers((current) => current.map((offer, itemIndex) => itemIndex === index ? { ...offer, ...patch } : offer));
  }

  return (
    <div className="grid gap-4">
      <input type="hidden" name="service_offerings" value={serialized} readOnly />
      {offers.length ? offers.map((offer, index) => (
        <div key={index} className="rounded-xl border border-line bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold text-primary">{index + 1}</div>
            <button
              type="button"
              onClick={() => setOffers((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
            >
              {labels.remove}
            </button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">{labels.titlePl}<input value={offer.title_pl ?? ""} onChange={(event) => update(index, { title_pl: event.target.value })} className={fieldClass} /></label>
            <label className="text-xs font-semibold">{labels.titleEn}<input value={offer.title_en ?? ""} onChange={(event) => update(index, { title_en: event.target.value })} className={fieldClass} /></label>
            <label className="text-xs font-semibold">{labels.descriptionPl}<textarea value={offer.description_pl ?? ""} onChange={(event) => update(index, { description_pl: event.target.value })} rows={3} className={fieldClass} /></label>
            <label className="text-xs font-semibold">{labels.descriptionEn}<textarea value={offer.description_en ?? ""} onChange={(event) => update(index, { description_en: event.target.value })} rows={3} className={fieldClass} /></label>
            <label className="text-xs font-semibold">{labels.model}<select value={offer.pricing_model ?? ""} onChange={(event) => update(index, { pricing_model: event.target.value as ServiceOffering["pricing_model"] })} className={fieldClass}>{pricingModels.map((model) => <option key={model} value={model}>{pricingModelLabel(model)}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold">{labels.from}<input inputMode="numeric" value={offer.price_from ?? ""} onChange={(event) => update(index, { price_from: event.target.value ? Number(event.target.value) : null })} className={fieldClass} placeholder={labels.priceHint} /></label>
              <label className="text-xs font-semibold">{labels.to}<input inputMode="numeric" value={offer.price_to ?? ""} onChange={(event) => update(index, { price_to: event.target.value ? Number(event.target.value) : null })} className={fieldClass} placeholder={labels.priceHint} /></label>
            </div>
          </div>
        </div>
      )) : <div className="rounded-xl border border-dashed border-line bg-background px-4 py-3 text-sm text-muted">{labels.empty}</div>}
      <button
        type="button"
        disabled={offers.length >= 8}
        onClick={() => setOffers((current) => [...current, emptyOffer()])}
        className="w-fit rounded-xl border border-primary/30 bg-primary-soft px-4 py-3 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        + {labels.add}
      </button>
    </div>
  );
}

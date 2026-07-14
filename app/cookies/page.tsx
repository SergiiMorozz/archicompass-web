import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Polityka cookies",
  description: "Jak ArchiCompass wykorzystuje niezbędne pliki cookies i pamięć przeglądarki.",
  path: "/cookies",
});

const sections = [
  {
    title: "Niezbędne uwierzytelnianie i bezpieczeństwo",
    body: "ArchiCompass i Supabase używają plików cookies i podobnych mechanizmów, aby utrzymywać zalogowanie, chronić sesje, przeprowadzać uwierzytelnianie, zapobiegać nadużyciom i stosować uprawnienia konta. Technologie te są konieczne do działania funkcji konta.",
  },
  {
    title: "Preferencje i zapisywanie stanu pracy",
    body: "Przeglądarka może zapisywać język, ustawienia interfejsu, stan AI Project Compass, podgląd przesyłanych plików i formularzy, aby nawigacja działała spójnie. Część danych tymczasowych jest usuwana po zamknięciu karty lub zakończeniu sesji.",
  },
  {
    title: "Ograniczone statystyki",
    body: "Losowy identyfikator karty przeglądarki może służyć do ograniczania podwójnego zliczania wyświetleń profili. Nie jest przeznaczony do identyfikowania odwiedzającego według imienia ani adresu e-mail. ArchiCompass obecnie nie używa reklamowych plików cookies podmiotów trzecich ani nie sprzedaje danych o przeglądaniu.",
  },
  {
    title: "Zarządzanie pamięcią",
    body: "Możesz usunąć lub zablokować pliki cookies i dane witryny w ustawieniach przeglądarki. Zablokowanie niezbędnej pamięci może spowodować wylogowanie lub uniemożliwić prawidłowe działanie konta, przesyłania plików, wiadomości, ulubionych i zabezpieczeń.",
  },
  {
    title: "Aktualizacje i kontakt",
    body: "Zaktualizujemy tę politykę, jeżeli wprowadzimy analityczne, reklamowe lub inne nieobowiązkowe zastosowania plików cookies. Pytania można wysyłać na contact@archicompass.pl.",
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">Informacje prawne</p>
      <h1 className="mt-3 text-4xl font-bold">Polityka cookies</h1>
      <p className="mt-3 text-sm text-muted">Obowiązuje od: 6 lipca 2026 r.</p>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
        Ta polityka wyjaśnia, jakich plików cookies i mechanizmów pamięci przeglądarki używa ArchiCompass.
      </p>
      <div className="mt-10 grid gap-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mt-3 text-base leading-8 text-muted">{section.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap gap-4 text-sm font-semibold text-primary">
        <Link href="/privacy" className="hover:underline">Polityka prywatności</Link>
        <Link href="/terms" className="hover:underline">Regulamin</Link>
        <a href="mailto:contact@archicompass.pl" className="hover:underline">Kontakt z ArchiCompass</a>
      </div>
      <p className="mt-6 text-sm leading-6 text-muted">
        Operatorem ArchiCompass jest SM Advisory, Sergii Moroz · NIP 5252995634 · REGON 528006413 · ul. Grzybowska 2, lok. 31, 00-131 Warszawa, Polska.
      </p>
    </main>
  );
}

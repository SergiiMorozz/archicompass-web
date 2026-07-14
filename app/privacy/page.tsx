import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Polityka prywatności",
  description: "Jak ArchiCompass przetwarza dane kont, profili, projektów, wiadomości, zdjęć, statystyk i funkcji AI.",
  path: "/privacy",
});

const sections = [
  {
    title: "1. Administrator danych i kontakt",
    body: [
      "ArchiCompass jest platformą internetową prowadzoną przez SM Advisory, Sergii Moroz, ul. Grzybowska 2, lok. 31, 00-131 Warszawa, NIP 5252995634, REGON 528006413 (dalej: „ArchiCompass”, „my”). SM Advisory jest administratorem danych osobowych przetwarzanych w związku z działaniem platformy, o ile przy konkretnej usłudze nie wskazano innego administratora.",
      "Wnioski dotyczące prywatności i realizacji praw można wysyłać na contact@archicompass.pl. Zgłoszenia dotyczące bezpieczeństwa należy kierować na admin@archicompass.pl.",
    ],
  },
  {
    title: "2. Jakie dane przetwarzamy",
    body: [
      "Przetwarzamy dane przekazywane przez użytkownika, w tym adres e-mail i dane uwierzytelniające, rolę konta, informacje profilowe i portfolio, firmowe dane kontaktowe, briefy projektowe, ulubione elementy, wiadomości, statusy zapytań, zdjęcia projektów, zdjęcia referencyjne i zgłoszenia do obsługi.",
      "Przetwarzamy również dane techniczne niezbędne do działania i ochrony usługi, takie jak znaczniki czasu, adres IP, informacje o przeglądarce i urządzeniu, zdarzenia logowania, rejestry błędów oraz ograniczone statystyki użycia. Publiczne dane profesjonalistów mogą obejmować link do profilu Google Business, ocenę i liczbę opinii.",
      "Nie przesyłaj dokumentów tożsamości, danych kart płatniczych, prywatnych adresów, poufnych planów, zdjęć osób bez ich zgody ani danych szczególnych kategorii, chyba że dana funkcja wyraźnie tego wymaga i masz podstawę prawną do ich udostępnienia.",
    ],
  },
  {
    title: "3. Cele i podstawy prawne",
    body: [
      "Przetwarzamy dane w celu tworzenia i zabezpieczania kont, publikowania profili i portfolio, zapisywania briefów, dopasowywania projektantów, obsługi zapytań i rozmów, wysyłania powiadomień, świadczenia pomocy, zapobiegania nadużyciom, utrzymania usługi oraz wykonania obowiązków prawnych.",
      "Podstawa prawna zależy od rodzaju działania: wykonanie żądanej usługi lub podjęcie działań przed zawarciem umowy, obowiązek prawny, zgoda przy funkcjach opcjonalnych albo nasz prawnie uzasadniony interes polegający na prowadzeniu, zabezpieczaniu, rozwijaniu i mierzeniu platformy. Jeżeli przetwarzanie opiera się na zgodzie, można ją wycofać w dowolnym momencie.",
    ],
  },
  {
    title: "4. Profile publiczne i prywatne strefy",
    body: [
      "Dane profilu projektanta, informacje o pracowni, projekty portfolio, publiczne oceny i publiczne linki do realizacji są przeznaczone do publikacji w internecie i mogą być indeksowane przez wyszukiwarki.",
      "Zapisane briefy, prywatne zdjęcia referencyjne, ulubione elementy, dane konta i rozmowy pozostają prywatne, dopóki użytkownik nie zdecyduje się ich wysłać lub udostępnić. Projektant, który otrzyma brief, może zobaczyć jego treść, wiadomość, przekazane dane kontaktowe i czasowe linki do zdjęć referencyjnych.",
      "Wiadomości są dostępne dla klienta oraz projektanta lub pracowni uczestniczącej w zapytaniu. Upoważnieni członkowie pracowni mogą uzyskać dostęp do zapytań skierowanych do tej pracowni.",
    ],
  },
  {
    title: "5. Zdjęcia i analiza AI",
    body: [
      "Podgląd zdjęć referencyjnych pozostaje w przeglądarce do czasu zapisania briefu lub uruchomienia analizy. Po wybraniu analizy AI wskazane obrazy i powiązany kontekst projektu są przekazywane skonfigurowanemu dostawcy AI w celu rozpoznania cech wizualnych i przygotowania wskazówek stylistycznych.",
      "Zapisane zdjęcia referencyjne są przechowywane prywatnie w Supabase Storage. Użytkownik i projektanci, którzy otrzymają powiązany brief, mogą je otwierać poprzez czasowe, podpisane linki. Zdjęcia portfolio przesłane przez profesjonalistów są publiczne.",
      "Wynik AI może być niepełny lub błędny. Ma charakter informacyjny i nie zastępuje profesjonalnej porady projektowej, budowlanej, technicznej, prawnej ani finansowej.",
    ],
  },
  {
    title: "6. Statystyki i komunikacja",
    body: [
      "ArchiCompass zapisuje ograniczone statystyki wyświetleń profilu z użyciem losowego identyfikatora karty przeglądarki, aby ograniczyć podwójne zliczanie. Rekord wyświetlenia nie zawiera imienia ani adresu e-mail odwiedzającego. Właściciele profili mogą zobaczyć zbiorcze statystyki w Studio projektanta.",
      "Wysyłamy wiadomości usługowe dotyczące aktywności konta, nowych briefów, wiadomości, przypomnień o nieprzeczytanych wiadomościach, bezpieczeństwa i istotnych zmian usługi. Są one niezbędne do świadczenia platformy i nie stanowią komunikacji marketingowej.",
    ],
  },
  {
    title: "7. Dostawcy usług i transfer danych",
    body: [
      "Korzystamy z Supabase do uwierzytelniania, bazy danych i przechowywania plików; z Vercel do hostingu i dostarczania serwisu; z home.pl do obsługi poczty domenowej; oraz ze skonfigurowanych dostawców AI, takich jak Google Gemini lub OpenAI, do opcjonalnej analizy obrazów. Usługi Google mogą służyć do wyświetlania lub synchronizacji publicznych ocen firm.",
      "Dostawcy przetwarzają dane na podstawie własnych warunków umownych i zabezpieczeń. Jeżeli dane są przekazywane poza Europejski Obszar Gospodarczy, stosujemy odpowiednią decyzję stwierdzającą adekwatność, standardowe klauzule umowne lub inny zgodny z prawem mechanizm transferu.",
    ],
  },
  {
    title: "8. Pliki cookies i pamięć przeglądarki",
    body: [
      "Platforma wykorzystuje pliki cookies i pamięć przeglądarki niezbędne do logowania, bezpieczeństwa, ustawień języka i interfejsu oraz zapisywania stanu formularzy. Obecnie nie używamy reklamowych plików cookies. Szczegóły opisuje Polityka cookies.",
    ],
  },
  {
    title: "9. Okres przechowywania i usuwanie",
    body: [
      "Dane konta, profilu, projektów, briefów, ulubionych elementów i zapytań przechowujemy przez okres aktywności konta lub tak długo, jak jest to potrzebne do realizacji wybranej funkcji. Obsługiwane projekty, zdjęcia, niewysłane briefy i konto można usunąć za pomocą dostępnych opcji albo kontaktując się z nami.",
      "Możemy zachować ograniczone dane dla celów bezpieczeństwa, przeciwdziałania nadużyciom, obsługi sporów, wykonania obowiązków prawnych i odtwarzania kopii zapasowych. Kopie i logi są usuwane lub nadpisywane zgodnie z harmonogramami retencji. Kopie w wyszukiwarkach mogą być widoczne jeszcze przez pewien czas po usunięciu treści z ArchiCompass.",
    ],
  },
  {
    title: "10. Prawa użytkownika",
    body: [
      "Na zasadach określonych w obowiązującym prawie możesz żądać dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia lub informacji o przetwarzaniu; wnieść sprzeciw wobec przetwarzania opartego na prawnie uzasadnionym interesie; oraz wycofać zgodę, gdy jest ona podstawą przetwarzania. Przed realizacją wniosku możemy zweryfikować tożsamość.",
      "Możesz wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (UODO) w Polsce lub innego właściwego organu nadzorczego. ArchiCompass nie podejmuje decyzji wywołujących skutki prawne lub podobnie istotne wyłącznie w sposób zautomatyzowany.",
    ],
  },
  {
    title: "11. Osoby małoletnie i zmiany polityki",
    body: [
      "Konta ArchiCompass są przeznaczone dla osób, które ukończyły 18 lat. Możemy aktualizować tę politykę wraz ze zmianami usługi, dostawców lub wymogów prawnych. Aktualna wersja i data jej obowiązywania będą dostępne na tej stronie.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">Informacje prawne</p>
      <h1 className="mt-3 text-4xl font-bold">Polityka prywatności</h1>
      <p className="mt-3 text-sm text-muted">Obowiązuje od: 6 lipca 2026 r.</p>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
        Niniejsza polityka wyjaśnia, jak ArchiCompass przetwarza dane osobowe w kontach
        klientów, profilach profesjonalistów, AI Project Compass, zapytaniach, wiadomościach
        i pozostałych usługach platformy.
      </p>

      <div className="mt-10 grid gap-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <div className="mt-3 grid gap-3 text-base leading-8 text-muted">
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-line bg-card p-6">
        <h2 className="text-xl font-bold">Kontakt i dodatkowe informacje</h2>
        <p className="mt-2 leading-7 text-muted">
          W sprawach dotyczących prywatności napisz na <a href="mailto:contact@archicompass.pl" className="font-semibold text-primary hover:underline">contact@archicompass.pl</a>.
          Na zweryfikowane wnioski odpowiadamy w terminie wymaganym przez obowiązujące prawo.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          SM Advisory, Sergii Moroz · NIP 5252995634 · REGON 528006413 · ul. Grzybowska 2, lok. 31, 00-131 Warszawa, Polska
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <Link href="/terms" className="hover:underline">Regulamin</Link>
          <Link href="/cookies" className="hover:underline">Polityka cookies</Link>
          <a href="https://uodo.gov.pl/" target="_blank" rel="noreferrer" className="hover:underline">Urząd Ochrony Danych Osobowych</a>
        </div>
      </div>
    </main>
  );
}

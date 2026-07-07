import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Regulamin",
  description: "Zasady korzystania z kont, briefów, profili, portfolio, wiadomości, dopasowań i funkcji AI w ArchiCompass.",
  path: "/terms",
});

const sections = [
  {
    title: "1. Usługa i akceptacja regulaminu",
    body: "ArchiCompass jest platformą internetową prowadzoną przez SM Advisory, Sergii Moroz, ul. Grzybowska 2, lok. 31, 00-131 Warszawa, NIP 5252995634, REGON 528006413. Platforma umożliwia tworzenie briefów wnętrzarskich, wyszukiwanie projektantów i pracowni, publikację portfolio oraz obsługę zapytań projektowych. Tworząc konto lub korzystając z platformy, akceptujesz niniejszy Regulamin i Politykę prywatności.",
  },
  {
    title: "2. Warunki korzystania i konta",
    body: "Musisz mieć co najmniej 18 lat i zdolność do zaakceptowania Regulaminu. Używaj własnego adresu e-mail, podawaj prawdziwe dane, chroń hasło i aktualizuj istotne informacje. Jedno konto może mieć jedną główną rolę: klienta albo profesjonalisty. Odpowiadasz za działania wykonywane za pomocą swojego konta.",
  },
  {
    title: "3. Klienci, profesjonaliści i pracownie",
    body: "Klient sam decyduje, z którymi specjalistami się kontaktuje i komu zleca usługę. Projektanci, architekci i pracownie są niezależnymi usługodawcami, a nie pracownikami ani przedstawicielami ArchiCompass. Odpowiadają za kwalifikacje, uprawnienia, oświadczenia, ceny, dostępność, zakres usług, umowy, podatki, ubezpieczenie oraz zgodność z prawem zawodowym i konsumenckim. Właściciel pracowni odpowiada za dostęp członków zespołu do wspólnych zapytań i treści.",
  },
  {
    title: "4. Rola platformy",
    body: "ArchiCompass ułatwia użytkownikom wyszukiwanie i komunikację, ale nie jest stroną umów dotyczących projektowania, architektury, robót budowlanych, płatności ani innych umów zawieranych między użytkownikami. Profil, wynik dopasowania, ocena, oznaczenie lub pozycja w wynikach nie stanowią rekomendacji, certyfikacji ani gwarancji jakości, dostępności, ceny lub rezultatu. Przed zleceniem usługi zweryfikuj tożsamość, kwalifikacje, ubezpieczenie, zakres i umowę specjalisty.",
  },
  {
    title: "5. Treści użytkownika",
    body: "Zachowujesz prawa do przesłanych treści. Udzielasz ArchiCompass niewyłącznej, ogólnoświatowej i nieodpłatnej licencji na hosting, przechowywanie, przetwarzanie, zmianę rozmiaru, powielanie, wyświetlanie i przesyłanie tych treści wyłącznie w zakresie koniecznym do działania, zabezpieczenia, promocji i rozwoju platformy oraz wybranych funkcji. Publiczne profile i portfolio mogą być prezentowane w wynikach wyszukiwania i materiałach promujących platformę. Potwierdzasz posiadanie wszystkich praw i zgód wymaganych do publikacji przekazanych treści.",
  },
  {
    title: "6. Funkcje AI i dopasowanie",
    body: "Analiza zdjęć AI i wyniki dopasowania są narzędziami informacyjnymi opartymi na danych dostępnych platformie. Wyniki mogą być niedokładne, niepełne lub nieodpowiednie dla konkretnej inwestycji. Nie zastępują profesjonalnej porady projektowej, architektonicznej, inżynieryjnej, budowlanej, technicznej, prawnej, podatkowej ani finansowej. Użytkownik odpowiada za decyzje podjęte na ich podstawie.",
  },
  {
    title: "7. Oceny i informacje zewnętrzne",
    body: "Publiczne oceny, liczby opinii, dane firmowe i linki zewnętrzne mogą pochodzić od użytkowników lub usług podmiotów trzecich, takich jak Google. Ich dostępność i dokładność mogą się zmieniać. Zabronione jest manipulowanie ocenami, publikowanie fałszywych informacji oraz podszywanie się pod inną osobę lub firmę.",
  },
  {
    title: "8. Dozwolone korzystanie",
    body: "Nie wolno podejmować prób nieuprawnionego dostępu, przesyłać złośliwego oprogramowania lub treści niezgodnych z prawem, naruszać praw własności intelektualnej lub prywatności, podszywać się pod innych, automatycznie pobierać lub odsprzedawać danych platformy, omijać zabezpieczeń, wysyłać spamu, nękać użytkowników, publikować treści dyskryminujących lub wprowadzających w błąd ani korzystać z ArchiCompass niezgodnie z prawem. Dane kontaktowe uzyskane przez platformę mogą być używane wyłącznie do uzasadnionej komunikacji projektowej.",
  },
  {
    title: "9. Opłaty",
    body: "Obecnie dostępne funkcje kont i dopasowania są oferowane bez opłaty platformowej i prowizji. W przyszłości mogą zostać wprowadzone płatne subskrypcje, promowane pozycje, prowizje lub inne usługi. Cena, okres rozliczeniowy i dodatkowe warunki zostaną przedstawione przed zakupem lub aktywacją płatnej usługi.",
  },
  {
    title: "10. Dostępność i zmiany",
    body: "Dążymy do zapewnienia dostępności i bezpieczeństwa ArchiCompass, ale nie gwarantujemy nieprzerwanego dostępu, działania bez błędów, trwałego przechowywania, konkretnego dopasowania, odpowiedzi profesjonalisty ani powodzenia projektu. Funkcje mogą być aktualizowane, zastępowane lub wycofywane z powodów operacyjnych, bezpieczeństwa, prawnych lub produktowych. Zachowuj własne kopie ważnych briefów, planów, zdjęć, umów i wiadomości.",
  },
  {
    title: "11. Ograniczenie dostępu i usuwanie",
    body: "Możemy ograniczyć lub zawiesić dostęp w celu ochrony użytkowników lub platformy, zbadania nadużycia, wykonania obowiązków prawnych albo egzekwowania Regulaminu. Obsługiwane treści i konto można usuwać za pomocą dostępnych funkcji. Niektóre dane mogą być zachowane ze względów bezpieczeństwa, obsługi sporów, obowiązków prawnych lub odtwarzania kopii zapasowych, zgodnie z Polityką prywatności.",
  },
  {
    title: "12. Własność intelektualna",
    body: "Nazwa ArchiCompass, identyfikacja wizualna, interfejs, oprogramowanie, oryginalne treści platformy i powiązane prawa własności intelektualnej należą do ArchiCompass lub jego licencjodawców. Regulamin nie zezwala na ich kopiowanie, analizę wsteczną, powielanie ani komercyjne wykorzystywanie, z wyjątkiem przypadków dozwolonych prawem lub pisemną zgodą.",
  },
  {
    title: "13. Odpowiedzialność",
    body: "W maksymalnym zakresie dozwolonym przez prawo ArchiCompass nie odpowiada za treści użytkowników, usługi profesjonalistów, działania podmiotów trzecich, strony zewnętrzne ani pośrednie szkody wynikające z projektów realizowanych między użytkownikami. Regulamin nie wyłącza odpowiedzialności ani praw konsumenta, których zgodnie z prawem nie można wyłączyć lub ograniczyć.",
  },
  {
    title: "14. Prawo właściwe i spory",
    body: "Regulamin podlega prawu polskiemu, bez pozbawiania konsumentów bezwzględnie obowiązującej ochrony wynikającej z prawa ich miejsca zwykłego pobytu. W pierwszej kolejności prosimy o kontakt w celu polubownego rozwiązania problemu. Użytkownik może również skorzystać z właściwego organu ochrony konsumentów, organu nadzorczego lub sądu dostępnego na podstawie obowiązującego prawa.",
  },
  {
    title: "15. Zmiany i kontakt",
    body: "Możemy aktualizować Regulamin w związku ze zmianami usługi, prawa lub bezpieczeństwa. O istotnych zmianach poinformujemy przez platformę lub e-mail, gdy będzie to właściwe. Pytania dotyczące Regulaminu można wysyłać na contact@archicompass.pl, a zgłoszenia dotyczące bezpieczeństwa i nadużyć na admin@archicompass.pl.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">Informacje prawne</p>
      <h1 className="mt-3 text-4xl font-bold">Regulamin</h1>
      <p className="mt-3 text-sm text-muted">Obowiązuje od: 6 lipca 2026 r.</p>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
        Regulamin określa zasady korzystania z ArchiCompass przez klientów, niezależnych
        profesjonalistów, członków pracowni i odwiedzających.
      </p>

      <div className="mt-10 grid gap-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mt-3 text-base leading-8 text-muted">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-line bg-card p-6">
        <h2 className="text-xl font-bold">Pytania i zgłoszenia</h2>
        <p className="mt-2 leading-7 text-muted">
          Pytania ogólne kieruj na <a href="mailto:contact@archicompass.pl" className="font-semibold text-primary hover:underline">contact@archicompass.pl</a>, a zgłoszenia dotyczące bezpieczeństwa i nadużyć na <a href="mailto:admin@archicompass.pl" className="font-semibold text-primary hover:underline">admin@archicompass.pl</a>.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          SM Advisory, Sergii Moroz · NIP 5252995634 · REGON 528006413 · ul. Grzybowska 2, lok. 31, 00-131 Warszawa, Polska
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <Link href="/privacy" className="hover:underline">Polityka prywatności</Link>
          <Link href="/cookies" className="hover:underline">Polityka cookies</Link>
        </div>
      </div>
    </main>
  );
}

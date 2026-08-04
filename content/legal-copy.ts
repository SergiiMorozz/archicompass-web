import { siteLocale, type SiteLocale } from "@/lib/site-locale";

export type LegalPageKey =
  | "privacy"
  | "terms"
  | "cookies"
  | "aiTransparency"
  | "responsibleAi"
  | "privacyAndAi"
  | "aiDisclaimer";

export type LegalDocument = {
  metadata: { title: string; description: string };
  eyebrow: string;
  title: string;
  effectiveDate: string;
  intro: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
};

type LegalCopy = {
  links: Record<LegalPageKey, string>;
  relatedTitle: string;
  contactLabel: string;
  companyLine: string;
  documents: Record<LegalPageKey, LegalDocument>;
};

const companyLine = "SM Advisory, Sergii Moroz · NIP 5252995634 · REGON 528006413 · ul. Grzybowska 2, lok. 31, 00-131 Warszawa, Polska";

const legalCopy: Record<SiteLocale, LegalCopy> = {
  pl: {
    links: {
      privacy: "Polityka prywatności",
      terms: "Regulamin",
      cookies: "Polityka cookies",
      aiTransparency: "AI i przejrzystość",
      responsibleAi: "Odpowiedzialne AI",
      privacyAndAi: "Prywatność i AI",
      aiDisclaimer: "Zastrzeżenie dotyczące AI",
    },
    relatedTitle: "Powiązane informacje",
    contactLabel: "Kontakt z ArchiCompass",
    companyLine,
    documents: {
      privacy: {
        metadata: {
          title: "Polityka prywatności",
          description: "Jak ArchiCompass przetwarza dane kont, profili, projektów, wiadomości, zdjęć i funkcji AI.",
        },
        eyebrow: "Informacje prawne",
        title: "Polityka prywatności",
        effectiveDate: "Obowiązuje od: 4 sierpnia 2026 r.",
        intro: "Ta polityka wyjaśnia, jak ArchiCompass przetwarza dane osobowe w kontach klientów, profilach profesjonalistów, AI Project Compass, zapytaniach, wiadomościach i pozostałych usługach platformy.",
        sections: [
          { title: "1. Administrator danych i kontakt", paragraphs: [
            "ArchiCompass jest platformą internetową prowadzoną przez SM Advisory, Sergii Moroz, ul. Grzybowska 2, lok. 31, 00-131 Warszawa, NIP 5252995634, REGON 528006413 (dalej: „ArchiCompass”, „my”). SM Advisory jest administratorem danych osobowych przetwarzanych w związku z działaniem platformy, o ile przy konkretnej usłudze nie wskazano innego administratora.",
            "Wnioski dotyczące prywatności i realizacji praw można wysyłać na contact@archicompass.pl. Zgłoszenia dotyczące bezpieczeństwa należy kierować na admin@archicompass.pl.",
          ] },
          { title: "2. Jakie dane przetwarzamy", paragraphs: [
            "Przetwarzamy dane przekazywane przez użytkownika, w tym adres e-mail i dane uwierzytelniające, rolę konta, informacje profilowe i portfolio, firmowe dane kontaktowe, briefy projektowe, ulubione elementy, wiadomości, statusy zapytań oraz zdjęcia projektów i zdjęcia referencyjne.",
            "Przetwarzamy także dane techniczne potrzebne do działania i ochrony usługi, np. znaczniki czasu, adres IP, informacje o przeglądarce i urządzeniu, zdarzenia logowania, rejestry błędów oraz ograniczone statystyki użycia. Publiczne dane profesjonalistów mogą obejmować link do profilu Google Business, ocenę i liczbę opinii.",
            "Nie przesyłaj dokumentów tożsamości, danych kart płatniczych, prywatnych adresów, poufnych planów, zdjęć osób bez ich zgody ani danych szczególnych kategorii, chyba że dana funkcja wyraźnie tego wymaga i masz podstawę prawną do ich udostępnienia.",
          ] },
          { title: "3. Cele i podstawy prawne", paragraphs: [
            "Przetwarzamy dane w celu tworzenia i zabezpieczania kont, publikowania profili i portfolio, zapisywania briefów, dopasowywania projektantów, obsługi zapytań i rozmów, wysyłania powiadomień, świadczenia pomocy, zapobiegania nadużyciom, utrzymania usługi oraz wykonania obowiązków prawnych.",
            "Podstawa prawna zależy od rodzaju działania: wykonanie żądanej usługi lub podjęcie działań przed zawarciem umowy, obowiązek prawny, zgoda przy funkcjach opcjonalnych albo nasz prawnie uzasadniony interes polegający na prowadzeniu, zabezpieczaniu, rozwijaniu i mierzeniu platformy. Jeżeli przetwarzanie opiera się na zgodzie, można ją wycofać w dowolnym momencie.",
          ] },
          { title: "4. Profile publiczne i prywatne strefy", paragraphs: [
            "Dane profilu projektanta, informacje o pracowni, projekty portfolio, publiczne oceny i publiczne linki do realizacji są przeznaczone do publikacji w internecie i mogą być indeksowane przez wyszukiwarki.",
            "Zapisane briefy, prywatne zdjęcia referencyjne, ulubione elementy, dane konta i rozmowy pozostają prywatne, dopóki użytkownik nie zdecyduje się ich wysłać lub udostępnić. Projektant, który otrzyma brief, może zobaczyć jego treść, wiadomość, przekazane dane kontaktowe i czasowe linki do zdjęć referencyjnych.",
          ] },
          { title: "5. Zdjęcia i funkcje AI", paragraphs: [
            "Podgląd zdjęć referencyjnych pozostaje w przeglądarce do czasu zapisania briefu lub uruchomienia analizy. Po wybraniu analizy AI wskazane obrazy i powiązany kontekst projektu, np. typ inwestycji, kierunek stylu i cechy wizualne, są przekazywane skonfigurowanemu dostawcy AI w celu przygotowania wskazówek stylistycznych.",
            "Analiza obejmuje maksymalnie sześć zdjęć w jednym żądaniu. Zapisane zdjęcia referencyjne są przechowywane prywatnie w Supabase Storage. Użytkownik i projektanci, którzy otrzymają powiązany brief, mogą je otwierać poprzez czasowe, podpisane linki. Zdjęcia portfolio przesłane przez profesjonalistów są publiczne.",
            "Wynik AI może być niepełny lub błędny. Ma charakter pomocniczy i nie zastępuje profesjonalnej porady projektowej, budowlanej, technicznej, prawnej ani finansowej.",
          ] },
          { title: "6. Dostawcy usług i transfer danych", paragraphs: [
            "Korzystamy z Supabase do uwierzytelniania, bazy danych i przechowywania plików; z Vercel do hostingu i dostarczania serwisu; z home.pl do obsługi poczty domenowej; oraz ze skonfigurowanych dostawców AI, takich jak Google Gemini lub OpenAI, do opcjonalnej analizy obrazów. Usługi Google mogą służyć do wyświetlania lub synchronizacji publicznych ocen firm.",
            "Dostawcy przetwarzają dane na podstawie własnych warunków umownych i zabezpieczeń. Jeżeli dane są przekazywane poza Europejski Obszar Gospodarczy, stosujemy odpowiednią decyzję stwierdzającą adekwatność, standardowe klauzule umowne lub inny zgodny z prawem mechanizm transferu.",
          ] },
          { title: "7. Statystyki i komunikacja", paragraphs: [
            "ArchiCompass zapisuje ograniczone statystyki wyświetleń profilu z użyciem losowego identyfikatora karty przeglądarki, aby ograniczyć podwójne zliczanie. Rekord wyświetlenia nie zawiera imienia ani adresu e-mail odwiedzającego.",
            "Wysyłamy wiadomości usługowe dotyczące aktywności konta, nowych briefów, wiadomości, przypomnień o nieprzeczytanych wiadomościach, bezpieczeństwa i istotnych zmian usługi. Są one niezbędne do świadczenia platformy i nie stanowią komunikacji marketingowej.",
          ] },
          { title: "8. Pliki cookies i pamięć przeglądarki", paragraphs: [
            "Platforma wykorzystuje pliki cookies i pamięć przeglądarki niezbędne do logowania, bezpieczeństwa, ustawień języka i interfejsu oraz zapisywania stanu formularzy. Obecnie nie używamy reklamowych plików cookies. Szczegóły opisuje Polityka cookies.",
          ] },
          { title: "9. Okres przechowywania i usuwanie", paragraphs: [
            "Dane konta, profilu, projektów, briefów, ulubionych elementów i zapytań przechowujemy przez okres aktywności konta lub tak długo, jak jest to potrzebne do realizacji wybranej funkcji. Konto i obsługiwane treści można usuwać za pomocą dostępnych opcji albo kontaktując się z nami.",
            "Możemy zachować ograniczone dane dla celów bezpieczeństwa, przeciwdziałania nadużyciom, obsługi sporów, wykonania obowiązków prawnych i odtwarzania kopii zapasowych. Kopie w wyszukiwarkach mogą być widoczne jeszcze przez pewien czas po usunięciu treści z ArchiCompass.",
          ] },
          { title: "10. Prawa użytkownika", paragraphs: [
            "Na zasadach określonych w obowiązującym prawie możesz żądać dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia lub informacji o przetwarzaniu; wnieść sprzeciw wobec przetwarzania opartego na prawnie uzasadnionym interesie; oraz wycofać zgodę, gdy jest ona podstawą przetwarzania.",
            "Możesz wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (UODO) w Polsce lub innego właściwego organu nadzorczego. ArchiCompass nie podejmuje decyzji wywołujących skutki prawne lub podobnie istotne wyłącznie w sposób zautomatyzowany.",
          ] },
          { title: "11. Osoby małoletnie i zmiany polityki", paragraphs: [
            "Konta ArchiCompass są przeznaczone dla osób, które ukończyły 18 lat. Możemy aktualizować tę politykę wraz ze zmianami usługi, dostawców lub wymogów prawnych. Aktualna wersja i data jej obowiązywania będą dostępne na tej stronie.",
          ] },
        ],
      },
      terms: {
        metadata: { title: "Regulamin", description: "Zasady korzystania z ArchiCompass przez klientów, projektantów, pracownie i odwiedzających." },
        eyebrow: "Informacje prawne",
        title: "Regulamin",
        effectiveDate: "Obowiązuje od: 4 sierpnia 2026 r.",
        intro: "Regulamin określa zasady korzystania z ArchiCompass przez klientów, niezależnych profesjonalistów, członków pracowni i odwiedzających.",
        sections: [
          { title: "1. Zakres platformy", paragraphs: ["ArchiCompass pomaga użytkownikom przygotować brief projektu wnętrza, przeglądać profile i portfolio oraz prowadzić uporządkowaną komunikację projektową. Nie jest stroną umowy o projekt, nadzór, wykonanie, zakup materiałów ani usługi zawartej bezpośrednio między klientem a profesjonalistą."] },
          { title: "2. Konta i role", paragraphs: ["Użytkownik powinien podawać prawdziwe, aktualne dane i chronić dostęp do konta. Jeden adres e-mail ma jedną rolę konta: klient albo projektant/pracownia. Administrator może wyłączyć widoczność lub dostęp do konta, jeżeli jest to konieczne dla bezpieczeństwa, zgodności z prawem lub ochrony innych użytkowników."] },
          { title: "3. Profile i treści użytkowników", paragraphs: ["Profesjonaliści odpowiadają za prawdziwość opisów, cen, doświadczenia, dostępności, zdjęć, linków i danych firmowych publikowanych w profilach. Użytkownik, który dodaje zdjęcie, tekst lub załącznik, potwierdza, że może go wykorzystać na platformie i że nie narusza praw innych osób."] },
          { title: "4. AI Project Compass", paragraphs: ["AI Project Compass analizuje przesłane inspiracje i podany kontekst, aby pomóc uporządkować brief oraz znaleźć istotne sygnały do dopasowania projektanta. Wynik jest sugestią pomocniczą, a nie zautomatyzowaną decyzją o wyborze projektanta, cenie, wykonalności lub jakości projektu.", "Użytkownik sam ocenia wynik i podejmuje ostateczne decyzje. Przed rozpoczęciem prac należy potwierdzić zakres, budżet, terminy, dokumentację, wymogi techniczne i prawne bezpośrednio z wybranym profesjonalistą."] },
          { title: "5. Komunikacja i prywatność", paragraphs: ["Zapytania i wiadomości służą uzasadnionej komunikacji projektowej. Nie wolno wykorzystywać danych kontaktowych uzyskanych przez platformę do spamu, nękania ani nieuprawnionego marketingu. Zasady przetwarzania danych i zdjęć opisuje Polityka prywatności."] },
          { title: "6. Oceny i informacje zewnętrzne", paragraphs: ["Publiczne oceny, liczby opinii, dane firmowe i linki zewnętrzne mogą pochodzić od użytkowników lub usług podmiotów trzecich, takich jak Google. Ich dostępność i dokładność mogą się zmieniać. Zabronione jest manipulowanie ocenami, publikowanie fałszywych informacji oraz podszywanie się pod inną osobę lub firmę."] },
          { title: "7. Dozwolone korzystanie", paragraphs: ["Nie wolno podejmować prób nieuprawnionego dostępu, przesyłać złośliwego oprogramowania lub treści niezgodnych z prawem, naruszać praw własności intelektualnej lub prywatności, automatycznie pobierać lub odsprzedawać danych platformy, omijać zabezpieczeń, wysyłać spamu ani korzystać z ArchiCompass niezgodnie z prawem."] },
          { title: "8. Opłaty", paragraphs: ["Konta klientów pozostają bezpłatne. Pierwszym profesjonalistom oferujemy 3-miesięczny okres bezpłatnego dostępu do profilu, portfolio i zapytań. Po jego zakończeniu utrzymanie aktywnego profilu profesjonalisty wymaga wybrania płatnej subskrypcji przedstawionej przed zakupem. Aktywna płatna subskrypcja pracowni obejmuje bez dodatkowej opłaty osobiste profile jej aktywnych członków zespołu.", "Cena, okres rozliczeniowy, podatki oraz ewentualne warunki promocyjne są widoczne przed płatnością. W przypadku braku płatności możemy ograniczyć widoczność profilu, portfolio i możliwość otrzymywania nowych zapytań, zachowując dostęp do danych konta zgodnie z Regulaminem."] },
          { title: "9. Dostępność, ograniczenie i usuwanie", paragraphs: ["Dążymy do zapewnienia dostępności i bezpieczeństwa ArchiCompass, ale nie gwarantujemy nieprzerwanego dostępu, działania bez błędów, trwałego przechowywania, konkretnego dopasowania, odpowiedzi profesjonalisty ani powodzenia projektu. Funkcje mogą być aktualizowane, zastępowane lub wycofywane z powodów operacyjnych, bezpieczeństwa, prawnych lub produktowych."] },
          { title: "10. Odpowiedzialność, prawo i kontakt", paragraphs: ["W maksymalnym zakresie dozwolonym przez prawo ArchiCompass nie odpowiada za treści użytkowników, usługi profesjonalistów, działania podmiotów trzecich, strony zewnętrzne ani pośrednie szkody wynikające z projektów realizowanych między użytkownikami. Regulamin podlega prawu polskiemu, bez pozbawiania konsumentów bezwzględnie obowiązującej ochrony wynikającej z prawa ich miejsca zwykłego pobytu.", "Pytania dotyczące Regulaminu można wysyłać na contact@archicompass.pl, a zgłoszenia dotyczące bezpieczeństwa i nadużyć na admin@archicompass.pl."] },
        ],
      },
      cookies: {
        metadata: { title: "Polityka cookies", description: "Jak ArchiCompass wykorzystuje niezbędne pliki cookies i pamięć przeglądarki." },
        eyebrow: "Informacje prawne",
        title: "Polityka cookies",
        effectiveDate: "Obowiązuje od: 4 sierpnia 2026 r.",
        intro: "Ta polityka wyjaśnia, jakich plików cookies i mechanizmów pamięci przeglądarki używa ArchiCompass.",
        sections: [
          { title: "Niezbędne uwierzytelnianie i bezpieczeństwo", paragraphs: ["ArchiCompass i Supabase używają plików cookies i podobnych mechanizmów, aby utrzymywać zalogowanie, chronić sesje, przeprowadzać uwierzytelnianie, zapobiegać nadużyciom i stosować uprawnienia konta. Technologie te są konieczne do działania funkcji konta."] },
          { title: "Preferencje i zapisywanie stanu pracy", paragraphs: ["Przeglądarka może zapisywać język, ustawienia interfejsu, stan AI Project Compass, podgląd przesyłanych plików i formularzy, aby nawigacja działała spójnie. Część danych tymczasowych jest usuwana po zamknięciu karty lub zakończeniu sesji."] },
          { title: "Ograniczone statystyki", paragraphs: ["Losowy identyfikator karty przeglądarki może służyć do ograniczania podwójnego zliczania wyświetleń profili. Nie jest przeznaczony do identyfikowania odwiedzającego według imienia ani adresu e-mail. ArchiCompass obecnie nie używa reklamowych plików cookies podmiotów trzecich ani nie sprzedaje danych o przeglądaniu."] },
          { title: "Zarządzanie pamięcią", paragraphs: ["Możesz usunąć lub zablokować pliki cookies i dane witryny w ustawieniach przeglądarki. Zablokowanie niezbędnej pamięci może spowodować wylogowanie lub uniemożliwić prawidłowe działanie konta, przesyłania plików, wiadomości, ulubionych i zabezpieczeń."] },
          { title: "Aktualizacje i kontakt", paragraphs: ["Zaktualizujemy tę politykę, jeżeli wprowadzimy analityczne, reklamowe lub inne nieobowiązkowe zastosowania plików cookies. Pytania można wysyłać na contact@archicompass.pl."] },
        ],
      },
      aiTransparency: {
        metadata: { title: "AI i przejrzystość", description: "Jak ArchiCompass oznacza i wyjaśnia wyniki wspierane przez sztuczną inteligencję." },
        eyebrow: "AI Project Compass",
        title: "AI i przejrzystość",
        effectiveDate: "Aktualizacja: 4 sierpnia 2026 r.",
        intro: "Ta strona wyjaśnia, kiedy ArchiCompass korzysta z AI i jak rozpoznać wyniki wspierane przez AI. Nie jest poradą prawną ani klasyfikacją systemu w rozumieniu przepisów o sztucznej inteligencji.",
        sections: [
          { title: "Co robi AI", paragraphs: ["AI Project Compass może analizować przesłane zdjęcia inspiracji oraz przekazany kontekst, np. typ inwestycji, wybrany kierunek stylu i cechy wizualne. Pomaga zaproponować kierunek stylistyczny, paletę, materiały, wskazówki do briefu oraz sygnały pomocne przy szukaniu projektanta."] },
          { title: "Jak oznaczamy wyniki", paragraphs: ["Funkcje i wyniki wspierane przez AI oznaczamy wyraźnym znakiem „AI” oraz objaśnieniem ich roli. Przed uruchomieniem analizy informujemy, że wybrane zdjęcia zostaną wysłane do dostawcy AI."] },
          { title: "Czego AI nie robi", paragraphs: ["AI nie wybiera projektanta za użytkownika, nie ustala ceny, nie ocenia technicznej lub prawnej wykonalności projektu i nie podejmuje decyzji wywołujących skutki prawne lub podobnie istotne. Wyniki dopasowania łączą zadeklarowane dane oraz pomocnicze sygnały — nie zastępują rozmowy i oceny portfolio."] },
          { title: "Ograniczenia", paragraphs: ["Zdjęcia mogą nie pokazywać pełnego kontekstu przestrzeni, a wynik może być niepełny, niedokładny lub nie odpowiadać wszystkim preferencjom. Weryfikuj rekomendacje i omów zakres, budżet oraz wymagania z wybranym projektantem."] },
          { title: "Twoja kontrola", paragraphs: ["To użytkownik decyduje, czy uruchomić analizę, zapisać brief, wysłać zapytanie oraz którego profesjonalistę wybrać. Możesz korzystać z ArchiCompass bez uruchamiania analizy zdjęć."] },
        ],
      },
      responsibleAi: {
        metadata: { title: "Odpowiedzialne AI", description: "Zasady odpowiedzialnego korzystania ze sztucznej inteligencji w ArchiCompass." },
        eyebrow: "AI Project Compass",
        title: "Odpowiedzialne AI",
        effectiveDate: "Aktualizacja: 4 sierpnia 2026 r.",
        intro: "W ArchiCompass traktujemy AI jako narzędzie wspierające przygotowanie projektu, a nie zastępstwo dla decyzji użytkownika lub wiedzy projektanta.",
        sections: [
          { title: "Cel i proporcjonalność", paragraphs: ["Korzystamy z AI, aby łatwiej przejść od rozproszonych inspiracji do uporządkowanego briefu. Zakres analizy ograniczamy do informacji potrzebnych do tej funkcji."] },
          { title: "Człowiek podejmuje decyzję", paragraphs: ["Użytkownik zachowuje kontrolę nad briefem, zapytaniem i wyborem profesjonalisty. Projektant pozostaje odpowiedzialny za własną ofertę, poradę i realizację usługi."] },
          { title: "Dane i bezpieczeństwo", paragraphs: ["Prosimy, aby nie przesyłać zdjęć osób, prywatnych adresów, dokumentów tożsamości ani informacji poufnych. Zanim wyślesz zdjęcia do analizy, pokazujemy informację o ich przekazaniu dostawcy AI."] },
          { title: "Uczciwość i granice", paragraphs: ["Nie projektujemy analizy po to, aby wyciągała wnioski o chronionych cechach osób. Wynik ma dotyczyć cech przestrzeni, inspiracji i deklarowanych potrzeb projektowych."] },
          { title: "Doskonalenie", paragraphs: ["Monitorujemy zgłaszane błędy i możemy aktualizować instrukcje, modele lub zabezpieczenia, aby wyniki były bardziej zrozumiałe i użyteczne. Jeśli wynik jest niepokojący lub błędny, napisz do nas na contact@archicompass.pl."] },
        ],
      },
      privacyAndAi: {
        metadata: { title: "Prywatność i AI", description: "Jak ArchiCompass przetwarza zdjęcia i kontekst projektu podczas analizy AI." },
        eyebrow: "AI Project Compass",
        title: "Prywatność i AI",
        effectiveDate: "Aktualizacja: 4 sierpnia 2026 r.",
        intro: "Poniżej opisujemy, co dzieje się z materiałami wysłanymi do analizy AI w AI Project Compass.",
        sections: [
          { title: "Kiedy dane są wysyłane", paragraphs: ["Zdjęcia referencyjne nie są wysyłane do analizy automatycznie. Zostają przekazane dopiero po kliknięciu przycisku uruchamiającego analizę. W pojedynczym żądaniu analizujemy maksymalnie sześć zdjęć."] },
          { title: "Jakie dane trafiają do analizy", paragraphs: ["Do dostawcy AI mogą trafić wybrane zdjęcia oraz kontekst podany w formularzu: typ inwestycji, wybrany kierunek stylu i cechy wizualne. Nie wysyłamy danych logowania ani numeru telefonu jako części tej analizy."] },
          { title: "Dostawca AI", paragraphs: ["Żądanie przetwarza aktualnie skonfigurowany dostawca API, np. Google Gemini lub OpenAI. Dostawca może się zmieniać wraz z konfiguracją usługi. Przy istotnej zmianie sposobu przetwarzania zaktualizujemy te informacje i Politykę prywatności."] },
          { title: "Przechowywanie zdjęć", paragraphs: ["Samo żądanie analizy nie zapisuje zdjęć jako publicznych plików ArchiCompass. Zdjęcia stają się częścią prywatnego zasobu ArchiCompass dopiero wtedy, gdy użytkownik świadomie zapisze brief lub wyśle go w ramach zapytania. Wtedy obowiązują zasady retencji opisane w Polityce prywatności.", "Dalsze przechowywanie danych przez dostawcę AI wynika z jego warunków i konfiguracji usługi. Nie wykorzystujemy zdjęć przesłanych do analizy jako publicznego źródła treści na platformie."] },
          { title: "Twoje wybory", paragraphs: ["Możesz nie uruchamiać analizy, usunąć zdjęcie przed zapisaniem briefu albo usunąć zapisany brief i konto zgodnie z dostępnymi funkcjami. W sprawie realizacji praw dotyczących danych napisz na contact@archicompass.pl."] },
        ],
      },
      aiDisclaimer: {
        metadata: { title: "Zastrzeżenie dotyczące AI", description: "Ważne ograniczenia rekomendacji generowanych przez AI Project Compass." },
        eyebrow: "AI Project Compass",
        title: "Zastrzeżenie dotyczące AI",
        effectiveDate: "Aktualizacja: 4 sierpnia 2026 r.",
        intro: "Wyniki AI Project Compass są pomocą w porządkowaniu inspiracji i przygotowaniu rozmowy z projektantem. Nie stanowią porady zawodowej ani gwarancji rezultatu.",
        sections: [
          { title: "Charakter pomocniczy", paragraphs: ["Sugestie stylu, materiałów, palety, zakresu i dopasowania projektantów mają charakter informacyjny. Mogą być niepełne, niedokładne lub nieodpowiednie dla konkretnej nieruchomości."] },
          { title: "Decyzje i weryfikacja", paragraphs: ["To użytkownik podejmuje decyzje dotyczące wyboru projektanta, budżetu, harmonogramu i realizacji. Przed rozpoczęciem prac potwierdź ustalenia z wybranym profesjonalistą oraz właściwymi wykonawcami lub doradcami."] },
          { title: "Brak porady specjalistycznej", paragraphs: ["AI Project Compass nie zastępuje porady architektonicznej, projektowej, konstrukcyjnej, budowlanej, prawnej, podatkowej, finansowej ani ubezpieczeniowej. Nie opieraj na nim wyłącznie decyzji wymagających uprawnień lub szczegółowej oceny miejsca inwestycji."] },
          { title: "Materiały przesyłane do analizy", paragraphs: ["Nie przesyłaj treści, których nie masz prawa użyć, ani informacji wrażliwych. Ponosisz odpowiedzialność za zgodność przesłanych materiałów z prawem oraz prawami osób trzecich."] },
          { title: "Dostępność funkcji", paragraphs: ["Działanie usługi AI zależy również od zewnętrznych dostawców i może być czasowo ograniczone, zmienione lub niedostępne. ArchiCompass może aktualizować funkcję, aby poprawiać bezpieczeństwo i jakość."] },
        ],
      },
    },
  },
  en: {
    links: {
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookies: "Cookie Policy",
      aiTransparency: "AI and transparency",
      responsibleAi: "Responsible AI",
      privacyAndAi: "Privacy and AI",
      aiDisclaimer: "AI disclaimer",
    },
    relatedTitle: "Related information",
    contactLabel: "Contact ArchiCompass",
    companyLine,
    documents: {
      privacy: {
        metadata: { title: "Privacy Policy", description: "How ArchiCompass processes account, profile, project, message, image and AI feature data." },
        eyebrow: "Legal information",
        title: "Privacy Policy",
        effectiveDate: "Effective from: 4 August 2026",
        intro: "This policy explains how ArchiCompass processes personal data in client accounts, professional profiles, AI Project Compass, enquiries, messages and other platform services.",
        sections: [
          { title: "1. Data controller and contact", paragraphs: ["ArchiCompass is an online platform operated by SM Advisory, Sergii Moroz, ul. Grzybowska 2, lok. 31, 00-131 Warszawa, NIP 5252995634, REGON 528006413 (" + '"ArchiCompass", "we"' + "). SM Advisory is the controller of personal data processed to operate the platform unless a different controller is identified for a specific service.", "Send privacy requests and rights requests to contact@archicompass.pl. Send security reports to admin@archicompass.pl."] },
          { title: "2. Data we process", paragraphs: ["We process information you provide, including your email address and authentication data, account role, profile and portfolio information, business contact information, project briefs, saved items, messages, enquiry statuses, project images and reference images.", "We also process technical data needed to operate and protect the service, such as timestamps, IP address, browser and device information, sign-in events, error logs and limited usage statistics. Public professional data may include a Google Business profile link, rating and review count.", "Do not upload identity documents, payment-card data, private addresses, confidential plans, photos of people without their consent or special-category data unless a feature expressly requires it and you have a lawful basis to share it."] },
          { title: "3. Purposes and legal bases", paragraphs: ["We process data to create and secure accounts, publish profiles and portfolios, save briefs, match designers, handle enquiries and conversations, send notifications, provide support, prevent abuse, operate the service and meet legal obligations.", "The legal basis depends on the activity: providing a requested service or taking steps before a contract, legal obligation, consent for optional features, or our legitimate interests in operating, securing, improving and measuring the platform. You can withdraw consent at any time where consent is the basis."] },
          { title: "4. Public profiles and private areas", paragraphs: ["Designer profile data, studio information, portfolio projects, public ratings and public project links are intended for publication online and may be indexed by search engines.", "Saved briefs, private reference images, saved items, account data and conversations remain private until you decide to send or share them. A designer who receives a brief can view its contents, message, shared contact data and time-limited links to reference images."] },
          { title: "5. Images and AI features", paragraphs: ["Reference-image previews remain in your browser until you save a brief or run an analysis. When you choose AI analysis, the selected images and related project context, such as project type, style direction and visual cues, are sent to the configured AI provider to prepare style guidance.", "An analysis includes no more than six images in one request. Saved reference images are held privately in Supabase Storage. You and designers who receive the related brief can open them through time-limited signed links. Portfolio images uploaded by professionals are public.", "AI output may be incomplete or inaccurate. It is supportive only and does not replace professional design, construction, technical, legal or financial advice."] },
          { title: "6. Service providers and transfers", paragraphs: ["We use Supabase for authentication, database and file storage; Vercel for hosting and delivery; home.pl for domain email; and configured AI providers such as Google Gemini or OpenAI for optional image analysis. Google services may be used to display or synchronise public business ratings.", "Providers process data under their own contractual terms and safeguards. Where data is transferred outside the European Economic Area, we use an adequacy decision, standard contractual clauses or another lawful transfer mechanism as appropriate."] },
          { title: "7. Analytics and communications", paragraphs: ["ArchiCompass records limited profile-view statistics using a random browser-tab identifier to reduce duplicate counts. A view record does not contain the visitor's name or email address.", "We send service messages about account activity, new briefs, messages, unread-message reminders, security and material service changes. These messages are necessary to operate the platform and are not marketing communications."] },
          { title: "8. Cookies and browser storage", paragraphs: ["The platform uses cookies and browser storage needed for sign-in, security, language and interface preferences and saving form state. We currently do not use advertising cookies. The Cookie Policy provides more detail."] },
          { title: "9. Retention and deletion", paragraphs: ["We retain account, profile, project, brief, saved-item and enquiry data for as long as the account is active or the data is needed for the selected feature. You can delete your account and supported content using available controls or by contacting us.", "We may retain limited data for security, abuse prevention, dispute handling, legal obligations and backups. Search-engine copies can remain visible for a period after content has been removed from ArchiCompass."] },
          { title: "10. Your rights", paragraphs: ["Subject to applicable law, you may request access, correction, deletion, restriction, portability or information about your data; object to processing based on legitimate interests; and withdraw consent where consent is the basis.", "You may lodge a complaint with the Polish Data Protection Authority (UODO) or another competent supervisory authority. ArchiCompass does not make decisions producing legal or similarly significant effects solely by automated means."] },
          { title: "11. Minors and policy changes", paragraphs: ["ArchiCompass accounts are intended for people aged 18 or older. We may update this policy as the service, providers or legal requirements change. The current version and effective date will remain available on this page."] },
        ],
      },
      terms: {
        metadata: { title: "Terms of Service", description: "Rules for using ArchiCompass as a client, designer, studio member or visitor." },
        eyebrow: "Legal information",
        title: "Terms of Service",
        effectiveDate: "Effective from: 4 August 2026",
        intro: "These Terms set out the rules for using ArchiCompass as a client, independent professional, studio member or visitor.",
        sections: [
          { title: "1. Platform scope", paragraphs: ["ArchiCompass helps users prepare an interior-project brief, explore profiles and portfolios, and hold structured project conversations. It is not a party to a design, supervision, construction, material-purchase or other service agreement made directly between a client and a professional."] },
          { title: "2. Accounts and roles", paragraphs: ["You must provide true, current information and protect your account access. One email address has one account role: client or designer/studio. We may remove visibility or access where this is necessary for security, legal compliance or protecting other users."] },
          { title: "3. Profiles and user content", paragraphs: ["Professionals are responsible for the accuracy of the descriptions, prices, experience, availability, images, links and business information they publish. When you upload an image, text or attachment, you confirm that you may use it on the platform and that it does not infringe the rights of others."] },
          { title: "4. AI Project Compass", paragraphs: ["AI Project Compass analyses the inspiration and context you provide to help structure a brief and identify relevant signals for designer matching. Its output is a supportive suggestion, not an automated decision about hiring a designer, price, feasibility or project quality.", "You assess the result and make the final decisions. Before work begins, confirm scope, budget, timing, documentation, technical and legal requirements directly with your chosen professional."] },
          { title: "5. Communication and privacy", paragraphs: ["Enquiries and messages are for legitimate project communication. You must not use contact data obtained through the platform for spam, harassment or unauthorised marketing. The Privacy Policy explains how we handle data and images."] },
          { title: "6. Ratings and external information", paragraphs: ["Public ratings, review counts, business information and external links may come from users or third-party services such as Google. Their availability and accuracy can change. Manipulating ratings, publishing false information or impersonating another person or business is prohibited."] },
          { title: "7. Acceptable use", paragraphs: ["You must not attempt unauthorised access, upload malware or unlawful content, infringe intellectual-property or privacy rights, scrape or resell platform data, bypass safeguards, send spam or use ArchiCompass unlawfully."] },
          { title: "8. Fees", paragraphs: ["Client accounts remain free. Early professionals receive a three-month free period for their profile, portfolio and enquiries. After that, keeping an active professional profile requires selecting a paid subscription shown before purchase. An active paid studio subscription covers the personal profiles of its active team members at no extra charge.", "Price, billing period, taxes and any promotional terms are shown before payment. Where payment is not received, we may limit profile visibility, portfolio visibility and new-enquiry access while preserving account-data access in line with these Terms."] },
          { title: "9. Availability, restriction and deletion", paragraphs: ["We aim to keep ArchiCompass available and secure, but do not guarantee uninterrupted access, error-free operation, permanent storage, a particular match, a professional response or project success. Features may be updated, replaced or withdrawn for operational, security, legal or product reasons."] },
          { title: "10. Liability, law and contact", paragraphs: ["To the maximum extent allowed by law, ArchiCompass is not liable for user content, professional services, third-party actions, external websites or indirect loss arising from projects carried out between users. These Terms are governed by Polish law without removing mandatory consumer protection available under the law of your habitual residence.", "For questions about these Terms, write to contact@archicompass.pl. For security and abuse reports, write to admin@archicompass.pl."] },
        ],
      },
      cookies: {
        metadata: { title: "Cookie Policy", description: "How ArchiCompass uses essential cookies and browser storage." },
        eyebrow: "Legal information",
        title: "Cookie Policy",
        effectiveDate: "Effective from: 4 August 2026",
        intro: "This policy explains the cookies and browser-storage mechanisms used by ArchiCompass.",
        sections: [
          { title: "Essential authentication and security", paragraphs: ["ArchiCompass and Supabase use cookies and similar mechanisms to keep you signed in, protect sessions, perform authentication, prevent abuse and apply account permissions. These technologies are necessary for account features to work."] },
          { title: "Preferences and work state", paragraphs: ["Your browser may store language and interface preferences, AI Project Compass state, file previews and form state to keep navigation consistent. Some temporary data is removed when you close a tab or end a session."] },
          { title: "Limited statistics", paragraphs: ["A random browser-tab identifier may be used to reduce duplicate profile-view counts. It is not intended to identify a visitor by name or email address. ArchiCompass currently does not use third-party advertising cookies or sell browsing data."] },
          { title: "Managing storage", paragraphs: ["You can delete or block cookies and site data in your browser settings. Blocking essential storage can sign you out or prevent account features, file uploads, messages, saved items and safeguards from working correctly."] },
          { title: "Updates and contact", paragraphs: ["We will update this policy if we introduce analytics, advertising or other non-essential cookie uses. Questions can be sent to contact@archicompass.pl."] },
        ],
      },
      aiTransparency: {
        metadata: { title: "AI and transparency", description: "How ArchiCompass identifies and explains results supported by artificial intelligence." },
        eyebrow: "AI Project Compass",
        title: "AI and transparency",
        effectiveDate: "Updated: 4 August 2026",
        intro: "This page explains when ArchiCompass uses AI and how you can recognise AI-supported results. It is not legal advice or a legal classification of the system under AI regulation.",
        sections: [
          { title: "What AI does", paragraphs: ["AI Project Compass can analyse the inspiration images and context you submit, such as project type, selected style direction and visual cues. It can suggest a style direction, palette, materials, brief prompts and signals that may help when looking for a designer."] },
          { title: "How we identify results", paragraphs: ["We identify AI-supported features and results with a clear “AI” marker and an explanation of their role. Before analysis begins, we explain that selected images will be sent to an AI provider."] },
          { title: "What AI does not do", paragraphs: ["AI does not choose a designer for you, set a price, assess technical or legal feasibility, or make decisions producing legal or similarly significant effects. Match results combine declared information and supportive signals; they do not replace a conversation or portfolio review."] },
          { title: "Limitations", paragraphs: ["Images may not show the full context of a space, and an output can be incomplete, inaccurate or unsuitable for all preferences. Verify recommendations and discuss scope, budget and requirements with your selected designer."] },
          { title: "Your control", paragraphs: ["You decide whether to run an analysis, save a brief, send an enquiry and choose a professional. You can use ArchiCompass without running image analysis."] },
        ],
      },
      responsibleAi: {
        metadata: { title: "Responsible AI", description: "Principles for the responsible use of artificial intelligence in ArchiCompass." },
        eyebrow: "AI Project Compass",
        title: "Responsible AI",
        effectiveDate: "Updated: 4 August 2026",
        intro: "At ArchiCompass, we treat AI as a tool that supports project preparation, not a substitute for user decisions or design expertise.",
        sections: [
          { title: "Purpose and proportionality", paragraphs: ["We use AI to make it easier to move from scattered inspiration to a structured brief. We limit analysis to information needed for that feature."] },
          { title: "A person makes the decision", paragraphs: ["You retain control over your brief, enquiry and choice of professional. A designer remains responsible for their own offer, advice and service delivery."] },
          { title: "Data and security", paragraphs: ["Please do not upload images of people, private addresses, identity documents or confidential information. Before you send images for analysis, we show that they will be transferred to an AI provider."] },
          { title: "Fairness and boundaries", paragraphs: ["We do not design the analysis to infer protected characteristics of people. Its output is intended to address space, inspiration and stated project needs."] },
          { title: "Improvement", paragraphs: ["We monitor reported issues and may update instructions, models or safeguards to make results more understandable and useful. If a result seems harmful or inaccurate, contact us at contact@archicompass.pl."] },
        ],
      },
      privacyAndAi: {
        metadata: { title: "Privacy and AI", description: "How ArchiCompass processes images and project context during AI analysis." },
        eyebrow: "AI Project Compass",
        title: "Privacy and AI",
        effectiveDate: "Updated: 4 August 2026",
        intro: "This page explains what happens to the material you send for AI analysis in AI Project Compass.",
        sections: [
          { title: "When data is sent", paragraphs: ["Reference images are not sent for analysis automatically. They are transferred only after you click the button that starts analysis. One request analyses no more than six images."] },
          { title: "What is sent for analysis", paragraphs: ["The selected images and context supplied in the form can be sent to the AI provider: project type, selected style direction and visual cues. We do not send your sign-in credentials or telephone number as part of this analysis."] },
          { title: "AI provider", paragraphs: ["The request is processed by the currently configured API provider, such as Google Gemini or OpenAI. The provider can change as the service configuration changes. If the processing changes materially, we will update this page and the Privacy Policy."] },
          { title: "Image storage", paragraphs: ["The analysis request itself does not save images as public ArchiCompass files. Images become part of a private ArchiCompass resource only if you deliberately save a brief or send it as part of an enquiry. The retention rules in the Privacy Policy then apply.", "Any further retention by the AI provider follows that provider's terms and service configuration. We do not use images submitted for analysis as a public content source on the platform."] },
          { title: "Your choices", paragraphs: ["You can decide not to run the analysis, remove an image before saving a brief, or delete a saved brief and your account using the available features. For data-rights requests, write to contact@archicompass.pl."] },
        ],
      },
      aiDisclaimer: {
        metadata: { title: "AI disclaimer", description: "Important limitations of recommendations generated by AI Project Compass." },
        eyebrow: "AI Project Compass",
        title: "AI disclaimer",
        effectiveDate: "Updated: 4 August 2026",
        intro: "AI Project Compass results help organise inspiration and prepare a conversation with a designer. They are not professional advice or a guarantee of an outcome.",
        sections: [
          { title: "Supportive nature", paragraphs: ["Style, material, palette, scope and designer-matching suggestions are for information only. They can be incomplete, inaccurate or unsuitable for a particular property."] },
          { title: "Decisions and verification", paragraphs: ["You make decisions about professional choice, budget, timing and delivery. Before work begins, confirm the relevant arrangements with your selected professional and any appropriate contractors or advisers."] },
          { title: "No specialist advice", paragraphs: ["AI Project Compass does not replace architectural, design, structural, construction, legal, tax, financial or insurance advice. Do not rely on it alone for decisions requiring professional authority or a detailed assessment of the investment site."] },
          { title: "Material sent for analysis", paragraphs: ["Do not upload content you do not have the right to use or sensitive information. You are responsible for ensuring that submitted material complies with law and third-party rights."] },
          { title: "Feature availability", paragraphs: ["The AI service also depends on external providers and may be limited, changed or unavailable from time to time. ArchiCompass may update the feature to improve safety and quality."] },
        ],
      },
    },
  },
};

export function getLegalCopy(locale: SiteLocale = siteLocale) {
  return legalCopy[locale];
}


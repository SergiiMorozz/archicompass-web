# Rejestr systemów AI i wstępna ocena klasyfikacji

**Właściciel:** SM Advisory / Sergii Moroz
**Ostatni przegląd:** 16 sierpnia 2026 r.
**Status:** dokument operacyjny; wymaga aktualizacji przy zmianie funkcji lub konfiguracji

## 1. Metoda oceny

Rejestr opisuje rzeczywiste przeznaczenie funkcji, dane wejściowe, wynik, kontrolę użytkownika i ryzyka. Ocena regulacyjna jest wstępna i operacyjna — nie stanowi porady prawnej ani deklaracji pełnej zgodności. Przy istotnej zmianie należy ponownie sprawdzić obowiązujące przepisy, w tym AI Act, oraz w razie potrzeby skonsultować specjalistę.

## 2. Rejestr

### AC-AI-01 — AI Project Compass

| Element | Opis |
| --- | --- |
| Cel | Pomoc w uporządkowaniu inspiracji wnętrzarskich w kierunek stylistyczny i brief do rozmowy z projektantem. |
| Użytkownik | Osoba, która świadomie uruchamia analizę zdjęć w AI Project Compass. |
| Dane wejściowe | Maksymalnie 6 wybranych zdjęć referencyjnych w jednym żądaniu oraz ograniczony kontekst projektu, np. typ inwestycji, preferencje stylu i cechy wizualne. |
| Dane wyjściowe | Propozycja kierunku stylu, palety, materiałów, opisu atmosfery i wskazówek do briefu. |
| Dostawca/model | Ustalany przez aktualną konfigurację produkcyjną Vercel i kod endpointu analizy. Dostawca może obejmować Google Gemini lub OpenAI. Sekrety nie są zapisywane w tym rejestrze. |
| Kontrola człowieka | Analiza następuje wyłącznie po działaniu użytkownika. Użytkownik może nie uruchamiać analizy, usuwać zdjęcia przed zapisem, edytować brief oraz sam wybrać profesjonalistę. |
| Główne ograniczenia | Wynik może być niepełny, błędny lub nieadekwatny do realnych warunków nieruchomości. Nie zastępuje porady projektowej, technicznej, budowlanej, prawnej ani finansowej. |
| Kluczowe środki | Widoczna informacja o AI i przekazaniu zdjęć; limit 6 zdjęć; instrukcja, aby nie przesyłać zdjęć osób, adresów prywatnych, dokumentów ani informacji poufnych; prywatne przechowywanie zapisanych zdjęć; podpisane linki do briefów. |
| Wstępna ocena | Funkcja wspierająca projektowanie i przygotowanie briefu. Nie jest zaprojektowana do podejmowania decyzji o zatrudnieniu, kredycie, edukacji, ochronie zdrowia, egzekwowaniu prawa ani innym celu z Załącznika III AI Act. Nie podejmuje decyzji wywołujących skutki prawne lub podobnie istotne wyłącznie w sposób zautomatyzowany. |

### AC-AI-02 — Dopasowanie projektantów

| Element | Opis |
| --- | --- |
| Cel | Uporządkowanie i prezentacja profili profesjonalistów według zadeklarowanych danych briefu, profilu i portfolio. |
| Dane wejściowe | Informacje z briefu, wskazówki z analizy AI, lokalizacja, zakres, budżet, style, usługi i dane profilu. |
| Dane wyjściowe | Lista lub kolejność rekomendowanych profili oraz sygnały „dlaczego profil może pasować”. |
| Kontrola człowieka | Użytkownik widzi wiele profili, może zmieniać filtry, porównywać portfolio i sam decyduje o wysłaniu wiadomości. Projektant nie jest automatycznie odrzucany ani wybrany do świadczenia usługi. |
| Wstępna ocena | Funkcja rekomendacyjna o charakterze pomocniczym. Nie jest narzędziem do decyzji o zatrudnieniu, dostępie do kredytu, ubezpieczeniu ani usługach publicznych. |
| Ryzyka do monitorowania | Nierówna widoczność profili, błędna interpretacja danych, niespójność językowa, sztuczne zawyżanie wyniku, błąd lokalizacji lub ceny. |

### AC-AI-03 — Wewnętrzne narzędzia AI

| Element | Opis |
| --- | --- |
| Cel | Wsparcie programowania, redakcji, analizy treści, tłumaczeń i przygotowania materiałów roboczych. |
| Dozwolone dane | Zanonimizowane lub niezbędne dane robocze, które nie obejmują sekretów, haseł, kluczy API, prywatnych briefów, wiadomości użytkowników ani szczególnych kategorii danych. |
| Kontrola człowieka | Każdy wynik podlega weryfikacji przez człowieka przed wdrożeniem, publikacją lub użyciem w decyzji biznesowej. |
| Wstępna ocena | Wsparcie pracy wewnętrznej; nie jest samodzielnym systemem decyzyjnym wobec użytkowników. |

## 3. Zdarzenia wymagające ponownej klasyfikacji

Należy zatrzymać wdrożenie i przeprowadzić nową ocenę, jeśli ArchiCompass:

1. automatycznie zatwierdza, odrzuca albo ustala warunki finansowe dla osoby;
2. ocenia osoby na podstawie danych wrażliwych, biometrycznych, emocji, zdrowia, pochodzenia lub innych chronionych cech;
3. wykorzystuje AI do rekrutacji, weryfikacji tożsamości, kredytu, ubezpieczenia, edukacji, zdrowia lub egzekwowania prawa;
4. zaczyna trenować model na materiałach użytkowników albo używać ich do publicznej generacji treści;
5. wdraża agenta AI, który wysyła wiadomości, zawiera umowy lub wykonuje działania bez bezpośredniej kontroli człowieka.

## 4. Minimalne dowody i monitoring

- Przed zmianą dostawcy/modelu testujemy odpowiedzi na reprezentatywnych, dozwolonych materiałach i sprawdzamy język PL/EN.
- Każdą istotną zmianę API, promptu lub retencji odnotowujemy w historii wdrożeń oraz aktualizujemy publiczne informacje, jeśli wpływa na użytkownika.
- Zgłoszenia błędów, niebezpiecznych wyników i problemów z danymi przyjmujemy pod `contact@archicompass.pl`, a sprawy bezpieczeństwa pod `admin@archicompass.pl`.
- Nie przechowujemy w tym dokumencie kluczy, tokenów, haseł, prywatnych zdjęć ani danych kont.

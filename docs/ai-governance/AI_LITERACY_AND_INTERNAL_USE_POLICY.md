# Zasady AI literacy i wewnętrznego użycia AI

**Właściciel:** SM Advisory / Sergii Moroz
**Obowiązuje od:** 16 sierpnia 2026 r.
**Zakres:** każda osoba, która tworzy, zmienia, testuje, publikuje lub administruje funkcją AI ArchiCompass albo korzysta z AI w pracy nad platformą.

## 1. Minimalna wiedza przed użyciem AI

Osoba korzystająca z AI musi rozumieć, że wynik może być błędny, niepełny, stronniczy albo brzmieć pewnie mimo braku podstaw. Nie wolno traktować generowanego tekstu, kodu, tłumaczenia, porady ani rekomendacji jako automatycznie poprawnych.

Przed publikacją lub wdrożeniem należy sprawdzić:

1. poprawność faktów, cen, nazw, dat i źródeł;
2. zgodność PL i EN tam, gdzie struktura platformy ma być identyczna;
3. brak obietnic, których platforma nie może potwierdzić;
4. brak danych osobowych, tajemnic, kluczy API, haseł i prywatnych briefów;
5. brak treści dyskryminujących, obraźliwych, naruszających prawo lub prawa autorskie;
6. czy użytkownik jasno rozumie, że ma do czynienia z AI, gdy funkcja działa bezpośrednio wobec niego.

## 2. Dane, których nie wolno przekazywać do zewnętrznego AI bez formalnej podstawy

- hasła, klucze API, tokeny, dane dostępowe i konfiguracje produkcyjne;
- pełne dane logowania użytkowników;
- prywatne wiadomości, briefy i zdjęcia referencyjne poza zatwierdzonym przepływem funkcji AI Project Compass;
- dokumenty tożsamości, numery kart, dane zdrowotne, dane biometryczne, dane o dzieciach i szczególne kategorie danych;
- materiały objęte poufnością, jeżeli nie ma zgody i odpowiedniej podstawy przetwarzania.

## 3. Zasady pracy nad funkcją publiczną

1. Każdy nowy lub istotnie zmieniony przepływ AI musi mieć opis celu, danych wejściowych, danych wyjściowych, ograniczeń i kontroli użytkownika.
2. Przed wdrożeniem sprawdzamy komunikaty, błędy i wyniki na dozwolonych przypadkach testowych oraz w obu językach platformy.
3. Funkcja nie może sugerować, że wynik jest poradą zawodową, decyzją wiążącą albo gwarancją jakości.
4. Użytkownik musi móc zrezygnować z analizy, poprawić dane wejściowe i podjąć ostateczną decyzję samodzielnie.
5. Zmiana modelu, dostawcy, promptu systemowego, kategorii danych lub retencji wymaga aktualizacji rejestru AI oraz, gdy jest istotna dla użytkownika, dokumentów publicznych.

## 4. Kontrola jakości

- Sprawdzaj, czy odpowiedź dotyczy rzeczywiście widocznych elementów wnętrza, a nie zgaduje cech nieruchomości lub osób.
- Porównuj wyniki z różnymi stylami i weryfikuj, czy język odpowiedzi zgadza się z językiem strony.
- Nie publikuj wyników AI jako opinii człowieka bez odpowiedniego oznaczenia.
- Nie używaj AI do tworzenia fałszywych opinii, ocen, portfolio, referencji ani informacji o projektantach.

## 5. Zgłoszenia, incydenty i zatrzymanie funkcji

Jeżeli wynik AI może naruszać prywatność, bezpieczeństwo, prawa osób trzecich albo istotnie wprowadzać w błąd:

1. zatrzymaj publikację lub użycie wyniku;
2. zachowaj minimalne informacje potrzebne do odtworzenia problemu, bez kopiowania zbędnych danych prywatnych;
3. zgłoś problem na `admin@archicompass.pl` (bezpieczeństwo) albo `contact@archicompass.pl` (produkt/dane);
4. oceń, czy należy ograniczyć funkcję, poprawić prompt, zaktualizować dokumentację lub powiadomić użytkownika;
5. udokumentuj decyzję w historii zmian.

## 6. Przegląd

Właściciel platformy przegląda tę politykę co najmniej raz w roku i przy każdym zdarzeniu wymienionym w `README.md`. Każda osoba dołączająca do pracy nad AI powinna zapoznać się z tą polityką przed uzyskaniem dostępu do środowiska produkcyjnego lub danych użytkowników.

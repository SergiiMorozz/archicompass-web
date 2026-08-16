# Zarządzanie AI w ArchiCompass

## Cel

Ten katalog jest wewnętrznym źródłem zasad dla funkcji AI ArchiCompass. Dotyczy zarówno funkcji dostępnych dla użytkowników, jak i narzędzi AI używanych wewnętrznie do pracy nad platformą i treściami.

Właścicielem dokumentacji jest SM Advisory / Sergii Moroz. Dokumenty obowiązują od 16 sierpnia 2026 r. i podlegają przeglądowi co najmniej raz w roku oraz przy istotnej zmianie funkcji.

## Dokumenty

- `AI_SYSTEMS_REGISTER_AND_CLASSIFICATION.md` — rejestr systemów, celów, danych, ryzyk i wstępnej oceny klasyfikacji.
- `AI_LITERACY_AND_INTERNAL_USE_POLICY.md` — minimalne kompetencje, ograniczenia i proces zgłaszania problemów.

## Zasada źródła prawdy

Konfiguracja techniczna produkcji, w tym aktywny dostawca i model AI, jest potwierdzana w chronionych zmiennych środowiskowych Vercel oraz w aktualnym kodzie wdrożenia. Nie wpisujemy sekretów, kluczy API ani haseł do tego katalogu.

## Kiedy należy zaktualizować dokumentację

Aktualizacja jest wymagana przed lub bezpośrednio po:

1. zmianie dostawcy, modelu, promptu systemowego lub zakresu danych wejściowych;
2. dodaniu funkcji podejmującej decyzje o istotnym wpływie na użytkownika;
3. zmianie sposobu przechowywania, udostępniania lub retencji zdjęć i briefów;
4. wdrożeniu automatycznych decyzji o cenie, dostępie, zatrudnieniu, kredycie lub innym obszarze wysokiego ryzyka;
5. incydencie bezpieczeństwa, istotnej skardze lub stwierdzonym nieprawidłowym wyniku;
6. wejściu w życie wymagania prawnego dotyczącego funkcji AI.

Dokumenty mają charakter operacyjny i nie zastępują porady prawnej przy zmianie modelu biznesowego lub ocenie regulacyjnej.

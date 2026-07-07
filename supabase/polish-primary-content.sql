-- Make the existing public demo catalogue and editorial content Polish-first.
-- IDs, internal filter values and relationships remain unchanged.

begin;

update public.profiles set
  profile_headline = case id
    when 'd0000000-0000-4000-8000-000000000001' then 'Ciepły minimalizm dla funkcjonalnych miejskich domów'
    when 'd0000000-0000-4000-8000-000000000002' then 'Wyraziste wnętrza oparte na konsekwentnym planowaniu'
    when 'd0000000-0000-4000-8000-000000000003' then 'Współczesne nadmorskie wnętrza kształtowane światłem'
    when 'd0000000-0000-4000-8000-000000000004' then 'Małe przestrzenie, sprytne przechowywanie i wnętrza inwestycyjne'
    when 'd0000000-0000-4000-8000-000000000005' then 'Quiet luxury oparty na rzemiośle i proporcji'
    when 'd0000000-0000-4000-8000-000000000006' then 'Remonty z charakterem w zabytkowych i industrialnych wnętrzach'
    when 'd0000000-0000-4000-8000-000000000007' then 'Zdrowe, elastyczne domy projektowane wokół życia rodziny'
  end,
  bio = case id
    when 'd0000000-0000-4000-8000-000000000001' then 'Marta tworzy spokojne wnętrza mieszkalne z naturalnych materiałów, z zabudowami na wymiar i starannie zaplanowanym światłem. Warszawska pracownia prowadzi projekty mieszkań i domów od układu funkcjonalnego przez dokumentację, zakupy i koordynację na budowie.'
    when 'd0000000-0000-4000-8000-000000000002' then 'Jasna Forma łączy kolor, elementy vintage i współczesne polskie wzornictwo bez rezygnowania z funkcji. Krakowska pracownia ma doświadczenie w kamienicach, wnętrzach hotelarskich i domach klientów, którzy szukają osobistego, niepowtarzalnego efektu.'
    when 'd0000000-0000-4000-8000-000000000003' then 'Piotr projektuje swobodne i trwałe domy w całym Trójmieście. Jego realizacje wyróżniają czytelna komunikacja, oszczędny detal i paleta inspirowana Bałtykiem, z dużą uwagą dla światła dziennego i łatwego utrzymania.'
    when 'd0000000-0000-4000-8000-000000000004' then 'Nook specjalizuje się w kompaktowych mieszkaniach, w których każdy metr musi pracować. Wrocławski zespół przygotowuje funkcjonalne układy, zabudowy i trwałe zestawienia materiałów dla domów, najmu i remontów inwestycyjnych.'
    when 'd0000000-0000-4000-8000-000000000005' then 'Natalia tworzy dopracowane wnętrza mieszkalne ze stolarką na wymiar, naturalnym kamieniem i starannie dobranym oświetleniem. Jej poznańska pracownia pracuje dla klientów ceniących uporządkowany proces, dokładną dokumentację i ponadczasowy rezultat.'
    when 'd0000000-0000-4000-8000-000000000006' then 'Studio Wątek pracuje z tym, co już obecne w budynku: oryginalną cegłą, starym drewnem, lastryko i śladami wcześniejszych funkcji. Łódzka pracownia łączy szacunek dla historii ze współczesnym komfortem i precyzyjnymi rozwiązaniami technicznymi.'
    when 'd0000000-0000-4000-8000-000000000007' then 'Karolina projektuje przyjazne wnętrza dla rozwijających się rodzin, wykorzystując trwałe materiały, elastyczne pomieszczenia i dużo ukrytego przechowywania. Proces obejmuje praktyczne warsztaty oraz nacisk na zdrowe wykończenia, światło i kontakt z naturą.'
  end,
  location = case id
    when 'd0000000-0000-4000-8000-000000000001' then 'Warszawa, Polska'
    when 'd0000000-0000-4000-8000-000000000002' then 'Kraków, Polska'
    when 'd0000000-0000-4000-8000-000000000003' then 'Gdańsk, Polska'
    when 'd0000000-0000-4000-8000-000000000004' then 'Wrocław, Polska'
    when 'd0000000-0000-4000-8000-000000000005' then 'Poznań, Polska'
    when 'd0000000-0000-4000-8000-000000000006' then 'Łódź, Polska'
    when 'd0000000-0000-4000-8000-000000000007' then 'Warszawa, Polska'
  end,
  profession_type = case
    when id in ('d0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000006') then 'Pracownia projektowania wnętrz'
    when id in ('d0000000-0000-4000-8000-000000000001','d0000000-0000-4000-8000-000000000005') then 'Architekt wnętrz'
    else 'Projektant wnętrz'
  end,
  cooperation_terms = case id
    when 'd0000000-0000-4000-8000-000000000001' then 'Kompleksowa współpraca zaczyna się od płatnej konsultacji i układu funkcjonalnego. Wizyty na budowie w Warszawie są dostępne przez cały etap realizacji.'
    when 'd0000000-0000-4000-8000-000000000002' then 'Dostępne są projekty koncepcyjne, wykonawcze i kompleksowe. Pełny pakiet obejmuje próbki materiałów i koordynację mebli na wymiar.'
    when 'd0000000-0000-4000-8000-000000000003' then 'Realizacje są prowadzone w Gdańsku, Gdyni i Sopocie. Dla klientów z innych regionów dostępne są zdalne pakiety koncepcyjne.'
    when 'd0000000-0000-4000-8000-000000000004' then 'Konsultacje dla małych mieszkań można zamówić osobno. Pełny pakiet obejmuje rysunki zabudów i uporządkowaną listę zakupową.'
    when 'd0000000-0000-4000-8000-000000000005' then 'Pracownia przyjmuje ograniczoną liczbę kompleksowych projektów kwartalnie. Zakupy i nadzór autorski są częścią rozszerzonego zakresu.'
    when 'd0000000-0000-4000-8000-000000000006' then 'Przed rozpoczęciem projektu w zabytkowym budynku zalecana jest inwentaryzacja techniczna. Możliwa jest dokumentacja remontu etapowego.'
    when 'd0000000-0000-4000-8000-000000000007' then 'Projekt domu rodzinnego może obejmować plan realizacji pomieszczenie po pomieszczeniu. Konsultacje i dobór materiałów są dostępne w Warszawie.'
  end,
  updated_at = now()
where is_demo = true;

with translations(old_title, new_title, new_description) as (values
  ('Mokotow Family Apartment','Rodzinne mieszkanie na Mokotowie','Mieszkanie 118 m² z dużą kuchnią i elastyczną strefą dzienną. Dębowa stolarka, wapień i łatwe w pielęgnacji tkaniny łączą spokój z codzienną funkcjonalnością.'),
  ('Wilanow Garden Townhouse','Dom z ogrodem w Wilanowie','Nowy dom z konsekwentną paletą naturalnych materiałów i zabudowami na trzech kondygnacjach. Zakres objął światło, łazienki i nadzór autorski.'),
  ('Zoliborz Soft Minimalism','Soft minimalizm na Żoliborzu','Powściągliwy remont zachował oryginalny parkiet, wprowadzając cieplejsze tynki, len i starannie otwarte widoki między pomieszczeniami.'),
  ('Powisle Compact Home','Kompaktowe mieszkanie na Powiślu','Na 48 m² przesuwna drewniana przegroda oddziela pracę od snu bez ograniczania światła. Zabudowa zapewnia przechowywanie wzdłuż całej ściany.'),
  ('Konstancin Garden House','Dom ogrodowy w Konstancinie','Dom rodzinny otwarty na ogród dzięki nowemu układowi jadalni, dużym przeszkleniom i palecie dębu, gliny oraz szczotkowanego metalu.'),
  ('City Centre Pied-a-terre','Miejskie pied-à-terre','Kompaktowe drugie mieszkanie z hotelowym przechowywaniem, rzeźbiarskim światłem i spokojną monochromatyczną sypialnią.'),
  ('Kazimierz Colour Story','Kolor na Kazimierzu','Remont kamienicy łączy odrestaurowane drzwi i sztukaterie z kobaltową zabudową, wzorzystym kamieniem i polską sztuką współczesną.'),
  ('Salwator Art Deco Apartment','Art déco na Salwatorze','Kompaktowe mieszkanie inspirowane geometrią art déco, przełożoną na orzech, ryflowane szkło i odważną, ale kontrolowaną kolorystykę.'),
  ('Podgorze Creative Loft','Kreatywny loft na Podgórzu','Dom artysty w dawnym warsztacie z ruchomymi podziałami, dużym wspólnym stołem i światłem do pracy oraz spotkań.'),
  ('Old Town Boutique Suite','Butikowy apartament na Starym Mieście','Sześć indywidualnych pokoi gościnnych łączy wspólna paleta głębokiej zieleni, terakoty i postarzanego mosiądzu.'),
  ('Bronowice Family Home','Rodzinny dom w Bronowicach','Żywe rodzinne wnętrze z trwałym lastryko, zaokrąglonymi meblami i kolorystycznie oznaczonym przechowywaniem dla dzieci.'),
  ('Vistula View Dining Room','Jadalnia z widokiem na Wisłę','Metamorfoza jadalni skupiona wokół lakierowanej zabudowy, krzeseł vintage i regulowanego światła na co dzień i większe spotkania.'),
  ('Oliwa Coastal Apartment','Nadmorskie mieszkanie w Oliwie','Szare drewno, jasny kamień i len tworzą spokojne wnętrze, którego długie osie widokowe nawiązują do otaczającego parku.'),
  ('Sopot Calm Retreat','Spokojny apartament w Sopocie','Weekendowe mieszkanie z zabudowanym siedziskiem, ukrytymi funkcjami i paletą, która pozostaje jasna także zimą.'),
  ('Gdynia Waterfront Home','Dom nad wodą w Gdyni','Rodzinny dom z trwałym dębem, panelami akustycznymi i zintegrowanym smart home, który nie dominuje wizualnie.'),
  ('Wrzeszcz Townhouse','Dom miejski we Wrzeszczu','Remont otworzył wąską klatkę schodową i wprowadził światło do środka dzięki wewnętrznym przeszkleniom i jasnym powierzchniom.'),
  ('Jelitkowo Holiday Apartment','Apartament wakacyjny w Jelitkowie','Łatwe w utrzymaniu wnętrze z elastycznymi miejscami do spania, kompaktowym przechowywaniem i trwałymi materiałami.'),
  ('Orlowo Kitchen Renewal','Nowa kuchnia w Orłowie','Modernizacja zachowała istniejącą podłogę, poprawiając komunikację, blaty robocze i połączenie z tarasem od strony morza.'),
  ('Nadodrze Micro Apartment','Mikromieszkanie na Nadodrzu','Na 29 m² powstały podest do spania, pełna zabudowa i kuchnia znikająca za składanymi frontami.'),
  ('Olbin Rental Refresh','Mieszkanie na wynajem na Ołbinie','Szybki remont skoncentrowany na świetle, trwałej łazience i spójnym zestawie wyposażenia gotowym do sprawnego montażu.'),
  ('Krzyki Smart Home','Smart home na Krzykach','Kompaktowe mieszkanie z integracją światła, ogrzewania i rolet w prostej palecie materiałowej i czystym układzie.'),
  ('Market Square Studio','Studio przy Rynku','Historyczne studio na krótkie pobyty z odwracalnymi zmianami i zabudową dopasowaną do nieregularnych ścian.'),
  ('Psie Pole Family Apartment','Rodzinne mieszkanie na Psim Polu','Praktyczny układ oddziela strefy głośne od cichych i dodaje funkcjonalną ścianę pralniczą przy łazience.'),
  ('Riverside Home Office','Gabinet nad rzeką','Gabinet i pokój gościnny z zasłonami akustycznymi, składanym łóżkiem i biurkiem wykorzystującym widok na rzekę.'),
  ('Jezyce Quiet Luxury','Quiet luxury na Jeżycach','Wyrafinowane mieszkanie z symetrycznie łączonym kamieniem, przydymionym dębem i miękko odbijającym światło tynkiem.'),
  ('Solacz Villa','Willa na Sołaczu','Willa z lat 30. otrzymała nowe instalacje przy zachowaniu schodów, proporcji i relacji z ogrodem.'),
  ('Wilda Tailored Apartment','Mieszkanie szyte na miarę na Wildzie','Zabudowa porządkuje długie mieszkanie i nadaje pomieszczeniom odrębny charakter przez subtelne zmiany drewna i tkanin.'),
  ('Stary Browar Penthouse','Penthouse przy Starym Browarze','Penthouse dla sztuki, spotkań i panoramicznych widoków z oświetleniem galeryjnym oraz dyskretną kuchnią pomocniczą.'),
  ('Grunwald Family Residence','Rodzinna rezydencja na Grunwaldzie','Wielopokoleniowy dom ze spokojnymi częściami wspólnymi, prywatnymi sypialniami i naturalnymi materiałami, które dobrze się starzeją.'),
  ('Poznan Guest Suite','Apartament gościnny w Poznaniu','Hotelowy apartament gościnny z zabudowanymi szafami, wielowarstwowym światłem i kamienną łazienką za ryflowanym szkłem.'),
  ('Ksiezy Mlyn Loft','Loft na Księżym Młynie','Dawny loft fabryczny, w którym naprawy cegły, stali i drewna pozostają widoczne obok precyzyjnej kuchni i rozwiązań akustycznych.'),
  ('Piotrkowska Vintage Apartment','Mieszkanie vintage przy Piotrkowskiej','Remont rozpoczął się od katalogowania i renowacji oryginalnych detali, do których dodano współczesne łazienki i elastyczne światło.'),
  ('Textile House Conversion','Dom w dawnej fabryce włókienniczej','Magazyn przekształcono w dom rodzinny z ciepłym rdzeniem mieszczącym instalacje, przechowywanie i prywatne pokoje.'),
  ('Baluty Artist Home','Dom artysty na Bałutach','Mieszkanie łączy duże ściany do pracy, znalezione meble i trwałą kuchnię zaprojektowaną do wspólnego gotowania.'),
  ('Film School Residence','Dom filmowca','Wnętrze z projekcją, pełnym zaciemnieniem i akustyką ukrytą w drewnianych panelach.'),
  ('Fabryczna Creative Office','Kreatywne biuro na Fabrycznej','Kompaktowe biuro wykorzystuje wtórne szklane ścianki, odnowione lampy industrialne i modułowe stoły.'),
  ('Sadyba Family Home','Rodzinny dom na Sadybie','Ciepły dom z centralną kuchnią, przechowywaniem przy wejściu i elastycznymi strefami zabawy rosnącymi razem z dziećmi.'),
  ('Ursynow Sustainable Apartment','Zrównoważone mieszkanie na Ursynowie','Niskoemisyjny remont z certyfikowanym drewnem, farbami mineralnymi i odnowionymi meblami, opisanymi w karcie materiałowej.'),
  ('Wawer Biophilic House','Biofiliczny dom w Wawrze','Dom ogrodowy oparty na świetle, roślinach i naturalnej wentylacji, z trwałymi wykończeniami dla dzieci i zwierząt.'),
  ('Bemowo First Home','Pierwsze mieszkanie na Bemowie','Realistyczny projekt pierwszego mieszkania nadał priorytet układowi, światłu i kuchni, rozkładając dekoracyjne zakupy w czasie.'),
  ('Praga Child-friendly Apartment','Mieszkanie przyjazne dzieciom na Pradze','Zaokrąglone detale, zmywalne powierzchnie i przechowywanie na różnych wysokościach wspierają samodzielność dzieci.'),
  ('Rembertow Renovation','Etapowy remont w Rembertowie','Plan remontu zamieszkanego domu pozwolił prowadzić prace kondygnacja po kondygnacji bez utraty najważniejszych funkcji.')
)
update public.projects project_record
set title = translations.new_title,
    description = translations.new_description
from translations
where project_record.title = translations.old_title;

update public.inspiration_articles set
  title = case slug
    when 'modern-living-room-trends' then 'Trendy w nowoczesnym salonie'
    when 'sustainable-architecture-guide' then 'Przewodnik po zrównoważonej architekturze'
    when 'minimalist-kitchen-design' then 'Jak zaprojektować minimalistyczną kuchnię'
  end,
  excerpt = case slug
    when 'modern-living-room-trends' then 'Ciepły minimalizm, zaokrąglone meble, naturalne faktury i układ oparty na świetle.'
    when 'sustainable-architecture-guide' then 'Jak wybór materiałów, światło dzienne i projektowanie pasywne tworzą lepsze budynki.'
    when 'minimalist-kitchen-design' then 'Przechowywanie, światło i spokojne powierzchnie w kuchniach, które pięknie się starzeją.'
  end,
  body = case slug
    when 'modern-living-room-trends' then E'Nowoczesny salon działa najlepiej, gdy układ zaczyna się od codziennego ruchu, a nie od dekoracji. Zachowaj swobodne przejścia i skup meble wokół jednego wyraźnego centrum spotkań.\n\nCiepłe drewno, wyczuwalne faktury i spokojne kolory ścian sprawiają, że minimalistyczne wnętrze jest przyjazne, a nie puste. Zaokrąglone formy mogą je zmiękczyć, ale powinny wspierać wygodę i właściwą skalę.\n\nStosuj kilka warstw światła: ogólne do codziennych czynności, kierunkowe do czytania i łagodne akcenty wieczorem. Rezultat powinien być elastyczny, spokojny i łatwy w utrzymaniu.'
    when 'sustainable-architecture-guide' then E'Zrównoważone projektowanie zaczyna się przed wyborem wykończeń. Orientacja, światło dzienne, wentylacja i efektywny układ mogą ograniczyć zapotrzebowanie na energię i poprawić komfort.\n\nWybieraj trwałe materiały o przejrzystym pochodzeniu i rozważ, czy poszczególne warstwy można naprawić, ponownie wykorzystać lub poddać recyklingowi. Produkty lokalne mają sens, gdy spełniają także wymagania techniczne.\n\nDobry brief łączy mierzalne cele z budżetem, możliwościami utrzymania i długoterminowymi planami klienta.'
    when 'minimalist-kitchen-design' then E'Minimalistyczna kuchnia nie oznacza po prostu mniejszej liczby przedmiotów. Działa wtedy, gdy przechowywanie, przygotowanie, gotowanie i sprzątanie są zorganizowane wokół realnych nawyków.\n\nZacznij od rzeczy używanych codziennie i umieść je blisko właściwej strefy pracy. Zabudowa do sufitu ogranicza wizualny chaos, a otwarte półki warto przeznaczyć tylko na rzeczy naprawdę użyteczne lub ważne.\n\nWybierz ograniczoną paletę materiałów, praktyczne oświetlenie blatu i okucia odporne na intensywne użytkowanie. Prostota jest rezultatem szczegółowego planowania.'
  end,
  category = case slug
    when 'modern-living-room-trends' then 'Trendy'
    when 'sustainable-architecture-guide' then 'Zrównoważone wnętrza'
    when 'minimalist-kitchen-design' then 'Poradniki'
  end,
  author_name = 'Redakcja ArchiCompass',
  updated_at = now()
where slug in ('modern-living-room-trends','sustainable-architecture-guide','minimalist-kitchen-design');

commit;

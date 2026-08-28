-- Correct legacy Polish article fields that still held English fallback values.
-- The three records already have reviewed bilingual article blocks; this keeps
-- card, metadata and cover text aligned with the Polish primary experience.

begin;

update public.inspiration_articles
set
  title_pl = case slug
    when 'modern-living-room-trends' then 'Trendy w nowoczesnym salonie'
    when 'sustainable-architecture-guide' then 'Przewodnik po zrównoważonej architekturze'
    when 'minimalist-kitchen-design' then 'Jak zaprojektować minimalistyczną kuchnię'
  end,
  excerpt_pl = case slug
    when 'modern-living-room-trends' then 'Ciepły minimalizm, zaokrąglone meble, naturalne faktury i układ oparty na świetle.'
    when 'sustainable-architecture-guide' then 'Jak wybór materiałów, światło dzienne i projektowanie pasywne tworzą lepsze budynki.'
    when 'minimalist-kitchen-design' then 'Przechowywanie, światło i spokojne powierzchnie w kuchniach, które pięknie się starzeją.'
  end,
  author_name_pl = 'Redakcja ArchiCompass',
  cover_alt_pl = case slug
    when 'modern-living-room-trends' then 'Nowoczesny salon z ciepłym drewnem, miękkimi tkaninami i warstwowym oświetleniem'
    when 'sustainable-architecture-guide' then 'Jasne zrównoważone wnętrze z naturalnymi materiałami i światłem dziennym'
    when 'minimalist-kitchen-design' then 'Minimalistyczna kuchnia z zabudową do sufitu i spokojnymi naturalnymi wykończeniami'
  end,
  meta_title_pl = case slug
    when 'modern-living-room-trends' then 'Trendy w nowoczesnym salonie: układ, materiały i światło'
    when 'sustainable-architecture-guide' then 'Zrównoważona architektura: praktyczny przewodnik do projektu'
    when 'minimalist-kitchen-design' then 'Minimalistyczna kuchnia: przechowywanie, światło i materiały'
  end,
  meta_description_pl = case slug
    when 'modern-living-room-trends' then 'Zaplanuj spokojny, funkcjonalny salon dzięki ciepłym materiałom, dobrym proporcjom i warstwowemu oświetleniu.'
    when 'sustainable-architecture-guide' then 'Praktyczny przewodnik po świetle dziennym, trwałych materiałach, projektowaniu pasywnym i realnym briefie zrównoważonego projektu.'
    when 'minimalist-kitchen-design' then 'Zaprojektuj minimalistyczną kuchnię wokół codziennych nawyków, praktycznego przechowywania, trwałych wykończeń i dobrego światła.'
  end,
  focus_keyword_pl = case slug
    when 'modern-living-room-trends' then 'trendy w nowoczesnym salonie'
    when 'sustainable-architecture-guide' then 'zrównoważona architektura'
    when 'minimalist-kitchen-design' then 'minimalistyczna kuchnia'
  end,
  updated_at = now()
where slug in ('modern-living-room-trends', 'sustainable-architecture-guide', 'minimalist-kitchen-design');

commit;

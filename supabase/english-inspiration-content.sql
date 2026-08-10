-- Complete the English counterpart of the three original Inspiration Hub articles.
-- The public renderer reads bilingual content blocks, so both locales stay in
-- the same article record and language switching never loses the article.

begin;

update public.inspiration_articles
set
  title_en = case slug
    when 'modern-living-room-trends' then 'Modern Living Room Trends'
    when 'sustainable-architecture-guide' then 'Sustainable Architecture Guide'
    when 'minimalist-kitchen-design' then 'Minimalist Kitchen Design'
  end,
  excerpt_en = case slug
    when 'modern-living-room-trends' then 'Warm minimalism, curved furniture, natural textures, and light-driven layouts.'
    when 'sustainable-architecture-guide' then 'How material choices, daylight, and passive design shape better buildings.'
    when 'minimalist-kitchen-design' then 'Storage, lighting, and quiet surfaces for kitchens that age beautifully.'
  end,
  author_name_en = 'ArchiCompass Editorial',
  cover_alt_en = case slug
    when 'modern-living-room-trends' then 'Modern living room with warm wood, tactile textiles, and layered lighting'
    when 'sustainable-architecture-guide' then 'Bright sustainable interior with natural materials and daylight'
    when 'minimalist-kitchen-design' then 'Minimalist kitchen with full-height storage and calm natural finishes'
  end,
  meta_title_en = case slug
    when 'modern-living-room-trends' then 'Modern Living Room Trends: Layout, Materials and Lighting'
    when 'sustainable-architecture-guide' then 'Sustainable Architecture: A Practical Guide for Your Project'
    when 'minimalist-kitchen-design' then 'Minimalist Kitchen Design: Storage, Lighting and Materials'
  end,
  meta_description_en = case slug
    when 'modern-living-room-trends' then 'Plan a calm, practical living room with warm materials, balanced proportions, and layered lighting.'
    when 'sustainable-architecture-guide' then 'A practical guide to daylight, durable materials, passive design, and a realistic sustainability brief.'
    when 'minimalist-kitchen-design' then 'Design a minimalist kitchen around real habits, practical storage, durable finishes, and thoughtful lighting.'
  end,
  focus_keyword_en = case slug
    when 'modern-living-room-trends' then 'modern living room trends'
    when 'sustainable-architecture-guide' then 'sustainable architecture guide'
    when 'minimalist-kitchen-design' then 'minimalist kitchen design'
  end,
  content_blocks = case slug
    when 'modern-living-room-trends' then jsonb_build_array(
      jsonb_build_object('id', 'modern-01', 'type', 'paragraph', 'tone', 'lead',
        'content_pl', 'Nowoczesny salon działa najlepiej, gdy układ zaczyna się od codziennego ruchu, a nie od dekoracji. Zachowaj swobodne przejścia i skup meble wokół jednego wyraźnego centrum spotkań.',
        'content_en', 'A modern living room works best when the layout begins with everyday movement, not decoration. Keep the main circulation path clear and group furniture around one strong social focal point.'),
      jsonb_build_object('id', 'modern-02', 'type', 'paragraph',
        'content_pl', 'Ciepłe drewno, wyczuwalne faktury i spokojne kolory ścian sprawiają, że minimalistyczne wnętrze jest przyjazne, a nie puste. Zaokrąglone formy mogą je zmiękczyć, ale powinny wspierać wygodę i właściwą skalę.',
        'content_en', 'Warm woods, tactile fabrics, and quieter wall colours make minimal spaces feel lived in rather than empty. Curved forms can soften the room, but they should support comfort and scale instead of becoming a theme.'),
      jsonb_build_object('id', 'modern-03', 'type', 'paragraph',
        'content_pl', 'Stosuj kilka warstw światła: ogólne do codziennych czynności, kierunkowe do czytania i łagodne akcenty wieczorem. Rezultat powinien być elastyczny, spokojny i łatwy w utrzymaniu.',
        'content_en', 'Use layered lighting: general light for practical use, focused light for reading, and softer accents for the evening. The result should be adaptable, calm, and easy to maintain.')
    )
    when 'sustainable-architecture-guide' then jsonb_build_array(
      jsonb_build_object('id', 'sustainable-01', 'type', 'paragraph', 'tone', 'lead',
        'content_pl', 'Zrównoważone projektowanie zaczyna się przed wyborem wykończeń. Orientacja, światło dzienne, wentylacja i efektywny układ mogą ograniczyć zapotrzebowanie na energię i poprawić komfort.',
        'content_en', 'Sustainable design starts before finishes are selected. Orientation, daylight, ventilation, and an efficient plan can reduce energy demand while making a space more comfortable.'),
      jsonb_build_object('id', 'sustainable-02', 'type', 'paragraph',
        'content_pl', 'Wybieraj trwałe materiały o przejrzystym pochodzeniu i rozważ, czy poszczególne warstwy można naprawić, ponownie wykorzystać lub poddać recyklingowi. Produkty lokalne mają sens, gdy spełniają także wymagania techniczne.',
        'content_en', 'Prefer durable materials with transparent sourcing and consider how each layer can be repaired, reused, or recycled. Local products are useful when they also meet the project\'s performance needs.'),
      jsonb_build_object('id', 'sustainable-03', 'type', 'paragraph',
        'content_pl', 'Dobry brief łączy mierzalne cele z budżetem, możliwościami utrzymania i długoterminowymi planami klienta.',
        'content_en', 'A good sustainability brief balances measurable targets with the client\'s budget, maintenance capacity, and long-term plans for the property.')
    )
    when 'minimalist-kitchen-design' then jsonb_build_array(
      jsonb_build_object('id', 'kitchen-01', 'type', 'paragraph', 'tone', 'lead',
        'content_pl', 'Minimalistyczna kuchnia nie oznacza po prostu mniejszej liczby przedmiotów. Działa wtedy, gdy przechowywanie, przygotowanie, gotowanie i sprzątanie są zorganizowane wokół realnych nawyków.',
        'content_en', 'Minimalist kitchens are not defined by having fewer things. They work because storage, preparation, cooking, and cleaning have been organised around real habits.'),
      jsonb_build_object('id', 'kitchen-02', 'type', 'paragraph',
        'content_pl', 'Zacznij od rzeczy używanych codziennie i umieść je blisko właściwej strefy pracy. Zabudowa do sufitu ogranicza wizualny chaos, a otwarte półki warto przeznaczyć tylko na rzeczy naprawdę użyteczne lub ważne.',
        'content_en', 'Start with the items used every day and place them close to the relevant work zone. Full-height storage can reduce visual noise, while open shelves should be reserved for objects that are genuinely useful or meaningful.'),
      jsonb_build_object('id', 'kitchen-03', 'type', 'paragraph',
        'content_pl', 'Wybierz ograniczoną paletę materiałów, praktyczne oświetlenie blatu i okucia odporne na intensywne użytkowanie. Prostota jest rezultatem szczegółowego planowania.',
        'content_en', 'Choose a restrained material palette, practical worktop lighting, and hardware that can withstand repeated use. Simplicity is the result of detailed planning.')
    )
  end,
  updated_at = now()
where slug in ('modern-living-room-trends', 'sustainable-architecture-guide', 'minimalist-kitchen-design');

commit;

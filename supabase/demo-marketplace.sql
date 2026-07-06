-- Replace early test professionals with a polished, clearly labelled demo catalogue.
-- Demo profiles are public presentation records only: they cannot sign in or receive briefs.

begin;

alter table public.profiles
  add column if not exists is_demo boolean not null default false;

alter table public.studios
  add column if not exists is_demo boolean not null default false;

create temporary table old_professional_ids on commit drop as
select id
from public.profiles
where user_type = 'professional'
  and not coalesce(is_demo, false);

-- Remove the old professional catalogue and its conversations while preserving
-- the owner login used for administration.
delete from public.studios;

delete from public.favorites
where entity_type in ('designer', 'studio', 'project');

delete from public.projects
where profile_id in (select id from old_professional_ids)
   or profile_id in (select id from public.profiles where is_demo);

update public.account_roles role_record
set role = 'client', updated_at = now()
where role_record.user_id in (select id from old_professional_ids)
  and exists (
    select 1
    from public.admin_roles admin_record
    where admin_record.user_id = role_record.user_id
      and admin_record.active
  );

update public.profiles profile_record
set
  user_type = 'client',
  profession_type = null,
  company_name = null,
  specialties = '{}',
  service_categories = '{}',
  service_capabilities = '{}',
  hourly_rate = null,
  pricing_model = null,
  price_from = null,
  price_to = null,
  minimum_project_budget = null,
  work_modes = '{}',
  availability_status = null,
  cooperation_terms = null,
  years_experience = null,
  profile_headline = null,
  profile_logo_path = null,
  profile_banner_path = null,
  updated_at = now()
where profile_record.id in (select id from old_professional_ids)
  and exists (
    select 1
    from public.admin_roles admin_record
    where admin_record.user_id = profile_record.id
      and admin_record.active
  );

delete from auth.users user_record
where user_record.id in (select id from old_professional_ids)
  and not exists (
    select 1
    from public.admin_roles admin_record
    where admin_record.user_id = user_record.id
      and admin_record.active
  );

delete from public.profiles profile_record
where profile_record.id in (select id from old_professional_ids)
  and not exists (
    select 1
    from public.admin_roles admin_record
    where admin_record.user_id = profile_record.id
      and admin_record.active
  );

delete from public.profiles where is_demo;

insert into public.profiles (
  id,
  avatar_url,
  full_name,
  profile_headline,
  bio,
  user_type,
  location,
  profession_type,
  company_name,
  specialties,
  service_categories,
  service_capabilities,
  languages,
  pricing_model,
  price_from,
  price_to,
  minimum_project_budget,
  work_modes,
  availability_status,
  cooperation_terms,
  years_experience,
  is_demo,
  created_at,
  updated_at
)
values
(
  'd0000000-0000-4000-8000-000000000001',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'Marta Wysocka Interiors',
  'Soft minimalism for warm, practical city homes',
  'Marta creates calm residential interiors with natural materials, tailored storage and carefully planned light. Her Warsaw practice works with apartments and family houses from the first layout studies through technical documentation, sourcing and site coordination.',
  'professional', 'Warsaw, Poland', 'Interior architect', 'Marta Wysocka Interiors',
  array['Japandi','Soft minimalism','Scandinavian','Families with children','Large homes','Sustainable design'],
  array['Whole home or apartment','Kitchen','Living room','Bathroom','Bedroom','Children''s room'],
  array['3D visualization','Site consultations','Author''s supervision','Technical documentation','Sourcing and procurement'],
  array['Polish','English'], 'Per m2', 180, 260, 60000,
  array['On-site','Remote','Hybrid'], 'Available now',
  'Full-scope projects usually begin with a paid consultation and a functional-layout phase. Warsaw site visits are available throughout implementation.',
  11, true, now() - interval '70 days', now()
),
(
  'd0000000-0000-4000-8000-000000000002',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'Studio Jasna Forma',
  'Expressive interiors balanced by disciplined planning',
  'Jasna Forma combines colour, vintage pieces and contemporary Polish design without sacrificing function. The Krakow practice is especially experienced in tenement apartments, hospitality spaces and homes whose owners want a distinctive, personal result.',
  'professional', 'Krakow, Poland', 'Interior design studio', 'Studio Jasna Forma',
  array['Eclectic','Art Deco','Dopamine decor','Vintage','Short-term rentals','Accessible interiors'],
  array['Whole home or apartment','Kitchen','Living room','Bathroom','Commercial or hospitality','Rental or investment property'],
  array['3D visualization','Site consultations','Author''s supervision','Full project coordination','Technical documentation','Sourcing and procurement'],
  array['Polish','English'], 'Per m2', 220, 320, 80000,
  array['On-site','Remote','Hybrid'], 'Within 1 month',
  'Concept, executive and turn-key scopes are available. Material samples and custom furniture coordination are included in comprehensive packages.',
  9, true, now() - interval '63 days', now()
),
(
  'd0000000-0000-4000-8000-000000000003',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'Piotr Zielinski Studio',
  'Contemporary coastal interiors shaped by daylight',
  'Piotr designs relaxed, durable homes across the Tri-City area. His work is known for clear circulation, restrained detailing and a palette inspired by the Baltic coast, with close attention to natural light and long-term maintenance.',
  'professional', 'Gdansk, Poland', 'Interior designer', 'Piotr Zielinski Studio',
  array['Contemporary','Scandinavian','Minimalist','Large homes','Sustainable design','Smart homes'],
  array['Whole home or apartment','Kitchen','Living room','Bathroom','Bedroom','Home office'],
  array['3D visualization','Site consultations','Author''s supervision','Technical documentation','Sourcing and procurement'],
  array['Polish','English','German'], 'Per m2', 160, 240, 50000,
  array['On-site','Remote','Hybrid'], 'Within 1 month',
  'Projects are available throughout Gdansk, Gdynia and Sopot. Remote concept packages are offered for clients elsewhere in Poland and abroad.',
  13, true, now() - interval '56 days', now()
),
(
  'd0000000-0000-4000-8000-000000000004',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'Pracownia Nook',
  'Small spaces, smart storage and investment-ready homes',
  'Nook specialises in compact apartments where every square metre must work hard. The Wroclaw team prepares functional layouts, custom-storage concepts and durable material schedules for private homes, rentals and investor refurbishments.',
  'professional', 'Wroclaw, Poland', 'Interior design practice', 'Pracownia Nook',
  array['Modern','Minimalist','Industrial','Small spaces','Short-term rentals','Budget-conscious projects','Smart homes'],
  array['Whole home or apartment','Kitchen','Living room','Bathroom','Bedroom','Home office','Rental or investment property'],
  array['3D visualization','Site consultations','Technical documentation','Sourcing and procurement'],
  array['Polish','English'], 'Per m2', 140, 210, 30000,
  array['On-site','Remote','Hybrid'], 'Available now',
  'Compact-home consultations can be booked separately. Full packages include drawings for bespoke joinery and a prioritised shopping list.',
  7, true, now() - interval '49 days', now()
),
(
  'd0000000-0000-4000-8000-000000000005',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80',
  'Natalia Kaczmarek Design',
  'Quiet luxury grounded in craftsmanship and proportion',
  'Natalia develops refined residential interiors with bespoke joinery, tactile stone and carefully sourced lighting. Her Poznan studio works with clients who value a measured process, detailed documentation and a timeless result rather than short-lived trends.',
  'professional', 'Poznan, Poland', 'Interior architect', 'Natalia Kaczmarek Design',
  array['Quiet luxury','Minimaluxe','Contemporary','Art Deco','Large homes'],
  array['Whole home or apartment','Kitchen','Living room','Bathroom','Bedroom'],
  array['3D visualization','Site consultations','Author''s supervision','Full project coordination','Technical documentation','Sourcing and procurement'],
  array['Polish','English','French'], 'Per m2', 250, 380, 120000,
  array['On-site','Remote','Hybrid'], 'Within 1-3 months',
  'The studio accepts a limited number of full residential commissions each quarter. Procurement and author supervision are available as part of the comprehensive scope.',
  12, true, now() - interval '42 days', now()
),
(
  'd0000000-0000-4000-8000-000000000006',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'Studio Watek',
  'Character-led renovations for historic and industrial spaces',
  'Studio Watek works with the layers already present in a building: original brick, old timber, terrazzo and traces of previous uses. The Lodz practice combines conservation-minded decisions with contemporary comfort and precise technical solutions.',
  'professional', 'Lodz, Poland', 'Interior architecture studio', 'Studio Watek',
  array['Industrial','Vintage','Eclectic','Contemporary','Accessible interiors','Sustainable design'],
  array['Whole home or apartment','Kitchen','Living room','Bathroom','Commercial or hospitality','Home office'],
  array['3D visualization','Site consultations','Author''s supervision','Technical documentation','Sourcing and procurement'],
  array['Polish','English'], 'Per m2', 150, 230, 45000,
  array['On-site','Remote','Hybrid'], 'Available now',
  'A technical site assessment is recommended before design work begins in historic buildings. Phased renovation documentation is available.',
  10, true, now() - interval '35 days', now()
),
(
  'd0000000-0000-4000-8000-000000000007',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'Karolina Maj Interiors',
  'Healthy, flexible homes designed around everyday family life',
  'Karolina plans welcoming interiors for growing families, with robust materials, flexible rooms and plenty of concealed storage. Her process includes practical workshops with clients and a strong focus on low-emission finishes, daylight and biophilic elements.',
  'professional', 'Warsaw, Poland', 'Interior designer', 'Karolina Maj Interiors',
  array['Scandinavian','Japandi','Bohemian','Families with children','Small spaces','Sustainable design','Budget-conscious projects'],
  array['Whole home or apartment','Kitchen','Living room','Bathroom','Bedroom','Children''s room','Home office'],
  array['3D visualization','Site consultations','Author''s supervision','Technical documentation','Sourcing and procurement'],
  array['Polish','English'], 'Per m2', 170, 250, 50000,
  array['On-site','Remote','Hybrid'], 'Within 1 month',
  'Family-home projects can include a room-by-room implementation plan. Warsaw consultations and material-selection meetings are available on site.',
  8, true, now() - interval '28 days', now()
);

with image_pool as (
  select array[
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600607688960-e095ff83135c?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600573472556-e636c2acda88?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1630699295283-427dbddca05d?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1630699295509-a199b5370538?auto=format&fit=crop&w=1600&q=82',
    'https://images.unsplash.com/photo-1723641302830-55ee51c59fd7?auto=format&fit=crop&w=1600&q=82'
  ]::text[] as images
),
project_sets(profile_order, profile_id, titles, categories, descriptions) as (
  values
  (1, 'd0000000-0000-4000-8000-000000000001'::uuid,
    array['Mokotow Family Apartment','Wilanow Garden Townhouse','Zoliborz Soft Minimalism','Powisle Compact Home','Konstancin Garden House','City Centre Pied-a-terre'],
    array['Apartment','House','Apartment','Apartment','House','Apartment'],
    array[
      'A 118 m2 family apartment organised around a generous kitchen and flexible living zone. Oak joinery, limestone and washable textiles keep the calm palette practical for daily life.',
      'A new-build townhouse with a continuous natural-material palette and custom storage on all three floors. The scope included lighting, bathrooms and author supervision.',
      'A restrained renovation that retained the original parquet and introduced warmer plaster tones, linen textures and carefully framed views between rooms.',
      'A 48 m2 apartment where a sliding timber screen separates work and sleep without reducing daylight. Built-in furniture provides storage along one continuous wall.',
      'A family house connected to its garden through a new dining layout, large-format glazing and a muted palette of oak, clay and brushed metal.',
      'A compact second home designed for easy maintenance, with hotel-like storage, sculptural lighting and a quiet monochrome bedroom.'
    ]),
  (2, 'd0000000-0000-4000-8000-000000000002'::uuid,
    array['Kazimierz Colour Story','Salwator Art Deco Apartment','Podgorze Creative Loft','Old Town Boutique Suite','Bronowice Family Home','Vistula View Dining Room'],
    array['Apartment','Apartment','Loft','Hospitality','House','Dining room'],
    array[
      'A layered tenement renovation pairing restored doors and ceiling mouldings with cobalt joinery, patterned stone and contemporary Polish art.',
      'A compact apartment influenced by late Art Deco geometry, translated into walnut details, fluted glass and a confident but controlled colour scheme.',
      'An artist home in a former workshop, with movable partitions, an oversized communal table and lighting designed for both work and entertaining.',
      'Six individually composed guest rooms connected by a common palette of deep green, terracotta and aged brass.',
      'A lively family interior with durable terrazzo, rounded furniture and colour-coded storage that helps children use the space independently.',
      'A dining-room transformation centred on a custom lacquered cabinet, vintage chairs and adjustable lighting for everyday meals and larger gatherings.'
    ]),
  (3, 'd0000000-0000-4000-8000-000000000003'::uuid,
    array['Oliwa Coastal Apartment','Sopot Calm Retreat','Gdynia Waterfront Home','Wrzeszcz Townhouse','Jelitkowo Holiday Apartment','Orlowo Kitchen Renewal'],
    array['Apartment','Apartment','House','House','Apartment','Kitchen'],
    array[
      'Soft grey timber, pale stone and linen create a calm apartment whose layout borrows long sightlines from the surrounding park landscape.',
      'A weekend apartment designed with built-in seating, concealed utilities and a palette that remains bright through the Baltic winter.',
      'A waterfront family home using robust oak, acoustic panels and integrated smart-home controls without making the technology visually dominant.',
      'The renovation opened a narrow townhouse staircase and introduced daylight to the centre through internal glazing and pale reflective finishes.',
      'A low-maintenance holiday home with flexible sleeping places, compact storage and durable finishes selected for sand and frequent guest use.',
      'A kitchen renewal that kept the existing floor while improving circulation, work surfaces and the connection to a small sea-facing terrace.'
    ]),
  (4, 'd0000000-0000-4000-8000-000000000004'::uuid,
    array['Nadodrze Micro Apartment','Olbin Rental Refresh','Krzyki Smart Home','Market Square Studio','Psie Pole Family Apartment','Riverside Home Office'],
    array['Apartment','Rental property','Apartment','Apartment','Apartment','Home office'],
    array[
      'A 29 m2 apartment with a raised sleeping platform, full-height storage and a kitchen that disappears behind folding fronts.',
      'A targeted rental renovation focused on lighting, bathroom durability and a coherent furniture package that could be installed quickly.',
      'A compact smart home where lighting, heating and blinds are integrated into a simple material palette and an uncluttered plan.',
      'A historic studio adapted for short stays, with reversible interventions and joinery designed around the irregular existing walls.',
      'A practical family layout that separates noisy and quiet zones and adds an efficient laundry wall beside the bathroom.',
      'A dual-purpose study and guest room with acoustic curtains, a fold-down bed and a desk positioned to make the most of river views.'
    ]),
  (5, 'd0000000-0000-4000-8000-000000000005'::uuid,
    array['Jezyce Quiet Luxury','Solacz Villa','Wilda Tailored Apartment','Stary Browar Penthouse','Grunwald Family Residence','Poznan Guest Suite'],
    array['Apartment','House','Apartment','Penthouse','House','Bedroom'],
    array[
      'A refined apartment built around book-matched stone, smoked oak and softly reflective plaster, with every service integrated into the joinery.',
      'A 1930s villa carefully updated with new technical systems while preserving the staircase, proportions and relationship to the garden.',
      'Bespoke cabinetry organises a long urban apartment and gives each room a distinct identity through subtle changes in timber and textile.',
      'A penthouse planned for art, entertaining and panoramic views, with gallery-grade lighting and a discreet catering kitchen.',
      'A multigenerational home with calm shared spaces, private bedroom suites and durable natural materials intended to age well.',
      'A hotel-inspired guest suite with integrated wardrobes, layered lighting and a compact stone bathroom behind fluted-glass doors.'
    ]),
  (6, 'd0000000-0000-4000-8000-000000000006'::uuid,
    array['Ksiezy Mlyn Loft','Piotrkowska Vintage Apartment','Textile House Conversion','Baluty Artist Home','Film School Residence','Fabryczna Creative Office'],
    array['Loft','Apartment','House','Apartment','House','Office'],
    array[
      'A former factory loft where brick, steel and timber repairs remain visible alongside a precise new kitchen and acoustic interventions.',
      'An apartment renovation that catalogued and restored original details before adding contemporary bathrooms and flexible lighting.',
      'A textile warehouse converted into a family home with a warm inner core containing storage, services and private rooms.',
      'An artist apartment balancing large working walls, found furniture and a robust kitchen designed for communal meals.',
      'A residence for a filmmaker with integrated projection, blackout solutions and acoustic treatments concealed within timber panelling.',
      'A compact creative office using reused glass partitions, restored industrial lamps and modular worktables for changing team sizes.'
    ]),
  (7, 'd0000000-0000-4000-8000-000000000007'::uuid,
    array['Sadyba Family Home','Ursynow Sustainable Apartment','Wawer Biophilic House','Bemowo First Home','Praga Child-friendly Apartment','Rembertow Renovation'],
    array['House','Apartment','House','Apartment','Apartment','House'],
    array[
      'A warm family home with a central kitchen, mudroom storage and flexible play areas that can change as the children grow.',
      'A low-emission apartment renovation using certified timber, mineral paint and refurbished furniture, supported by a detailed material log.',
      'A garden house organised around daylight, indoor planting and natural ventilation, with durable finishes chosen for pets and children.',
      'A realistic first-home package that prioritised layout, lighting and the kitchen while phasing decorative purchases over time.',
      'A child-friendly apartment with rounded details, washable surfaces and storage placed at different heights for independent daily routines.',
      'A staged renovation plan for an occupied family house, allowing the work to proceed floor by floor without losing essential rooms.'
    ])
)
insert into public.projects (
  id, profile_id, title, category, description, image_url, image_urls, image_paths, created_at
)
select
  gen_random_uuid(),
  project_sets.profile_id,
  project_sets.titles[item_index],
  project_sets.categories[item_index],
  project_sets.descriptions[item_index],
  image_pool.images[((project_sets.profile_order - 1) * 6 + item_index - 1) % cardinality(image_pool.images) + 1],
  array[
    image_pool.images[((project_sets.profile_order - 1) * 6 + item_index - 1) % cardinality(image_pool.images) + 1],
    image_pool.images[((project_sets.profile_order - 1) * 6 + item_index) % cardinality(image_pool.images) + 1],
    image_pool.images[((project_sets.profile_order - 1) * 6 + item_index + 1) % cardinality(image_pool.images) + 1]
  ],
  '{}',
  now() - make_interval(days => (project_sets.profile_order * 6 + item_index))
from project_sets
cross join image_pool
cross join lateral generate_subscripts(project_sets.titles, 1) as item_index;

commit;

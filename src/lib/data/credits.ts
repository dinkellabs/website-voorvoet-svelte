export interface PythonPackage {
  name: string;
  url: string;
  desc: { nl: string; de: string; en: string };
}

export interface ImageCredit {
  category: string;
  desc: { nl: string; de: string; en: string };
  imagePath: string;
  author: string | null;
  authorUrl: string | null;
  source: string;
  sourceUrl: string | null;
}

export const PYTHON_PACKAGES: PythonPackage[] = [
  {
    name: 'SvelteKit',
    url: 'https://kit.svelte.dev',
    desc: {
      nl: 'Full-stack web framework voor Svelte',
      de: 'Full-Stack-Webframework für Svelte',
      en: 'Full-stack web framework for Svelte',
    },
  },
  {
    name: 'Svelte',
    url: 'https://svelte.dev',
    desc: {
      nl: 'Reactief UI framework voor het web',
      de: 'Reaktives UI-Framework für das Web',
      en: 'Reactive UI framework for the web',
    },
  },
  {
    name: 'Paraglide',
    url: 'https://inlang.com/m/gerre34r/library-inlang-paraglideJs',
    desc: {
      nl: 'Lichtgewicht i18n bibliotheek voor JS',
      de: 'Leichtgewichtige i18n-Bibliothek für JS',
      en: 'Lightweight i18n library for JS',
    },
  },
  {
    name: 'mdsvex',
    url: 'https://mdsvex.com',
    desc: {
      nl: 'Markdown preprocessor voor Svelte',
      de: 'Markdown-Präprozessor für Svelte',
      en: 'Markdown preprocessor for Svelte',
    },
  },
  {
    name: 'Vite',
    url: 'https://vitejs.dev',
    desc: {
      nl: 'Snelle frontend build tool',
      de: 'Schnelles Frontend-Build-Tool',
      en: 'Fast frontend build tool',
    },
  },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    desc: {
      nl: 'Getypeerde superset van JavaScript',
      de: 'Typisierte Obermenge von JavaScript',
      en: 'Typed superset of JavaScript',
    },
  },
];

export const IMAGES: ImageCredit[] = [
  {
    category: 'blog',
    desc: {
      nl: 'Blog standaard thumbnail',
      de: 'Blog Standard-Thumbnail',
      en: 'Blog default thumbnail',
    },
    imagePath: '/images/page_blog/default_thumbnail.webp',
    author: 'MasAnyanka',
    authorUrl: 'https://www.shutterstock.com/g/MasAnyanka',
    source: 'Shutterstock',
    sourceUrl:
      'https://www.shutterstock.com/image-photo/valgus-deformity-flatfoot-orthopedic-problem-disease-1029441235',
  },
  {
    category: 'blog',
    desc: {
      nl: 'Blog standaard opvulling',
      de: 'Blog Standard-Füller',
      en: 'Blog default filler',
    },
    imagePath: '/images/page_blog/default_image_filler.webp',
    author: 'Nino Liverani',
    authorUrl: 'https://unsplash.com/@ninoliverani',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/brown-and-white-skeleton-foot-EayqAlQiFeQ',
  },
  {
    category: 'blog',
    desc: {
      nl: 'Sandalen afbeelding',
      de: 'Sandalen Bild',
      en: 'Sandals image',
    },
    imagePath:
      '/images/page_blog/voorvoet_praktijk_voor_podotherapie_Sandalen_Durea_modern_uitneembaar_voetbed_steunzolen_op_maat_gezonde_blote_voeten_bij_zwembad.webp',
    author: 'Joe Pizzio',
    authorUrl: 'https://unsplash.com/@pzopro',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/two-person-on-swimming-pool-AiW1GtwGGS0',
  },
  {
    category: 'blog',
    desc: {
      nl: 'Blog post 001: Thumbnail',
      de: 'Blog-Post 001: Thumbnail',
      en: 'Blog post 001: Thumbnail',
    },
    imagePath: '/images/page_blog/001_podotherapeut_of_podoloog/thumbnail.webp',
    author: 'Robbert Brink',
    authorUrl: 'https://www.robbertbrink.nl',
    source: 'Robbert Brink Fotografie',
    sourceUrl: 'https://www.robbertbrink.nl',
  },
  {
    category: 'blog',
    desc: {
      nl: 'Blog post 001: Hero',
      de: 'Blog-Post 001: Hero',
      en: 'Blog post 001: Hero',
    },
    imagePath:
      '/images/page_blog/001_podotherapeut_of_podoloog/Podotherapeut_podoloog_VoorVoet_Enschede_voetklachten_podotherapeut_legt_uit.webp',
    author: 'Robbert Brink',
    authorUrl: 'https://www.robbertbrink.nl',
    source: 'Robbert Brink Fotografie',
    sourceUrl: 'https://www.robbertbrink.nl',
  },
  {
    category: 'blog',
    desc: {
      nl: 'Blog post 002: Thumbnail',
      de: 'Blog-Post 002: Thumbnail',
      en: 'Blog post 002: Thumbnail',
    },
    imagePath:
      '/images/page_blog/002_alles_over_steunzolen_of_podotherapeutische_zolen/thumbnail.webp',
    author: 'Robbert Brink',
    authorUrl: 'https://www.robbertbrink.nl',
    source: 'Robbert Brink Fotografie',
    sourceUrl: 'https://www.robbertbrink.nl',
  },
  {
    category: 'blog',
    desc: {
      nl: 'Blog post 002: Hero',
      de: 'Blog-Post 002: Hero',
      en: 'Blog post 002: Hero',
    },
    imagePath:
      '/images/page_blog/002_alles_over_steunzolen_of_podotherapeutische_zolen/VoorVoet_steunzolen_op_maat_gemaakt_podotherapeut_Enschede.webp',
    author: 'Robbert Brink',
    authorUrl: 'https://www.robbertbrink.nl',
    source: 'Robbert Brink Fotografie',
    sourceUrl: 'https://www.robbertbrink.nl',
  },
  {
    category: 'blog',
    desc: {
      nl: 'Blog post 003: Thumbnail',
      de: 'Blog-Post 003: Thumbnail',
      en: 'Blog post 003: Thumbnail',
    },
    imagePath:
      '/images/page_blog/003_zonder_voetklachten_het_nieuwe_jaar_in/thumbnail.webp',
    author: 'Kim Bakhuis',
    authorUrl: 'https://voorvoet.nl',
    source: 'VoorVoet',
    sourceUrl: 'https://voorvoet.nl',
  },
  {
    category: 'blog',
    desc: {
      nl: 'Blog post 003: Hero 1',
      de: 'Blog-Post 003: Hero 1',
      en: 'Blog post 003: Hero 1',
    },
    imagePath:
      '/images/page_blog/003_zonder_voetklachten_het_nieuwe_jaar_in/Podotherapeut_Enschede_wat_je_ambities_ook_zijn_oostenrijk.webp',
    author: 'Dennis Bakhuis',
    authorUrl: 'https://linkedin.com/in/dennisbakhuis',
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/in/dennisbakhuis',
  },
  {
    category: 'blog',
    desc: {
      nl: 'Blog post 003: Hero 2',
      de: 'Blog-Post 003: Hero 2',
      en: 'Blog post 003: Hero 2',
    },
    imagePath:
      '/images/page_blog/003_zonder_voetklachten_het_nieuwe_jaar_in/Podotherapie_Enschede_Wandelen_blessure_oostenrijk.webp',
    author: 'Kim Bakhuis',
    authorUrl: 'https://voorvoet.nl',
    source: 'VoorVoet',
    sourceUrl: 'https://voorvoet.nl',
  },
  {
    category: 'page_contact',
    desc: {
      nl: 'Contact hero banner',
      de: 'Kontakt Hero-Banner',
      en: 'Contact hero banner',
    },
    imagePath: '/images/page_contact/voetklachten_enschede_zere_voeten_voorvoet_contact.webp',
    author: 'Annie Spratt',
    authorUrl: 'https://unsplash.com/@anniespratt',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/brown-rotary-dial-telephone-in-gray-painted-room-goholCAVTRs',
  },
  {
    category: 'page_credits',
    desc: {
      nl: 'Credits hero banner',
      de: 'Credits Hero-Banner',
      en: 'Credits hero banner',
    },
    imagePath: '/images/page_credits/credits_hero_banner.webp',
    author: 'Dennis Bakhuis',
    authorUrl: 'https://linkedin.com/in/dennisbakhuis',
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/in/dennisbakhuis',
  },
  {
    category: 'page_credits',
    desc: {
      nl: 'Dennis Bakhuis portret',
      de: 'Dennis Bakhuis Porträt',
      en: 'Dennis Bakhuis portrait',
    },
    imagePath:
      '/images/page_credits/dennis_bakhuis_data_scientist_voorvoet_website_developer.webp',
    author: 'Dennis Bakhuis',
    authorUrl: 'https://linkedin.com/in/dennisbakhuis',
    source: 'LinkedIn',
    sourceUrl: 'https://linkedin.com/in/dennisbakhuis',
  },
  {
    category: 'page_home',
    desc: {
      nl: 'Hero: Kim Bakhuis op strand',
      de: 'Hero: Kim Bakhuis am Strand',
      en: 'Hero: Kim Bakhuis on beach',
    },
    imagePath:
      '/images/page_home/podotherapeut_enschede_kim_bakhuis_loopt_op_strand_voorvoet_praktijk_voor_podotherapie.webp',
    author: 'Dennis Bakhuis',
    authorUrl: 'https://unsplash.com/@dennisbakhuis',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com',
  },
  {
    category: 'page_home',
    desc: {
      nl: 'Wie is VoorVoet: Kim Bakhuis portret',
      de: 'Wer ist VoorVoet: Kim Bakhuis Porträt',
      en: 'Who is VoorVoet: Kim Bakhuis portrait',
    },
    imagePath:
      '/images/page_home/podotherapeut_enschede_kim_bakhuis_van_voorvoet_praktijk_voor_podotherapie.webp',
    author: 'Robbert Brink',
    authorUrl: 'https://www.robbertbrink.nl',
    source: 'Robbert Brink Fotografie',
    sourceUrl: 'https://www.robbertbrink.nl',
  },
  {
    category: 'page_home',
    desc: {
      nl: 'Outdoor schoenen',
      de: 'Outdoor-Schuhe',
      en: 'Outdoor shoes',
    },
    imagePath:
      '/images/page_home/podoloog_enschede_outdoor_schoenen_voorvoet_praktijk_voor_podotherapie.webp',
    author: 'Unknown artist',
    authorUrl: 'https://unsplash.com',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com',
  },
  {
    category: 'page_home',
    desc: {
      nl: 'Voeten in bed',
      de: 'Füße im Bett',
      en: 'Feet in bed',
    },
    imagePath:
      '/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.webp',
    author: 'Simon Berger',
    authorUrl: 'https://unsplash.com/@simon_berger',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/three-people-underneath-yellow-bed-blanket-HSy0QXIRafg',
  },
  {
    category: 'page_information',
    desc: {
      nl: 'Voet anatomie',
      de: 'Fuß Anatomie',
      en: 'Foot anatomy',
    },
    imagePath:
      '/images/page_information/anatomie-voet-hielpijn_voorvoet_podotherapie_enschede.webp',
    author: 'Unknown artist',
    authorUrl: 'https://unsplash.com',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com',
  },
  {
    category: 'page_information',
    desc: {
      nl: 'Bedrijfs podotherapie',
      de: 'Betriebliche Podotherapie',
      en: 'Business podotherapy',
    },
    imagePath:
      '/images/page_information/bedrijfs_podotherapie_pijnlijke_voeten_hielpijn_voorvoet_podotherapie_enschede.webp',
    author: 'Johan Mouchet',
    authorUrl: 'https://unsplash.com/@johanmouchet',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/man-wearing-blue-dress-shirt-in-front-of-industrial-machine-1qFmB3sZPSo',
  },
  {
    category: 'page_information',
    desc: {
      nl: 'Nagelbeugel behandeling',
      de: 'Nagelspangen-Behandlung',
      en: 'Nail bracket treatment',
    },
    imagePath:
      '/images/page_information/nagelbeugel_nagelproblemen_voorvoet_podotherapie_enschede.webp',
    author: 'Robbert Brink',
    authorUrl: 'https://www.robbertbrink.nl',
    source: 'Robbert Brink Fotografie',
    sourceUrl: 'https://www.robbertbrink.nl',
  },
  {
    category: 'page_information',
    desc: {
      nl: 'Behandelaar met patiënt',
      de: 'Behandler mit Patient',
      en: 'Practitioner with patient',
    },
    imagePath:
      '/images/page_information/podotherapeut_enschede_kim_bakhuis_legt_het_met_een_lach_uit-VoorVoet_podotherapie_enschede.webp',
    author: 'Robbert Brink',
    authorUrl: 'https://www.robbertbrink.nl',
    source: 'Robbert Brink Fotografie',
    sourceUrl: 'https://www.robbertbrink.nl',
  },
  {
    category: 'page_information',
    desc: {
      nl: 'Wandeling in het bos',
      de: 'Waldspaziergang',
      en: 'Forest walk',
    },
    imagePath:
      '/images/page_information/podotherapie_enschede_wandeling_in_het_bos_zonder_hielpijn_voorvoet_podotherapie_enschede.webp',
    author: 'James Wheeler',
    authorUrl: 'https://unsplash.com/@souvenirpixels',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/woman-walking-in-forest-with-child-RRZM3cwS1DU',
  },
  {
    category: 'page_information',
    desc: {
      nl: 'Voet skelet',
      de: 'Fuß Skelett',
      en: 'Foot skeleton',
    },
    imagePath:
      '/images/page_information/skelet_botjes_voet_voorvoet_praktijk_voor_podotherapie_enschede.webp',
    author: 'Unknown artist',
    authorUrl: 'https://unsplash.com',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com',
  },
  {
    category: 'page_information',
    desc: {
      nl: 'Sport voetklachten',
      de: 'Sport Fußbeschwerden',
      en: 'Sports foot complaints',
    },
    imagePath:
      '/images/page_information/voetklachten_hielpijn_sport_voorvoet_podotherapie_enschede.webp',
    author: 'Erwans',
    authorUrl: 'https://unsplash.com',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com',
  },
  {
    category: 'page_information',
    desc: {
      nl: 'Wandelen zonder pijn',
      de: 'Schmerzfrei gehen',
      en: 'Walking without pain',
    },
    imagePath:
      '/images/page_information/wandelen_zonder_pijn_in_de_voeten_voorvoet_podotherapie_enschede.webp',
    author: 'Nicolas Cool',
    authorUrl: 'https://unsplash.com/@shotz',
    source: 'Unsplash',
    sourceUrl:
      'https://unsplash.com/photos/person-wearing-black-leather-backpack-walking-beside-green-leaf-tree-_Ojb8Te7tyI',
  },
  {
    category: 'page_not_found',
    desc: {
      nl: '404 pagina achtergrond',
      de: '404-Seite Hintergrund',
      en: '404 page background',
    },
    imagePath: '/images/page_not_found/404_not_found_voorvoet.webp',
    author: 'Daniel Jensen',
    authorUrl: 'https://unsplash.com/@dallehj',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/persons-hand-over-brown-floral-field-during-daytime-UDleHDOhBZ8',
  },
  {
    category: 'page_order_insoles',
    desc: {
      nl: 'Zolen bestellen hero',
      de: 'Einlagen bestellen Hero',
      en: 'Order insoles hero',
    },
    imagePath: '/images/page_order_insoles/hiking_shoes.webp',
    author: 'Emma Van Sant',
    authorUrl: 'https://unsplash.com/@emma',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/three-person-showing-sneaners-n8V1Zht4U54',
  },
  {
    category: 'page_reimbursements',
    desc: {
      nl: 'Vergoedingen hero',
      de: 'Erstattungen Hero',
      en: 'Reimbursements hero',
    },
    imagePath: '/images/page_reimbursements/Hielpijn_hielspoor_plantaire_fasciits_tarieven.webp',
    author: 'Jenny Hill',
    authorUrl: 'https://unsplash.com/@jennyhill',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/man-running-on-road-near-grass-field-mQVWb7kUoOE',
  },
  {
    category: 'shared',
    desc: {
      nl: 'VoorVoet Logo',
      de: 'VoorVoet Logo',
      en: 'VoorVoet Logo',
    },
    imagePath:
      '/images/shared/podotherapeut_enschede_voorvoet_praktijk_voor_podotherapie_logo.svg',
    author: 'Kim Bakhuis',
    authorUrl: 'https://voorvoet.nl',
    source: 'VoorVoet',
    sourceUrl: 'https://voorvoet.nl',
  },
  {
    category: 'shared',
    desc: {
      nl: 'NVVP Lidmaatschap Badge',
      de: 'NVVP Mitgliedschaftsabzeichen',
      en: 'NVVP Membership Badge',
    },
    imagePath:
      '/images/shared/podotherapeut_enschede_nederlandse_vereniging_van_podotherapeuten_voorvoet.webp',
    author: 'Kim Bakhuis',
    authorUrl: 'https://voorvoet.nl',
    source: 'VoorVoet',
    sourceUrl: 'https://voorvoet.nl',
  },
  {
    category: 'shared',
    desc: {
      nl: 'Register Paramedici Certificering',
      de: 'Register Paramedici Zertifizierung',
      en: 'Register Paramedici Certification',
    },
    imagePath:
      '/images/shared/podotherapeut_enschede_kwaliteit_register_paramedici_kim_bakhuis_geregistreerd.webp',
    author: 'Kim Bakhuis',
    authorUrl: 'https://voorvoet.nl',
    source: 'VoorVoet',
    sourceUrl: 'https://voorvoet.nl',
  },
  {
    category: 'shared',
    desc: {
      nl: 'NVVP Kwaliteitskeurmerk',
      de: 'NVVP Qualitätszeichen',
      en: 'NVVP Quality Mark',
    },
    imagePath:
      '/images/shared/podotherapie_enschede_kwaliteit_keurmerk_nvvp_vooervoet.webp',
    author: 'Kim Bakhuis',
    authorUrl: 'https://voorvoet.nl',
    source: 'VoorVoet',
    sourceUrl: 'https://voorvoet.nl',
  },
];

export function getPackages(): PythonPackage[] {
  return PYTHON_PACKAGES;
}

export function getImageCredits(): ImageCredit[] {
  return IMAGES;
}

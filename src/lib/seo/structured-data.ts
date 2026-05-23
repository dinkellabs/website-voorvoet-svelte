import type { Lang } from '$lib/i18n/route-map.js';

export type BlogPostMeta = {
  title: string;
  summary: string;
  author: string;
  date: string;
  image?: string;
};

export type BreadcrumbItem = {
  name: string;
  url: string;
};

const PHONE = '+31657750997';

const SAME_AS = [
  'https://www.podotherapie.nl/',
  'https://www.kwaliteitsregisterparamedici.nl/kwaliteitsregister/paramedici/33997',
];

/**
 * Organization JSON-LD schema for VoorVoet.
 */
export function organizationLD(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VoorVoet',
    url: 'https://voorvoet.nl',
    logo: 'https://voorvoet.nl/images/shared/podotherapeut_enschede_voorvoet_praktijk_voor_podotherapie_logo.svg',
    telephone: PHONE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Eeftinksweg 13',
      addressLocality: 'Enschede',
      postalCode: '7541 WE',
      addressCountry: 'NL',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: PHONE,
      areaServed: 'NL',
      availableLanguage: ['Dutch', 'German', 'English'],
    },
    sameAs: SAME_AS,
  };
}

/**
 * Podiatrist JSON-LD schema (extends Organization with practice details).
 */
export function podiatristLD(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'VoorVoet - Praktijk voor Podotherapie',
    url: 'https://voorvoet.nl',
    logo: 'https://voorvoet.nl/images/shared/podotherapeut_enschede_voorvoet_praktijk_voor_podotherapie_logo.svg',
    image: 'https://voorvoet.nl/images/page_home/page-preview-podotherapie-enschede-16x9.jpg',
    description:
      'VoorVoet is een praktijk voor podotherapie in Enschede. Professionele behandeling van voetklachten, steunzolen op maat en podotherapie.',
    telephone: PHONE,
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: 'Eeftinksweg 13',
        addressLocality: 'Enschede',
        postalCode: '7541 WE',
        addressCountry: 'NL',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: 'Beethovenlaan 10',
        addressLocality: 'Enschede',
        postalCode: '7522 HJ',
        addressCountry: 'NL',
      },
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.2215,
      longitude: 6.8937,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        name: 'Eeftinksweg 13',
        dayOfWeek: ['Monday', 'Thursday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        name: 'Beethovenlaan 10',
        dayOfWeek: 'Tuesday',
        opens: '08:30',
        closes: '19:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        name: 'Beethovenlaan 10',
        dayOfWeek: 'Wednesday',
        opens: '08:30',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        name: 'Beethovenlaan 10',
        dayOfWeek: 'Friday',
        opens: '08:00',
        closes: '13:00',
      },
    ],
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    medicalSpecialty: 'Podiatry',
    sameAs: SAME_AS,
  };
}

/**
 * BlogPosting JSON-LD schema for a blog post.
 *
 * @param post - Blog post metadata
 * @param lang - Language of the post
 * @param url - Canonical URL of the post
 */
export function blogPostingLD(
  post: BlogPostMeta,
  lang: Lang,
  url: string,
): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.date,
    inLanguage: lang,
    url,
    publisher: organizationLD(),
  };
  if (post.image) ld.image = post.image;
  return ld;
}

/**
 * BreadcrumbList JSON-LD schema.
 *
 * @param items - Ordered list of breadcrumb items (name + url)
 */
export function breadcrumbListLD(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

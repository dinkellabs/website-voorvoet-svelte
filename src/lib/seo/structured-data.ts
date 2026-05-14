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
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Eeftinksweg 13',
      addressLocality: 'Enschede',
      postalCode: '7534 PK',
      addressCountry: 'NL',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'NL',
      availableLanguage: ['Dutch', 'German', 'English'],
    },
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
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: 'Eeftinksweg 13',
        addressLocality: 'Enschede',
        postalCode: '7534 PK',
        addressCountry: 'NL',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: 'Beethovenlaan 10',
        addressLocality: 'Enschede',
        postalCode: '7535 CP',
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
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    medicalSpecialty: 'Podiatry',
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

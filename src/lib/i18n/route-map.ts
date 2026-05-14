/**
 * Typed route table mirroring OLD/voorvoet_website/translations.py:ROUTE_MAPPINGS.
 *
 * Routes include the language prefix (e.g. `/nl/vergoedingen`).
 * `routeFor` returns the full prefixed path.
 * `pageKeyForPath` parses a full path like `/de/erstattungen` back to
 * `{ page: 'reimbursements', lang: 'de' }`.
 */

export type Lang = "nl" | "de" | "en";

export type PageKey =
  | "home"
  | "information"
  | "reimbursements"
  | "contact"
  | "order_insoles"
  | "blog"
  | "credits"
  | "privacy_policy"
  | "terms_conditions";

/**
 * ROUTE_MAP mirrors ROUTE_MAPPINGS from translations.py verbatim.
 * Keys are PageKey, values are per-language full paths (with leading slash
 * and language prefix).
 */
export const ROUTE_MAP: Record<PageKey, Record<Lang, string>> = {
  home: {
    nl: "/nl",
    de: "/de",
    en: "/en",
  },
  information: {
    nl: "/nl/informatie",
    de: "/de/informationen",
    en: "/en/information",
  },
  reimbursements: {
    nl: "/nl/vergoedingen",
    de: "/de/erstattungen",
    en: "/en/reimbursements",
  },
  contact: {
    nl: "/nl/contact",
    de: "/de/kontakt",
    en: "/en/contact",
  },
  order_insoles: {
    nl: "/nl/zolen-bestellen",
    de: "/de/einlagen-bestellen",
    en: "/en/order-insoles",
  },
  blog: {
    nl: "/nl/blog",
    de: "/de/blog",
    en: "/en/blog",
  },
  credits: {
    nl: "/nl/credits",
    de: "/de/credits",
    en: "/en/credits",
  },
  privacy_policy: {
    nl: "/nl/privacy-beleid",
    de: "/de/datenschutzrichtlinie",
    en: "/en/privacy-policy",
  },
  terms_conditions: {
    nl: "/nl/algemene-voorwaarden",
    de: "/de/allgemeine-geschaeftsbedingungen",
    en: "/en/terms-and-conditions",
  },
};

/**
 * Returns the full route path for the given page and language.
 *
 * @example
 * routeFor('reimbursements', 'de') // '/de/erstattungen'
 * routeFor('home', 'nl')           // '/nl'
 */
export function routeFor(page: PageKey, lang: Lang): string {
  return ROUTE_MAP[page][lang];
}

export const LANGS: readonly Lang[] = ["nl", "de", "en"];

/**
 * Narrows the route params `lang` (typed `string | undefined`) to `Lang`.
 *
 * The `[lang=lang]` param matcher (`src/params/lang.ts`) guarantees the
 * runtime value is one of `nl | de | en` before this function is called;
 * the throw exists to surface a routing misconfiguration rather than to
 * handle untrusted input.
 */
export function langFromParams(params: { lang?: string }): Lang {
  if (params.lang === "nl" || params.lang === "de" || params.lang === "en") {
    return params.lang;
  }
  throw new Error(
    `langFromParams: expected nl|de|en, got ${JSON.stringify(params.lang)} — param matcher misconfiguration`,
  );
}

/**
 * Builds a reverse lookup: path → { page, lang }.
 * Generated once at module load; path strings are unique across all pages.
 */
const _reverseLookup: Map<string, { page: PageKey; lang: Lang }> = new Map();

for (const [page, langs] of Object.entries(ROUTE_MAP) as [PageKey, Record<Lang, string>][]) {
  for (const [lang, path] of Object.entries(langs) as [Lang, string][]) {
    _reverseLookup.set(path, { page, lang });
  }
}

/**
 * Resolves a full path back to its page key and language.
 *
 * Returns `null` when the path does not match any known route.
 *
 * @example
 * pageKeyForPath('/de/erstattungen') // { page: 'reimbursements', lang: 'de' }
 * pageKeyForPath('/nl')              // { page: 'home', lang: 'nl' }
 * pageKeyForPath('/unknown')         // null
 */
export function pageKeyForPath(path: string): { page: PageKey; lang: Lang } | null {
  return _reverseLookup.get(path) ?? null;
}

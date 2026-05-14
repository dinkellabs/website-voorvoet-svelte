import { describe, it, expect } from "vitest";
import {
  ROUTE_MAP,
  routeFor,
  pageKeyForPath,
  type Lang,
  type PageKey,
} from "../route-map";

const ALL_LANGS: Lang[] = ["nl", "de", "en"];
const ALL_PAGES: PageKey[] = [
  "home",
  "information",
  "reimbursements",
  "contact",
  "order_insoles",
  "blog",
  "credits",
  "privacy_policy",
  "terms_conditions",
];

describe("ROUTE_MAP completeness", () => {
  it("every PageKey has an entry for every Lang", () => {
    for (const page of ALL_PAGES) {
      for (const lang of ALL_LANGS) {
        expect(
          ROUTE_MAP[page][lang],
          `ROUTE_MAP["${page}"]["${lang}"] should be defined`,
        ).toBeTruthy();
      }
    }
  });

  it("all routes start with a leading slash", () => {
    for (const page of ALL_PAGES) {
      for (const lang of ALL_LANGS) {
        expect(ROUTE_MAP[page][lang]).toMatch(/^\//);
      }
    }
  });

  it("all routes begin with their language prefix", () => {
    for (const page of ALL_PAGES) {
      for (const lang of ALL_LANGS) {
        expect(ROUTE_MAP[page][lang]).toMatch(new RegExp(`^/${lang}`));
      }
    }
  });
});

describe("routeFor", () => {
  it("returns /nl for home in nl", () => {
    expect(routeFor("home", "nl")).toBe("/nl");
  });

  it("returns /de for home in de", () => {
    expect(routeFor("home", "de")).toBe("/de");
  });

  it("returns /en for home in en", () => {
    expect(routeFor("home", "en")).toBe("/en");
  });

  it("returns /de/kontakt for contact in de", () => {
    expect(routeFor("contact", "de")).toBe("/de/kontakt");
  });

  it("returns /nl/vergoedingen for reimbursements in nl", () => {
    expect(routeFor("reimbursements", "nl")).toBe("/nl/vergoedingen");
  });

  it("returns /de/erstattungen for reimbursements in de", () => {
    expect(routeFor("reimbursements", "de")).toBe("/de/erstattungen");
  });

  it("returns /en/reimbursements for reimbursements in en", () => {
    expect(routeFor("reimbursements", "en")).toBe("/en/reimbursements");
  });

  it("returns /nl/zolen-bestellen for order_insoles in nl", () => {
    expect(routeFor("order_insoles", "nl")).toBe("/nl/zolen-bestellen");
  });

  it("returns /de/einlagen-bestellen for order_insoles in de", () => {
    expect(routeFor("order_insoles", "de")).toBe("/de/einlagen-bestellen");
  });

  it("returns /en/order-insoles for order_insoles in en", () => {
    expect(routeFor("order_insoles", "en")).toBe("/en/order-insoles");
  });

  it("returns /nl/informatie for information in nl", () => {
    expect(routeFor("information", "nl")).toBe("/nl/informatie");
  });

  it("returns /de/informationen for information in de", () => {
    expect(routeFor("information", "de")).toBe("/de/informationen");
  });

  it("returns /en/information for information in en", () => {
    expect(routeFor("information", "en")).toBe("/en/information");
  });
});

describe("pageKeyForPath", () => {
  it("returns null for unknown paths", () => {
    expect(pageKeyForPath("/unknown")).toBeNull();
    expect(pageKeyForPath("/nl/unknown-slug")).toBeNull();
    expect(pageKeyForPath("")).toBeNull();
  });

  it("round-trips every (page, lang) combination", () => {
    for (const page of ALL_PAGES) {
      for (const lang of ALL_LANGS) {
        const path = routeFor(page, lang);
        const result = pageKeyForPath(path);
        expect(result, `round-trip failed for routeFor("${page}", "${lang}") = "${path}"`).toEqual(
          { page, lang },
        );
      }
    }
  });

  it("resolves /de/erstattungen to reimbursements/de", () => {
    expect(pageKeyForPath("/de/erstattungen")).toEqual({
      page: "reimbursements",
      lang: "de",
    });
  });

  it("resolves /nl to home/nl", () => {
    expect(pageKeyForPath("/nl")).toEqual({ page: "home", lang: "nl" });
  });

  it("resolves /en/order-insoles to order_insoles/en", () => {
    expect(pageKeyForPath("/en/order-insoles")).toEqual({
      page: "order_insoles",
      lang: "en",
    });
  });
});

/**
 * Page metadata tables mirroring OLD/voorvoet_website/translations.py.
 *
 * - PAGE_TITLES, PAGE_DESCRIPTIONS: Record<lang, Record<PageKey, string>>
 *   (shape matches the Python dicts which are keyed lang-first, then page).
 * - PAGE_IMAGES: Record<PageKey, string> — NOT per-language (matches OLD shape).
 */

import type { Lang, PageKey } from "./route-map";

export const PAGE_TITLES: Record<Lang, Record<PageKey, string>> = {
  nl: {
    home: "Podotherapeut Enschede - Voetklachten Behandelen | VoorVoet",
    blog: "Podotherapie Blog - Voetklachten & Tips | VoorVoet Enschede",
    information: "Podotherapie Behandelingen & Voetklachten | VoorVoet",
    reimbursements: "Vergoedingen Podotherapie Zorgverzekeraars | VoorVoet",
    contact: "Contact Podotherapeut Enschede - Afspraak | VoorVoet",
    order_insoles: "Steunzolen op Maat Bestellen | VoorVoet Enschede",
    credits: "Credits | VoorVoet Podotherapie Enschede",
    privacy_policy: "Privacybeleid | VoorVoet Podotherapie Enschede",
    terms_conditions: "Algemene Voorwaarden | VoorVoet Podotherapie",
  },
  de: {
    home: "Podologe Enschede - Fußbeschwerden & Einlagen | VoorVoet",
    blog: "Podologie Blog - Fußpflege & Tipps | VoorVoet Enschede",
    information: "Podologie Behandlungen & Fußbeschwerden | VoorVoet",
    reimbursements: "Erstattungen Podologie Krankenkassen | VoorVoet",
    contact: "Kontakt Podologe Enschede - Termin | VoorVoet",
    order_insoles: "Maßgefertigte Einlagen Bestellen | VoorVoet Enschede",
    credits: "Credits | VoorVoet Podologie Enschede",
    privacy_policy: "Datenschutzrichtlinie | VoorVoet Podologie Enschede",
    terms_conditions: "Allgemeine Geschäftsbedingungen | VoorVoet Podologie",
  },
  en: {
    home: "Podiatrist Enschede - Foot Complaints & Insoles | VoorVoet",
    blog: "Podiatry Blog - Foot Health & Tips | VoorVoet Enschede",
    information: "Podiatry Treatments & Foot Complaints | VoorVoet",
    reimbursements: "Podiatry Reimbursements Health Insurance | VoorVoet",
    contact: "Contact Podiatrist Enschede - Appointment | VoorVoet",
    order_insoles: "Order Custom Insoles | VoorVoet Enschede",
    credits: "Credits | VoorVoet Podiatry Enschede",
    privacy_policy: "Privacy Policy | VoorVoet Podiatry Enschede",
    terms_conditions: "Terms and Conditions | VoorVoet Podiatry",
  },
};

export const PAGE_DESCRIPTIONS: Record<Lang, Record<PageKey, string>> = {
  nl: {
    home: "VoorVoet is uw podotherapeut in Enschede. Professionele behandeling van voetklachten, steunzolen op maat en podotherapie. Maak vandaag uw afspraak.",
    blog: "Lees onze blog over podotherapie, voetklachten, steunzolen en tips voor gezonde voeten. Expert advies van VoorVoet podotherapeut in Enschede.",
    information: "Informatie over podotherapie, behandelmethoden en veelvoorkomende voetklachten. Ontdek hoe VoorVoet u kan helpen met professionele podotherapie in Enschede.",
    reimbursements: "Informatie over vergoedingen voor podotherapie en steunzolen. Bekijk de tarieven en zorgverzekering vergoedingen voor podotherapie bij VoorVoet Enschede.",
    contact: "Neem contact op met VoorVoet podotherapie in Enschede. Maak een afspraak of stel uw vraag. Wij helpen u graag met uw voetklachten.",
    order_insoles: "Bestel steunzolen op maat bij VoorVoet podotherapie Enschede. Professionele podotherapeutische zolen voor optimale ondersteuning en comfort.",
    credits: "Credits voor afbeeldingen, Python packages en informatie over de website ontwikkelaar van VoorVoet podotherapie Enschede.",
    privacy_policy: "Privacybeleid van VoorVoet podotherapie Enschede. Hoe wij omgaan met persoonlijke gegevens en patiëntinformatie.",
    terms_conditions: "Algemene voorwaarden van VoorVoet podotherapie Enschede.",
  },
  de: {
    home: "VoorVoet ist Ihr Podologe in Enschede. Professionelle Behandlung von Fußbeschwerden, maßgefertigte Einlagen und Podologie. Vereinbaren Sie einen Termin.",
    blog: "Lesen Sie unseren Blog über Podologie, Fußbeschwerden, Einlagen und Tipps für gesunde Füße. Expertenrat von VoorVoet Podologe in Enschede.",
    information: "Informationen über Podologie, Behandlungsmethoden und häufige Fußbeschwerden. Erfahren Sie, wie VoorVoet Ihnen mit professioneller Podologie in Enschede helfen kann.",
    reimbursements: "Informationen über Erstattungen für Podologie und Einlagen. Sehen Sie die Tarife und Krankenkassenerstattungen für Podologie bei VoorVoet Enschede.",
    contact: "Kontaktieren Sie VoorVoet Podologie in Enschede. Vereinbaren Sie einen Termin oder stellen Sie Ihre Frage. Wir helfen Ihnen gerne bei Ihren Fußbeschwerden.",
    order_insoles: "Bestellen Sie maßgefertigte Einlagen bei VoorVoet Podologie Enschede. Professionelle podologische Einlagen für optimale Unterstützung und Komfort.",
    credits: "Credits für Bilder, Python-Pakete und Informationen über den Website-Entwickler von VoorVoet Podologie Enschede.",
    privacy_policy: "Datenschutzrichtlinie von VoorVoet Podologie Enschede. Wie wir mit personenbezogenen Daten und Patientendaten umgehen.",
    terms_conditions: "Allgemeine Geschäftsbedingungen von VoorVoet Podologie Enschede.",
  },
  en: {
    home: "VoorVoet is your podiatrist in Enschede. Professional treatment of foot complaints, custom insoles and podiatry. Make an appointment for personalized care.",
    blog: "Read our blog about podiatry, foot complaints, insoles and tips for healthy feet. Expert advice from VoorVoet podiatrist in Enschede.",
    information: "Information about podiatry, treatment methods and common foot complaints. Discover how VoorVoet can help you with professional podiatry in Enschede.",
    reimbursements: "Information about reimbursements for podiatry and insoles. View rates and health insurance reimbursements for podiatry at VoorVoet Enschede.",
    contact: "Contact VoorVoet podiatry in Enschede. Make an appointment or ask your question. We are happy to help you with your foot complaints.",
    order_insoles: "Order custom insoles at VoorVoet podiatry Enschede. Professional podiatric insoles for optimal support and comfort.",
    credits: "Credits for images, Python packages and information about the website developer of VoorVoet podiatry Enschede.",
    privacy_policy: "Privacy policy of VoorVoet podiatry Enschede. How we handle personal data and patient information.",
    terms_conditions: "Terms and conditions of VoorVoet podiatry Enschede.",
  },
};

/**
 * PAGE_IMAGES is NOT per-language in the OLD codebase — one image path per page.
 */
export const PAGE_IMAGES: Record<PageKey, string> = {
  home: "/images/page_home/page-preview-podotherapie-enschede-16x9.jpg",
  blog: "/images/page_blog/page-preview-blog-16x9.jpg",
  information: "/images/page_information/page-preview-informatie-16x9.jpg",
  reimbursements: "/images/page_reimbursements/page-preview-vergoedingen-16x9.jpg",
  contact: "/images/page_contact/page-preview-contact-16x9.jpg",
  order_insoles: "/images/page_order_insoles/page-preview-steunzolen-16x9.jpg",
  credits: "/images/page_credits/page-preview-credits-16x9.jpg",
  privacy_policy: "/images/page_home/page-preview-podotherapie-enschede-16x9.jpg",
  terms_conditions: "/images/page_home/page-preview-podotherapie-enschede-16x9.jpg",
};


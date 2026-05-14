<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import { routeFor } from '$lib/i18n/route-map.js';
  import * as m from '$lib/paraglide/messages.js';
  import Container from './Container.svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';
  import Phone from './icons/Phone.svelte';
  import Envelope from './icons/Envelope.svelte';

  interface Props {
    lang: Lang;
  }

  let { lang }: Props = $props();

  const creditsHref = $derived(routeFor('credits', lang));
  const privacyHref = $derived(routeFor('privacy_policy', lang));
  const termsHref = $derived(routeFor('terms_conditions', lang));
</script>

<footer class="site-footer" id="footer">
  <!-- Wave divider matching OLD clip_top="gentle_2" -->
  <div class="footer-divider" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M0,0V85C400,135,600,15,1200,15V0Z" fill="var(--color-bg-white)" />
    </svg>
  </div>
  <div class="footer-body">
    <Container>
      <div class="footer-grid">
        <div class="footer-logo">
          <img
            src="/images/shared/podotherapeut_enschede_voorvoet_praktijk_voor_podotherapie_logo.svg"
            alt={m.nav_logo_alt()}
            width="300"
            height="60"
            loading="lazy"
          />
        </div>

        <!-- footer-content wraps locations + info; becomes flex row at 768px (md) -->
        <div class="footer-content">
          <div class="footer-locations">
            <div class="location">
              <p class="location-title">{m.footer_location_eeftinksweg()}</p>
              <p>Eeftinksweg 13</p>
              <p>7541 WE Enschede</p>
              <div class="hours">
                <span class="day">{m.footer_monday()}</span><span>8.00 - 17.00</span>
              </div>
              <div class="hours">
                <span class="day">{m.footer_thursday()}</span><span>8.00 - 17.00</span>
              </div>
            </div>

            <div class="location">
              <p class="location-title">{m.footer_location_beethovenlaan()}</p>
              <p>Beethovenlaan 10</p>
              <p>7522 HJ Enschede</p>
              <div class="hours">
                <span class="day">{m.footer_tuesday()}</span><span>8.30 - 19.30</span>
              </div>
              <div class="hours">
                <span class="day">{m.footer_wednesday()}</span><span>8.30 - 17.00</span>
              </div>
              <div class="hours">
                <span class="day">{m.footer_friday()}</span><span>8.00 - 13.00</span>
              </div>
            </div>
          </div>

          <div class="footer-info">
            <div class="contact-links">
              <a href="tel:+31657750997" class="contact-link">
                <Phone size={20} />
                +31 (0) 6 577 509 97
              </a>
              <a href="mailto:info@voorvoet.nl" class="contact-link">
                <Envelope size={20} />
                info@voorvoet.nl
              </a>
            </div>

            <div class="business-info">
              <div><span class="label">{m.footer_kvk_number()}</span> 87984814</div>
              <div><span class="label">{m.footer_practice_code()}</span> 26000993</div>
              <div>
                <span class="label">{m.footer_bank_account()}</span>
                <span class="iban">NL18 KNAB 0515 1858 84</span>
              </div>
            </div>

            <div class="footer-links">
              <a href={creditsHref}>{m.footer_credits()}</a>
              <a href={privacyHref}>{m.footer_privacy_policy()}</a>
              <a href={termsHref}>{m.footer_terms_conditions()}</a>
            </div>
          </div>
        </div>
        <!-- end footer-content -->
      </div>
      <!-- end footer-grid -->

      <div class="footer-bottom">
        <a
          href="https://www.podotherapie.nl/"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-badge"
        >
          <ResponsiveImage
            srcFallback="/images/shared/podotherapeut_enschede_nederlandse_vereniging_van_podotherapeuten_voorvoet.png"
            srcAvif="/images/shared/podotherapeut_enschede_nederlandse_vereniging_van_podotherapeuten_voorvoet.avif"
            srcWebp="/images/shared/podotherapeut_enschede_nederlandse_vereniging_van_podotherapeuten_voorvoet.webp"
            alt={m.footer_nvvp_logo_alt()}
            width={224}
            height={100}
          />
        </a>

        <a
          href="https://www.kwaliteitsregisterparamedici.nl/kwaliteitsregister/paramedici/33997"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-badge"
        >
          <ResponsiveImage
            srcFallback="/images/shared/podotherapeut_enschede_kwaliteit_register_paramedici_kim_bakhuis_geregistreerd.png"
            srcAvif="/images/shared/podotherapeut_enschede_kwaliteit_register_paramedici_kim_bakhuis_geregistreerd.avif"
            srcWebp="/images/shared/podotherapeut_enschede_kwaliteit_register_paramedici_kim_bakhuis_geregistreerd.webp"
            alt={m.footer_krp_logo_alt()}
            width={365}
            height={100}
          />
        </a>

        <a
          href="https://linkedin.com/in/dennisbakhuis"
          target="_blank"
          rel="noopener noreferrer"
          class="made-with"
        >
          &copy; {m.footer_made_with_love()}
        </a>
      </div>
    </Container>
  </div>
</footer>

<style>
  .site-footer {
    background-color: var(--color-bg-green-light);
    position: relative;
    /* Reserve room for the absolutely-positioned wave divider that overlaps
       the section above. */
    padding-top: 75px;
  }

  .footer-divider {
    /* Absolute + bleed -1px up: matches Section.svelte's clip-bottom approach.
       The 1px overlap onto the previous section (which is white) hides the
       SVG's anti-aliased top edge, which otherwise lets the green-light footer
       bg show through as a hairline. */
    position: absolute;
    top: -1px;
    left: 0;
    width: 100%;
    height: 76px;
    overflow: hidden;
    line-height: 0;
    pointer-events: none;
  }

  .footer-divider svg {
    display: block;
    width: calc(100% + 3px);
    height: 100%;
    margin-left: -1px;
  }

  .footer-body {
    padding-block: 3rem 0.5rem;
  }

  .footer-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 2rem;
  }

  @media (min-width: 768px) {
    .footer-grid {
      flex-direction: row;
      align-items: flex-start;
      text-align: left;
    }
  }

  @media (min-width: 1024px) {
    .footer-grid {
      gap: 2rem;
    }
  }

  .footer-logo {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }

  @media (min-width: 768px) {
    .footer-logo {
      justify-content: center;
      margin-bottom: 0;
    }
  }

  @media (min-width: 1024px) {
    .footer-logo {
      flex: 0 0 30%;
      justify-content: flex-start;
    }
  }

  .footer-logo img {
    max-width: 300px;
    width: 100%;
    height: auto;
    margin-top: -25px;
  }

  /* footer-content wraps locations + info columns; flex row at md (768px) */
  .footer-content {
    display: block;
    width: 100%;
  }

  @media (min-width: 768px) {
    .footer-content {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      align-items: flex-start;
      text-align: left;
    }
  }

  @media (min-width: 1024px) {
    .footer-content {
      flex: 0 0 70%;
      gap: 2rem;
    }
  }

  /* Locations column always stacks vertically; spacing adjusts at breakpoints */
  .footer-locations {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-inline: 1.25rem;
    flex: 1;
  }

  @media (min-width: 768px) {
    .footer-locations {
      padding-inline: 0.5rem;
      margin-bottom: 0;
    }
  }

  @media (min-width: 1024px) {
    .footer-locations {
      padding-inline: 1.25rem;
    }
  }

  .location-title {
    font-weight: 700;
    text-decoration: underline;
    color: var(--color-text-muted);
    margin-bottom: 0.15rem;
  }

  .location p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-regular);
    line-height: 1.6;
    margin: 0;
  }

  .hours {
    color: var(--color-text-secondary);
    font-size: var(--font-size-regular);
  }

  .day {
    display: inline-block;
    width: 100px;
  }

  .footer-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
  }

  @media (min-width: 768px) {
    .footer-info {
      margin-bottom: 0;
    }
  }

  .contact-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .contact-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-secondary);
    font-size: var(--font-size-body-accent);
    text-decoration: none;
    justify-content: center;
  }

  @media (min-width: 768px) {
    .contact-link {
      justify-content: flex-start;
    }
  }

  .contact-link:hover {
    text-decoration: underline;
    color: var(--color-primary-700);
  }

  .business-info {
    color: var(--color-text-secondary);
    font-size: var(--font-size-regular);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .business-info .label {
    color: var(--color-text-muted);
    font-weight: 600;
    display: inline-block;
    width: 140px;
  }

  .business-info .iban {
    white-space: nowrap;
  }

  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  @media (min-width: 768px) {
    .footer-links {
      align-items: flex-start;
    }
  }

  .footer-links a {
    color: var(--color-primary-700);
    text-decoration: underline;
    font-size: var(--font-size-regular);
  }

  .footer-links a:hover {
    color: var(--color-text-heading);
  }

  .footer-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
  }

  @media (min-width: 768px) {
    .footer-bottom {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .footer-badge :global(img) {
    max-height: 60px;
    width: auto;
    border-radius: 0;
    box-shadow: none;
  }

  .made-with {
    color: var(--color-text-muted);
    font-size: var(--font-size-regular);
    text-decoration: none;
    padding-bottom: 0.5rem;
  }

  .made-with:hover {
    text-decoration: underline;
    color: var(--color-primary-700);
  }
</style>

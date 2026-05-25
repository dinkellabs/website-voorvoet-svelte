<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import { routeFor } from '$lib/i18n/route-map.js';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import Button from '$lib/components/Button.svelte';
  import Title from '$lib/components/Title.svelte';
  import ImageTextSection from '$lib/components/sections/ImageTextSection.svelte';
  import * as m from '$lib/paraglide/messages.js';

  interface Props {
    data: { lang: Lang };
  }

  let { data }: Props = $props();
  const lang = $derived(data.lang);

  const reimbHref = $derived(routeFor('reimbursements', lang));

  /* Colors match OLD risk_level_card.py RISK_COLORS */
  const RISK_COLORS: { start: string; end: string }[] = [
    { start: '#4ade80', end: '#22c55e' },
    { start: '#fbbf24', end: '#f59e0b' },
    { start: '#fb923c', end: '#f97316' },
    { start: '#f87171', end: '#ef4444' },
    { start: '#dc2626', end: '#b91c1c' },
  ];

  const riskLevels = $derived([
    {
      level: 0,
      risk: m.info_risico_level0_risk(),
      title: m.info_risico_level0_title(),
      desc: m.info_risico_level0_desc(),
    },
    {
      level: 1,
      risk: m.info_risico_level1_risk(),
      title: m.info_risico_level1_title(),
      desc: m.info_risico_level1_desc(),
    },
    {
      level: 2,
      risk: m.info_risico_level2_risk(),
      title: m.info_risico_level2_title(),
      desc: m.info_risico_level2_desc(),
    },
    {
      level: 3,
      risk: m.info_risico_level3_risk(),
      title: m.info_risico_level3_title(),
      desc: m.info_risico_level3_desc(),
    },
    {
      level: 4,
      risk: m.info_risico_level4_risk(),
      title: m.info_risico_level4_title(),
      desc: m.info_risico_level4_desc(),
    },
  ]);
</script>

<HeroBanner
  srcFallback="/images/page_information/podotherapie_enschede_wandeling_in_het_bos_zonder_hielpijn_voorvoet_podotherapie_enschede.jpg"
  srcAvif="/images/page_information/podotherapie_enschede_wandeling_in_het_bos_zonder_hielpijn_voorvoet_podotherapie_enschede.avif"
  srcWebp="/images/page_information/podotherapie_enschede_wandeling_in_het_bos_zonder_hielpijn_voorvoet_podotherapie_enschede.webp"
  imgAlt={m.info_hero_img_alt()}
  overlay="subpage"
  isShown={false}
  clipBottom="gentle_3"
/>

<!-- 1. Starter: title + intro — old: padding_top=40px, padding_bottom=0 -->
<Section class="info-starter-section" paddingBottom="0">
  <Container>
    <Title level={1}>{m.info_starter_title()}</Title>
    <p class="info-starter__intro">{m.info_starter_intro()}</p>
  </Container>
</Section>

<!-- 2. Wat is podotherapie? (white, no clip) -->
<Section id="what-is-podiatry" class="info-section-sm" paddingBottom="5rem">
  <Container>
    <ImageTextSection
      srcFallback="/images/page_information/skelet_botjes_voet_voorvoet_praktijk_voor_podotherapie_enschede.jpg"
      srcAvif="/images/page_information/skelet_botjes_voet_voorvoet_praktijk_voor_podotherapie_enschede.avif"
      srcWebp="/images/page_information/skelet_botjes_voet_voorvoet_praktijk_voor_podotherapie_enschede.webp"
      imgAlt={m.info_what_img_alt()}
      width={500}
      height={395}
      title={m.info_what_title()}
      paragraphs={[m.info_what_p1()]}
      imagePosition="right"
      imgMaxWidth="450px"
    />
  </Container>
</Section>

<!-- 3. For everyone (green, clip_top gentle_4, clip_bottom gentle_1) -->
<Section
  id="for-everyone"
  class="info-section-sm"
  bg="green"
  clipTop="gentle_4"
  clipBottom="gentle_1"
  paddingBottom="8rem"
>
  <Container>
    <div class="everyone-content">
      <Title level={2}>{m.info_everyone_title()}</Title>
      <p class="body-text">{m.info_everyone_intro()}</p>

      <Title level={3}>{m.info_children_title()}</Title>
      <p class="body-text">{m.info_children_intro()}</p>
      <p class="body-text">{m.info_children_can_benefit()}</p>
      <ul class="icon-list">
        <li>{m.info_children_item1()}</li>
        <li>{m.info_children_item2()}</li>
        <li>{m.info_children_item3()}</li>
        <li>{m.info_children_item4()}</li>
        <li>{m.info_children_item5()}</li>
      </ul>

      <div class="center-img-wrap">
        <img
          src="/images/page_information/podotherapeut_enschede_kim_bakhuis_legt_het_met_een_lach_uit-VoorVoet_podotherapie_enschede.jpg"
          alt={m.info_everyone_img_alt()}
          class="center-img center-img--wide"
          width="666"
          height="500"
          loading="lazy"
          decoding="async"
        />
      </div>

      <Title level={3}>{m.info_athletes_title()}</Title>
      <p class="body-text">{m.info_athletes_intro()}</p>
      <ul class="icon-list">
        <li>{m.info_athletes_item1()}</li>
        <li>{m.info_athletes_item2()}</li>
        <li>{m.info_athletes_item3()}</li>
        <li>{m.info_athletes_item4()}</li>
      </ul>
      <p class="body-text">{m.info_athletes_conclusion()}</p>

      <Title level={3}>{m.info_elderly_title()}</Title>
      <p class="body-text">{m.info_elderly_intro()}</p>
      <ul class="icon-list">
        <li>{m.info_elderly_item1()}</li>
        <li>{m.info_elderly_item2()}</li>
        <li>{m.info_elderly_item3()}</li>
        <li>{m.info_elderly_item4()}</li>
      </ul>
      <p class="body-text">{m.info_elderly_conclusion()}</p>
    </div>
  </Container>
</Section>

<!-- 4. Behandeltraject (white, no clip) -->
<Section id="het-behandeltraject" class="info-section-sm" paddingBottom="5rem">
  <Container>
    <ImageTextSection
      srcFallback="/images/page_information/wandelen_zonder_pijn_in_de_voeten_voorvoet_podotherapie_enschede.jpg"
      srcAvif="/images/page_information/wandelen_zonder_pijn_in_de_voeten_voorvoet_podotherapie_enschede.avif"
      srcWebp="/images/page_information/wandelen_zonder_pijn_in_de_voeten_voorvoet_podotherapie_enschede.webp"
      imgAlt={m.info_behandel_img_alt()}
      width={500}
      height={365}
      title={m.info_behandel_title()}
      paragraphs={[m.info_behandel_p1()]}
      imagePosition="left"
    />
  </Container>
</Section>

<!-- 5. Veel voorkomende klachten (white, no clip) — text left, image right on desktop -->
<Section id="veel-voorkomende-klachten" class="info-section-sm" paddingBottom="5rem">
  <Container>
    <div class="two-col two-col--img-right">
      <div class="two-col__img">
        <img
          src="/images/page_information/anatomie-voet-hielpijn_voorvoet_podotherapie_enschede.jpg"
          alt={m.info_klachten_img_alt()}
          width="425"
          height="600"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="two-col__text">
        <Title level={2}>{m.info_klachten_title()}</Title>
        <p class="body-text">{m.info_klachten_intro()}</p>
        <ul class="icon-list">
          <li>{m.info_klachten_item1()}</li>
          <li>{m.info_klachten_item2()}</li>
          <li>{m.info_klachten_item3()}</li>
          <li>{m.info_klachten_item4()}</li>
          <li>{m.info_klachten_item5()}</li>
          <li>{m.info_klachten_item6()}</li>
          <li>{m.info_klachten_item7()}</li>
        </ul>
      </div>
    </div>
  </Container>
</Section>

<!-- 6. Bedrijfspodotherapie (green, clip_top gentle_2, clip_bottom gentle_3) — image left, text right -->
<Section
  id="bedrijfspodotherapie"
  class="info-section-sm"
  bg="green"
  clipTop="gentle_2"
  clipBottom="gentle_3"
  paddingBottom="8rem"
>
  <Container>
    <div class="two-col two-col--img-left">
      <div class="two-col__img">
        <img
          src="/images/page_information/bedrijfs_podotherapie_pijnlijke_voeten_hielpijn_voorvoet_podotherapie_enschede.jpg"
          alt={m.info_bedrijf_img_alt()}
          width="500"
          height="750"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="two-col__text">
        <Title level={2}>{m.info_bedrijf_title()}</Title>
        <p class="body-text">{m.info_bedrijf_intro()}</p>
        <p class="body-text">{m.info_bedrijf_includes_intro()}</p>
        <ul class="icon-list">
          <li>{m.info_bedrijf_item1()}</li>
          <li>{m.info_bedrijf_item2()}</li>
          <li>{m.info_bedrijf_item3()}</li>
          <li>{m.info_bedrijf_item4()}</li>
          <li>{m.info_bedrijf_item5()}</li>
        </ul>
        <p class="body-text">{m.info_bedrijf_conclusion()}</p>
        <p class="body-text">{m.info_bedrijf_contact()}</p>
      </div>
    </div>
  </Container>
</Section>

<!-- 7. De risicovoet (white, no clip) -->
<Section id="de-risicovoet" class="info-section-sm" paddingBottom="5rem">
  <Container>
    <ImageTextSection
      srcFallback="/images/page_information/voetklachten_hielpijn_sport_voorvoet_podotherapie_enschede.jpg"
      srcAvif="/images/page_information/voetklachten_hielpijn_sport_voorvoet_podotherapie_enschede.avif"
      srcWebp="/images/page_information/voetklachten_hielpijn_sport_voorvoet_podotherapie_enschede.webp"
      imgAlt={m.info_risico_img_alt()}
      width={500}
      height={750}
      title={m.info_risico_title()}
      paragraphs={[m.info_risico_p1(), m.info_risico_p2(), m.info_risico_p3()]}
      imagePosition="right"
      imgMaxWidth="450px"
    />

    <div class="risico-extra-text">
      <p class="body-text">{m.info_risico_behandel_p1()}</p>
      <p class="body-text">{m.info_risico_behandel_p2()}</p>
      <p class="body-text">{m.info_risico_behandel_p3()}</p>
    </div>

    <div class="center-img-wrap">
      <img
        src="/images/page_information/nagelbeugel_nagelproblemen_voorvoet_podotherapie_enschede.jpg"
        alt="Kim Bakhuis legt podotherapie uit"
        class="center-img center-img--square"
        width="1024"
        height="1024"
        loading="lazy"
        decoding="async"
      />
    </div>

    <Title level={2} class="risico-class-title">{m.info_risico_class_title()}</Title>
    <p class="body-text risico-class-intro">{m.info_risico_class_intro()}</p>

    <div class="risk-levels">
      {#each riskLevels as rl (rl.level)}
        {@const cStart = RISK_COLORS[rl.level]?.start ?? '#4ade80'}
        {@const cEnd = RISK_COLORS[rl.level]?.end ?? '#22c55e'}
        <div class="risk-level-card">
          <div class="risk-level-card__badge-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              class="risk-level-card__svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="grad{rl.level}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:{cStart};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:{cEnd};stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="200" height="200" fill="url(#grad{rl.level})" rx="8" />
              <text
                x="100"
                y="110"
                font-family="Arial, sans-serif"
                font-size="60"
                font-weight="bold"
                fill="white"
                text-anchor="middle">{rl.level}</text
              >
              <text
                x="100"
                y="140"
                font-family="Arial, sans-serif"
                font-size="18"
                fill="white"
                text-anchor="middle">{rl.risk}</text
              >
            </svg>
          </div>
          <div class="risk-level-card__body">
            <strong class="risk-level-card__title">{rl.title}</strong>
            <p class="body-text risk-level-card__desc">{rl.desc}</p>
          </div>
        </div>
      {/each}
    </div>

    <Title level={3} class="reimb-aids-title">{m.info_risico_reimb_title()}</Title>
    <p class="body-text reimb-aids-text">
      {m.info_risico_reimb_text()}
      <Button variant="link" href={reimbHref}>{m.info_risico_reimb_link()}</Button>.
    </p>
    <p class="reimb-aids-footnote">{m.info_risico_reimb_footnote()}</p>
  </Container>
</Section>

<style>
  /* ── Shared typography helpers ──────────────────────────────── */
  .body-text {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
  }

  /* Starter section: old has padding_top=40px, padding_bottom=0. Use :global
     to override the Section component's padding-block-start. */
  :global(.info-starter-section) {
    padding-block-start: 2.5rem !important;
  }

  /* All info sections: match OLD Spacing.section_vertical = 5rem.
     NEW defaults to 6rem at desktop. Override top padding to 5rem. */
  :global(.info-section-sm) {
    padding-block-start: 5rem !important;
  }

  /* Clip sections need extra 3rem on the clipped side */
  :global(.info-section-sm.section--clip-top) {
    padding-block-start: 8rem !important;
  }

  :global(.info-section-sm.section--clip-both) {
    padding-block-start: 8rem !important;
  }

  .info-starter__intro {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    white-space: pre-line;
  }

  /* ── Icon list (bullet points using CSS, matching fa-solid fa-circle) ── */
  .icon-list {
    list-style: disc;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .icon-list li {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
  }

  /* ── For-everyone section ────────────────────────────────────── */
  .everyone-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ── Center image ────────────────────────────────────────────── */
  .center-img-wrap {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
    width: 100%;
  }

  .center-img {
    width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: block;
  }

  .center-img--wide {
    max-width: 840px;
  }

  .center-img--square {
    max-width: 500px;
  }

  /* ── Two-column layout (klachten & bedrijf) ──────────────────── */
  .two-col {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  @media (min-width: 768px) {
    .two-col--img-right {
      flex-direction: row;
    }

    .two-col--img-left {
      flex-direction: row;
    }
  }

  .two-col__img {
    flex: 0 0 auto;
    width: 100%;
    max-width: 450px;
    margin-inline: auto;
  }

  /* img-right: at tablet (768-1023) image LEFT, at desktop (1024+) image RIGHT */
  @media (min-width: 768px) {
    .two-col--img-right .two-col__img {
      width: 40%;
      margin-inline: 0;
      order: 1;
    }

    .two-col--img-right .two-col__text {
      order: 2;
    }

    .two-col--img-left .two-col__img {
      width: 40%;
      margin-inline: 0;
      order: 1;
    }

    .two-col--img-left .two-col__text {
      order: 2;
    }
  }

  /* img-right: at desktop (1024+) flip to text LEFT, image RIGHT */
  @media (min-width: 1024px) {
    .two-col--img-right .two-col__img {
      order: 2;
    }

    .two-col--img-right .two-col__text {
      order: 1;
    }
  }

  .two-col__img img {
    width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: block;
  }

  .two-col__text {
    flex: 1;
    min-width: 0;
  }

  .two-col__text .body-text {
    margin-bottom: 0.75rem;
  }

  /* ── Risicovoet extra text ───────────────────────────────────── */
  .risico-extra-text {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ── Risk classification title/intro ─────────────────────────── */
  /* h2 visually sized as subtitle to fit alongside the risk-level grid */
  :global(.risico-class-title) {
    font-size: var(--font-size-section-subtitle);
    margin: 2rem 0 1rem;
  }

  .risico-class-intro {
    margin-bottom: 2rem;
  }

  /* ── Risk level cards (matching OLD risk_level_card.py) ──────── */
  .risk-levels {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 1rem;
  }

  .risk-level-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    width: 100%;
    padding-inline: 0;
  }

  @media (min-width: 768px) {
    .risk-level-card {
      flex-direction: row;
      align-items: center;
      padding-inline: 1rem;
      gap: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .risk-level-card {
      padding-inline: 2rem;
    }
  }

  .risk-level-card__badge-wrap {
    flex-shrink: 0;
    width: 11.25rem;
    height: 11.25rem;
  }

  @media (max-width: 767px) {
    .risk-level-card__badge-wrap {
      display: flex;
      justify-content: center;
      width: 100%;
      height: auto;
    }
  }

  .risk-level-card__svg {
    display: block;
    width: 11.25rem;
    height: 11.25rem;
  }

  .risk-level-card__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-inline: 1rem;
  }

  @media (max-width: 767px) {
    .risk-level-card__body {
      text-align: center;
      padding-inline: 0;
    }
  }

  .risk-level-card__title {
    font-size: var(--font-size-h4);
    font-weight: 600;
    color: var(--color-text-heading);
  }

  .risk-level-card__desc {
    margin-bottom: 0;
  }

  /* ── Reimbursement aids ──────────────────────────────────────── */
  :global(.reimb-aids-title) {
    margin-bottom: 0.75rem;
  }

  .reimb-aids-text {
    margin-bottom: 0.5rem;
  }

  .reimb-aids-footnote {
    font-size: var(--font-size-regular);
    color: var(--color-text-muted);
  }
</style>

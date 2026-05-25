<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import { routeFor } from '$lib/i18n/route-map.js';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import Button from '$lib/components/Button.svelte';
  import Title from '$lib/components/Title.svelte';
  import HeroCTA from '$lib/components/sections/HeroCTA.svelte';
  import ImageTextSection from '$lib/components/sections/ImageTextSection.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import UserMd from '$lib/components/icons/UserMd.svelte';
  import ExclamationTriangle from '$lib/components/icons/ExclamationTriangle.svelte';
  import Money from '$lib/components/icons/Money.svelte';
  import HeartO from '$lib/components/icons/HeartO.svelte';
  import BuildingO from '$lib/components/icons/BuildingO.svelte';
  import Child from '$lib/components/icons/Child.svelte';

  interface Props {
    data: { lang: Lang };
  }

  let { data }: Props = $props();
  const lang = $derived(data.lang);

  const cards = $derived([
    {
      title: m.home_info_card1_title(),
      description: m.home_info_card1_desc(),
      button: m.home_info_card1_btn(),
      href: `${routeFor('information', lang)}#what-is-podiatry`,
      Icon: UserMd,
    },
    {
      title: m.home_info_card2_title(),
      description: m.home_info_card2_desc(),
      button: m.home_info_card2_btn(),
      href: `${routeFor('information', lang)}#veel-voorkomende-klachten`,
      Icon: ExclamationTriangle,
    },
    {
      title: m.home_info_card3_title(),
      description: m.home_info_card3_desc(),
      button: m.home_info_card3_btn(),
      href: routeFor('reimbursements', lang),
      Icon: Money,
    },
    {
      title: m.home_info_card4_title(),
      description: m.home_info_card4_desc(),
      button: m.home_info_card4_btn(),
      href: `${routeFor('information', lang)}#het-behandeltraject`,
      Icon: HeartO,
    },
    {
      title: m.home_info_card5_title(),
      description: m.home_info_card5_desc(),
      button: m.home_info_card5_btn(),
      href: `${routeFor('information', lang)}#bedrijfspodotherapie`,
      Icon: BuildingO,
    },
    {
      title: m.home_info_card6_title(),
      description: m.home_info_card6_desc(),
      button: m.home_info_card6_btn(),
      href: `${routeFor('information', lang)}#for-everyone`,
      Icon: Child,
    },
  ]);

  const orderInsolesHref = $derived(routeFor('order_insoles', lang));
</script>

<HeroBanner
  title={m.home_hero_title()}
  subtitle={m.home_hero_subtitle()}
  srcFallback="/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.jpg"
  srcAvif="/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.avif"
  srcWebp="/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.webp"
  imgAlt={m.home_hero_img_alt()}
  overlay="hero"
  clipBottom="gentle_1"
  dividerColor="white"
>
  {#snippet cta()}
    <HeroCTA
      {lang}
      title={m.home_cta_title()}
      items={[m.home_cta_item1(), m.home_cta_item2(), m.home_cta_item3()]}
    />
  {/snippet}
</HeroBanner>

<Section id="who-is-voorvoet">
  <Container>
    <ImageTextSection
      srcFallback="/images/page_home/podotherapeut_enschede_kim_bakhuis_van_voorvoet_praktijk_voor_podotherapie.jpg"
      srcAvif="/images/page_home/podotherapeut_enschede_kim_bakhuis_van_voorvoet_praktijk_voor_podotherapie.avif"
      srcWebp="/images/page_home/podotherapeut_enschede_kim_bakhuis_van_voorvoet_praktijk_voor_podotherapie.webp"
      imgAlt={m.home_who_img_alt()}
      width={533}
      height={800}
      title={m.home_who_title()}
      paragraphs={[m.home_who_p1(), m.home_who_p2()]}
      imagePosition="left"
    />
  </Container>
</Section>

<Section bg="green" clipTop="gentle_2" clipBottom="gentle_3" id="order-insoles">
  <Container>
    <ImageTextSection
      srcFallback="/images/page_home/podoloog_enschede_outdoor_schoenen_voorvoet_praktijk_voor_podotherapie.jpg"
      srcAvif="/images/page_home/podoloog_enschede_outdoor_schoenen_voorvoet_praktijk_voor_podotherapie.avif"
      srcWebp="/images/page_home/podoloog_enschede_outdoor_schoenen_voorvoet_praktijk_voor_podotherapie.webp"
      imgAlt={m.home_order_img_alt()}
      width={650}
      height={750}
      title={m.home_order_title()}
      paragraphs={[m.home_order_p1(), m.home_order_p2()]}
      imagePosition="right"
    />
    <div class="order-btn-wrap">
      <Button href={orderInsolesHref}>{m.home_order_btn()}</Button>
    </div>
  </Container>
</Section>

<Section id="introduction">
  <Container>
    <ImageTextSection
      srcFallback="/images/page_home/podotherapeut_enschede_kim_bakhuis_loopt_op_strand_voorvoet_praktijk_voor_podotherapie.jpg"
      srcAvif="/images/page_home/podotherapeut_enschede_kim_bakhuis_loopt_op_strand_voorvoet_praktijk_voor_podotherapie.avif"
      srcWebp="/images/page_home/podotherapeut_enschede_kim_bakhuis_loopt_op_strand_voorvoet_praktijk_voor_podotherapie.webp"
      imgAlt={m.home_intro_img_alt()}
      width={486}
      height={800}
      title={m.home_intro_title()}
      paragraphs={[m.home_intro_p1(), m.home_intro_p2()]}
      imagePosition="left"
    />
  </Container>
</Section>

<Section bg="green" clipTop="gentle_4" clipBottom="gentle_1" id="services">
  <Container>
    <div class="info-grid">
      {#each cards as card (card.title)}
        <div class="info-card">
          <div class="info-card__icon">
            <card.Icon size={72} />
          </div>
          <Title level={3}>{card.title}</Title>
          <p class="info-card__desc">{card.description}</p>
          <Button href={card.href} class="info-card__btn">{card.button}</Button>
        </div>
      {/each}
    </div>
  </Container>
</Section>

<Section id="locations">
  <Container>
    <Title level={2} class="locations__title">{m.home_locations_title()}</Title>
    <p class="locations__desc">{m.home_locations_desc()}</p>

    <!-- Location 1: map left, info right -->
    <div class="location-item">
      <div class="location-item__map">
        <iframe
          title={m.home_location1_map_alt()}
          src="https://www.google.com/maps?q=Eeftinksweg+13,+7541+WE+Enschede&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups"
          allowfullscreen
        ></iframe>
      </div>
      <div class="location-item__info">
        <Title level={3} class="location-item__title">{m.home_location1_title()}</Title>
        <p class="location-item__address">{m.home_location1_address()}</p>
        <p class="location-item__desc">{m.home_location1_desc()}</p>
        <div class="location-item__btn-wrap">
          <Button
            href="https://www.google.com/maps/dir//Eeftinksweg+13,+7541+WE+Enschede"
            target="_blank"
          >
            {m.home_location_route()}
          </Button>
        </div>
      </div>
    </div>

    <!-- Location 2: info left, map right (reversed) -->
    <div class="location-item location-item--reverse">
      <div class="location-item__map">
        <iframe
          title={m.home_location2_map_alt()}
          src="https://www.google.com/maps?q=Beethovenlaan+10,+7522+HJ+Enschede&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups"
          allowfullscreen
        ></iframe>
      </div>
      <div class="location-item__info">
        <Title level={3} class="location-item__title">{m.home_location2_title()}</Title>
        <p class="location-item__address">{m.home_location2_address()}</p>
        <p class="location-item__desc">{m.home_location2_desc()}</p>
        <div class="location-item__btn-wrap">
          <Button
            href="https://www.google.com/maps/dir//Beethovenlaan+10,+7522+HJ+Enschede"
            target="_blank"
          >
            {m.home_location_route()}
          </Button>
        </div>
      </div>
    </div>
  </Container>
</Section>

<style>
  .order-btn-wrap {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    justify-items: center;
  }

  @media (min-width: 640px) {
    .info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .info-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .info-card {
    background-color: transparent;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    max-width: 350px;
    width: 100%;
  }

  .info-card__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
    color: var(--color-text-heading);
  }

  .info-card__desc {
    font-size: var(--font-size-regular);
    line-height: 1.6;
    color: var(--color-text-heading);
    flex: 1;
    text-align: center;
  }

  .info-card :global(.info-card__btn) {
    /* Keyword-rich button text on cards 2 and 3 (audit P3-S1) is too long
       for the global Button's `white-space: nowrap` and was overflowing the
       350px card width. Override here: allow wrapping, cap at the card
       width, centre the (potentially two-line) label. */
    align-self: center;
    margin-top: auto;
    max-width: 100%;
    white-space: normal;
    text-align: center;
    line-height: 1.2;
    padding-block: 0.5rem;
  }

  :global(.locations__title) {
    margin-bottom: 2rem;
  }

  .locations__desc {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    margin-bottom: 0;
  }

  .location-item {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    margin-top: 3rem;
  }

  @media (min-width: 768px) {
    .location-item {
      flex-direction: row;
    }

    .location-item--reverse {
      flex-direction: row-reverse;
    }
  }

  .location-item__map {
    flex: 1;
    min-width: 0;
  }

  .location-item__map iframe {
    width: 100%;
    height: 400px;
    border: 0;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: block;
  }

  .location-item__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  @media (min-width: 768px) {
    .location-item__info {
      padding-inline: 2rem;
    }
  }

  :global(.location-item__title) {
    text-align: center;
  }

  @media (min-width: 768px) {
    :global(.location-item__title) {
      text-align: left;
    }
  }

  .location-item__address {
    font-size: var(--font-size-regular);
    font-weight: 600;
    color: var(--color-text-subheading);
    margin-bottom: 1rem;
    text-align: center;
  }

  @media (min-width: 768px) {
    .location-item__address {
      text-align: left;
    }
  }

  .location-item__desc {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  @media (min-width: 768px) {
    .location-item__desc {
      text-align: left;
    }
  }

  .location-item__btn-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
  }
</style>

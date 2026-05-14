<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
    title?: string;
  }
  let { size = 20, class: className = '', title }: Props = $props();
</script>

<!--
  Recreates FontAwesome 4.7 `money` (unicode F0D6). Path data lifted
  verbatim from FA 4.7's fontawesome-webfont.svg (horiz-adv-x="1920").
  Uses FA 4.7's canonical ascent of 1536 for consistency with the other
  info-card icons. The transform flips the font-coordinate Y-up into
  SVG's Y-down convention.
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1920 1792"
  width={size}
  height={size}
  fill="currentColor"
  aria-hidden={title ? undefined : true}
  role={title ? 'img' : undefined}
  class={className}
>
  {#if title}<title>{title}</title>{/if}
  <g transform="translate(0,1536) scale(1,-1)">
    <path
      d="M768 384h384v96h-128v448h-114l-148 -137l77 -80q42 37 55 57h2v-288h-128v-96zM1280 640q0 -70 -21 -142t-59.5 -134t-101.5 -101t-138 -39t-138 39t-101.5 101t-59.5 134t-21 142t21 142t59.5 134t101.5 101t138 39t138 -39t101.5 -101t59.5 -134t21 -142zM1792 384v512q-106 0 -181 75t-75 181h-1152q0 -106 -75 -181t-181 -75v-512q106 0 181 -75t75 -181h1152q0 106 75 181t181 75zM1920 1216v-1152q0 -26 -19 -45t-45 -19h-1792q-26 0 -45 19t-19 45v1152q0 26 19 45t45 19h1792q26 0 45 -19t19 -45z"
    />
  </g>
</svg>

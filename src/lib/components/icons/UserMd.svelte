<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
    title?: string;
  }
  let { size = 20, class: className = '', title }: Props = $props();
</script>

<!--
  Recreates FontAwesome 4.7 `user-md` (unicode F0F0). Path data lifted
  verbatim from FA 4.7's fontawesome-webfont.svg (horiz-adv-x="1408").
  Uses FA 4.7's canonical ascent of 1536 so glyphs that extend above
  y=1408 (e.g. warning_sign, building) are not clipped. The transform
  flips the font-coordinate Y-up into SVG's Y-down convention.
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1408 1792"
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
      d="M384 192q0 -26 -19 -45t-45 -19t-45 19t-19 45t19 45t45 19t45 -19t19 -45zM1408 131q0 -121 -73 -190t-194 -69h-874q-121 0 -194 69t-73 190q0 68 5.5 131t24 138t47.5 132.5t81 103t120 60.5q-22 -52 -22 -120v-203q-58 -20 -93 -70t-35 -111q0 -80 56 -136t136 -56t136 56t56 136q0 61 -35.5 111t-92.5 70v203q0 62 25 93q132 -104 295 -104t295 104q25 -31 25 -93v-64q-106 0 -181 -75t-75 -181v-89q-32 -29 -32 -71q0 -40 28 -68t68 -28t68 28t28 68q0 42 -32 71v89q0 52 38 90t90 38t90 -38t38 -90v-89q-32 -29 -32 -71q0 -40 28 -68t68 -28t68 28t28 68q0 42 -32 71v89q0 68 -34.5 127.5t-93.5 93.5q0 10 0.5 42.5t0 48t-2.5 41.5t-7 47t-13 40q68 -15 120 -60.5t81 -103t47.5 -132.5t24 -138t5.5 -131zM1088 1024q0 -159 -112.5 -271.5t-271.5 -112.5t-271.5 112.5t-112.5 271.5t112.5 271.5t271.5 112.5t271.5 -112.5t112.5 -271.5z"
    />
  </g>
</svg>

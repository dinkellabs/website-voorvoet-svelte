<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
    title?: string;
  }
  let { size = 20, class: className = '', title }: Props = $props();
</script>

<!--
  Recreates FontAwesome 4.7 `phone` (unicode F095). Path data lifted
  verbatim from FA 4.7's fontawesome-webfont.svg (horiz-adv-x="1408").
  Uses FA 4.7's canonical ascent of 1536. The transform flips the
  font-coordinate Y-up into SVG's Y-down convention.
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
      d="M1408 296q0 -27 -10 -70.5t-21 -68.5q-21 -50 -122 -106q-94 -51 -186 -51q-27 0 -53 3.5t-57.5 12.5t-47 14.5t-55.5 20.5t-49 18q-98 35 -175 83q-127 79 -264 216t-216 264q-48 77 -83 175q-3 9 -18 49t-20.5 55.5t-14.5 47t-12.5 57.5t-3.5 53q0 92 51 186q56 101 106 122q25 11 68.5 21t70.5 10q14 0 21 -3q18 -6 53 -76q11 -19 30 -54t35 -63.5t31 -53.5q3 -4 17.5 -25t21.5 -35.5t7 -28.5q0 -20 -28.5 -50t-62 -55t-62 -53t-28.5 -46q0 -9 5 -22.5t8.5 -20.5t14 -24t11.5 -19q76 -137 174 -235t235 -174q2 -1 19 -11.5t24 -14t20.5 -8.5t22.5 -5q18 0 46 28.5t53 62t55 62t50 28.5q14 0 28.5 -7t35.5 -21.5t25 -17.5q25 -15 53.5 -31t63.5 -35t54 -30q70 -35 76 -53q3 -7 3 -21z"
    />
  </g>
</svg>

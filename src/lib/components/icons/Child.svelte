<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
    title?: string;
  }
  let { size = 20, class: className = '', title }: Props = $props();
</script>

<!--
  Recreates FontAwesome 4.7 `child` (unicode F1AE). Path data lifted
  verbatim from FA 4.7's fontawesome-webfont.svg (horiz-adv-x="1280").
  Uses FA 4.7's canonical ascent of 1536 for consistency with the other
  info-card icons. The transform flips the font-coordinate Y-up into
  SVG's Y-down convention.
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1280 1792"
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
      d="M1188 988l-292 -292v-824q0 -46 -33 -79t-79 -33t-79 33t-33 79v384h-64v-384q0 -46 -33 -79t-79 -33t-79 33t-33 79v824l-292 292q-28 28 -28 68t28 68q29 28 68.5 28t67.5 -28l228 -228h368l228 228q28 28 68 28t68 -28q28 -29 28 -68.5t-28 -67.5zM864 1152q0 -93 -65.5 -158.5t-158.5 -65.5t-158.5 65.5t-65.5 158.5t65.5 158.5t158.5 65.5t158.5 -65.5t65.5 -158.5z"
    />
  </g>
</svg>

<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
    title?: string;
  }
  let { size = 20, class: className = '', title }: Props = $props();
</script>

<!--
  Recreates FontAwesome 4.7 `exclamation-triangle` (unicode F071). Path
  data lifted verbatim from FA 4.7's fontawesome-webfont.svg
  (horiz-adv-x="1792"). Uses FA 4.7's canonical ascent of 1536 so the
  triangle's apex at y=1469 is not clipped. The transform flips the
  font-coordinate Y-up into SVG's Y-down convention.
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1792 1792"
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
      d="M1024 161v190q0 14 -9.5 23.5t-22.5 9.5h-192q-13 0 -22.5 -9.5t-9.5 -23.5v-190q0 -14 9.5 -23.5t22.5 -9.5h192q13 0 22.5 9.5t9.5 23.5zM1022 535l18 459q0 12 -10 19q-13 11 -24 11h-220q-11 0 -24 -11q-10 -7 -10 -21l17 -457q0 -10 10 -16.5t24 -6.5h185q14 0 23.5 6.5t10.5 16.5zM1008 1469l768 -1408q35 -63 -2 -126q-17 -29 -46.5 -46t-63.5 -17h-1536q-34 0 -63.5 17t-46.5 46q-37 63 -2 126l768 1408q17 31 47 49t65 18t65 -18t47 -49z"
    />
  </g>
</svg>

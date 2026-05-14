<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
    title?: string;
  }
  let { size = 20, class: className = '', title }: Props = $props();
</script>

<!--
  Recreates FontAwesome 4.7 `envelope` (unicode F0E0). Path data lifted
  verbatim from FA 4.7's fontawesome-webfont.svg (horiz-adv-x="1792").
  Uses FA 4.7's canonical ascent of 1536. The transform flips the
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
      d="M1792 826v-794q0 -66 -47 -113t-113 -47h-1472q-66 0 -113 47t-47 113v794q44 -49 101 -87q362 -246 497 -345q57 -42 92.5 -65.5t94.5 -48t110 -24.5h1h1q51 0 110 24.5t94.5 48t92.5 65.5q170 123 498 345q57 39 100 87zM1792 1120q0 -79 -49 -151t-122 -123q-376 -261 -468 -325q-10 -7 -42.5 -30.5t-54 -38t-52 -32.5t-57.5 -27t-50 -9h-1h-1q-23 0 -50 9t-57.5 27t-52 32.5t-54 38t-42.5 30.5q-91 64 -262 182.5t-205 142.5q-62 42 -117 115.5t-55 136.5q0 78 41.5 130t118.5 52h1472q65 0 112.5 -47t47.5 -113z"
    />
  </g>
</svg>

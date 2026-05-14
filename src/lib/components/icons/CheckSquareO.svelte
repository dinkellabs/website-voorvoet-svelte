<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
    title?: string;
  }
  let { size = 20, class: className = '', title }: Props = $props();
</script>

<!--
  Recreates FontAwesome 4.7 `check-square-o` (unicode F046) — the icon OLD
  uses in the hero CTA list. Path data lifted verbatim from FA 4.7's
  fontawesome-webfont.svg (horiz-adv-x="1664", ascent 1408). The transform
  flips the font-coordinate Y-up into SVG's Y-down convention; viewBox
  width matches horiz-adv-x for accurate aspect ratio.
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1664 1792"
  width={size}
  height={size}
  fill="currentColor"
  aria-hidden={title ? undefined : true}
  role={title ? 'img' : undefined}
  class={className}
>
  {#if title}<title>{title}</title>{/if}
  <g transform="translate(0,1408) scale(1,-1)">
    <path
      d="M1408 606v-318q0 -119 -84.5 -203.5t-203.5 -84.5h-832q-119 0 -203.5 84.5t-84.5 203.5v832q0 119 84.5 203.5t203.5 84.5h832q63 0 117 -25q15 -7 18 -23q3 -17 -9 -29l-49 -49q-10 -10 -23 -10q-3 0 -9 2q-23 6 -45 6h-832q-66 0 -113 -47t-47 -113v-832q0 -66 47 -113t113 -47h832q66 0 113 47t47 113v254q0 13 9 22l64 64q10 10 23 10q6 0 12 -3q20 -8 20 -29zM1639 1095l-814 -814q-24 -24 -57 -24t-57 24l-430 430q-24 24 -24 57t24 57l110 110q24 24 57 24t57 -24l263 -263l647 647q24 24 57 24t57 -24l110 -110q24 -24 24 -57t-24 -57z"
    />
  </g>
</svg>

<script lang="ts">
  import type { Snippet } from "svelte";

  const TOOLTIP_DELAY = 300;

  type Props = {
    label: string;
    children: Snippet;
  };

  const { label, children }: Props = $props();
  const id = $props.id();
  const anchorId = `--${id}`;
  let tooltip = $state<HTMLDivElement | null>(null);

  let timeoutId: number | null = null;
  function onpointerenter() {
    timeoutId = setTimeout(() => {
      tooltip?.showPopover();
    }, TOOLTIP_DELAY);
  }
  function onpointerleave() {
    tooltip?.hidePopover();
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
  }
</script>

<div
  role="tooltip"
  class="wrapper"
  style={`--anchor-id: ${anchorId}`}
  {onpointerenter}
  {onpointerleave}
>
  {@render children()}
  <div bind:this={tooltip} class="tooltip" popover="hint">{label}</div>
</div>

<style>
  .wrapper {
    anchor-scope: --tooltip-anchor;
    anchor-name: --tooltip-anchor;
  }

  .tooltip {
    position: fixed;
    position-anchor: --tooltip-anchor;
    position-visibility: always;
    position-area: bottom;
    white-space: nowrap;
    width: max-content;
    background: var(--color-accent);
    padding: var(--spacing-sm);
    border-radius: var(--spacing-sm);
    margin: var(--spacing-sm);
    pointer-events: none;
    border: none;
  }
</style>

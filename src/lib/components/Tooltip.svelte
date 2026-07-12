<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    label: string;
    children: Snippet;
  };

  const { label, children }: Props = $props();
  const id = $props.id();
  const anchorId = `--${id}`;
</script>

<div class="wrapper" style={`--anchor-id: ${anchorId}`}>
  {@render children()}
  <div class="tooltip">{label}</div>
</div>

<style>
  .wrapper {
    anchor-name: var(--anchor-id);
  }

  .tooltip {
    position: fixed;
    position-anchor: var(--anchor-id);
    position-visibility: always;
    position-try-fallbacks: flip-block;
    position-area: bottom;
    white-space: nowrap;
    background: var(--color-accent);
    padding: var(--spacing-sm);
    border-radius: var(--spacing-sm);
    margin-block: var(--spacing-sm);
    z-index: 9999;
    animation: show forwards linear 300ms;
    pointer-events: none;

    .wrapper:not(:hover) & {
      display: none;
      opacity: 0;
    }
  }

  @keyframes show {
    0%,
    50% {
      opacity: 0;
      scale: 0.95;
    }
    100% {
      opacity: 1;
      scale: none;
    }
  }
</style>

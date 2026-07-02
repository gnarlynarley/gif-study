<script lang="ts">
  import type { Snippet } from 'svelte';

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
    white-space: nowrap;
    background: var(--color-accent);
    padding: var(--spacing-sm);
    border-radius: var(--spacing-sm);
    margin-block: var(--spacing-sm);
    z-index: 1;

    .wrapper:not(:hover) & {
      display: none;
    }
  }
</style>

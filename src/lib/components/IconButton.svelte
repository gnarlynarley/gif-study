<script lang="ts">
  import type { Snippet } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";

  type Props = {
    onclick?: MouseEventHandler<HTMLButtonElement>;
    active?: boolean;
    children: Snippet;
    label?: string;
  };

  const { onclick, active, children, label }: Props = $props();
</script>

<button
  class="button"
  class:is-active={active}
  type="button"
  {onclick}
  aria-label={label}
>
  {@render children()}
</button>

<style>
  .button {
    border: none;
    background: none;
    border-radius: 3px;
    line-height: 1;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-sm);

    :global(svg) {
      color: var(--color);
    }

    &.is-active {
      background: hsl(from currentColor h s l / 0.2);
    }

    &:hover {
      background: hsl(from currentColor h s l / 0.5);
    }
  }
</style>

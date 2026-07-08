<script lang="ts">
  import type { Snippet } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";

  type Props = {
    icon?: boolean;
    primary?: boolean;
    onclick?: MouseEventHandler<HTMLButtonElement>;
    active?: boolean;
    children: Snippet;
    label?: string;
  };

  const { primary, onclick, active, children, label, icon }: Props = $props();
</script>

<button
  class="button"
  class:is-icon={icon}
  class:is-active={active}
  class:is-primary={primary}
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
    border-radius: var(--spacing-sm);
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-accent);
    padding: var(--spacing-lg);
    cursor: pointer;
    width: 100%;

    &.is-icon {
      padding: var(--spacing-sm);
      background-color: transparent;
      aspect-ratio: 1 / 1;
      width: auto;
    }

    :global(svg) {
      color: var(--color);
    }

    &.is-active {
      background: hsl(from currentColor h s l / 0.2);
    }

    &.is-primary {
      background-color: var(--color-primary);
    }

    &:hover {
      background: hsl(from currentColor h s l / 0.5);
    }
  }
</style>

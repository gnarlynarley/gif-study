<script lang="ts">
  import type { Snippet } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = HTMLButtonAttributes & {
    icon?: boolean;
    primary?: boolean;
    active?: boolean;
    label?: string;
    inline?: boolean;
  };

  const { primary, active, children, label, icon, inline, ...rest }: Props =
    $props();
</script>

<button
  class="button"
  class:is-icon={icon}
  class:is-active={active}
  class:is-primary={primary}
  class:is-inline={inline}
  type="button"
  aria-label={label}
  {...rest}
>
  {@render children?.()}
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

    &:not(.is-inline) {
      width: 100%;
    }

    &.is-inline {
      display: inline-flex;
    }

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

<script lang="ts">
  import { ICON_SIZE, ICON_STROKE_WIDTH, SMALL_ICON_SIZE } from "$lib/consts";
  import type { LucideProps } from "@lucide/svelte";
  import type { Component } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Props = HTMLButtonAttributes & {
    icon?: boolean | Component<LucideProps>;
    smallIcon?: boolean;
    primary?: boolean;
    transparent?: boolean;
    active?: boolean;
    label?: string;
    inline?: boolean;
  };

  const {
    primary,
    transparent,
    active,
    children,
    label,
    icon,
    smallIcon,
    inline,
    ...rest
  }: Props = $props();
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
  {#if icon && typeof icon !== "boolean"}
    {@const Icon = icon}
    <Icon
      size={smallIcon ? SMALL_ICON_SIZE : ICON_SIZE}
      absoluteStrokeWidth
      strokeWidth={ICON_STROKE_WIDTH}
    />
  {:else}
    {@render children?.()}
  {/if}
</button>

<style>
  .button {
    --button-color: var(--color-accent);
    border: none;
    background: none;
    border-radius: var(--spacing-sm);
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--button-color);
    cursor: pointer;
    padding: var(--spacing-lg);
    line-height: 1;
    flex-grow: 0;
    flex-shrink: 0;

    &:not(.is-inline) {
      width: 100%;
    }

    &.is-inline {
      display: inline-flex;
    }

    &.is-icon {
      padding: var(--spacing-sm);
      background-color: transparent;
      width: auto;
    }

    :global(svg) {
      color: var(--color);
    }

    &.is-active {
      background: hsl(from currentColor h s l / 0.2);
    }

    &.is-primary {
      --button-color: var(--color-primary);
      color: var(--color-primary-text);
    }

    &:hover {
      background: color-mix(in oklch, var(--button-color), var(--color-text));
    }

    :global(svg) {
      display: block;
    }
  }
</style>

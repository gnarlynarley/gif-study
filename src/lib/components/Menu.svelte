<script lang="ts">
  import { createContext, type Snippet } from "svelte";
  import Button from "./Button.svelte";
  import { MenuIcon } from "@lucide/svelte";
  import { setMenuId } from "./Menu.context";
  import { ICON_STROKE_WIDTH, SMALL_ICON_SIZE } from "$lib/consts";

  type Props = {
    children: Snippet;
  };

  const { children }: Props = $props();
  const id = $props.id();
  setMenuId(id);
</script>

<div class="wrapper">
  <div class="icon">
    <Button icon popovertarget={id} popovertargetaction="toggle">
      <MenuIcon
        size={SMALL_ICON_SIZE}
        absoluteStrokeWidth
        strokeWidth={ICON_STROKE_WIDTH}
      />
    </Button>
  </div>

  <div popover="hint" {id} class="menu">
    <div class="stack">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .wrapper {
    --menu-spacing: var(--spacing);
    anchor-scope: --menu-anchor;
  }

  .icon {
    anchor-name: --menu-anchor;
    border-radius: var(--spacing-sm);

    .wrapper:has(.menu:popover-open) & {
      background-color: hsl(from currentColor h s l / 0.2);
    }
  }

  .menu {
    --stack-spacing: var(--spacing-sm);
    position-anchor: --menu-anchor;
    position-area: top span-left;
    position-try-fallbacks:
      top span-left,
      bottom span-left,
      top span-right,
      bottom span-right;
    position: fixed;
    width: min-content;
    white-space: nowrap;
    overflow: hidden;
    border: none;
    margin-block: var(--spacing);
    background: var(--color-accent);
    padding: var(--menu-spacing);
    border-radius: var(--spacing);

    &::backdrop {
      background-color: hsl(from var(--color-background) h s l / 0.5);
    }
  }
</style>

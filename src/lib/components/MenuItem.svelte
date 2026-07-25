<script lang="ts">
  import type { Component } from "svelte";
  import { getMenuId } from "./Menu.context";

  type Props = {
    icon: Component<{ size?: number; absoluteStrokeWidth?: boolean }>;
    label: string;
    onClick: () => void;
  };

  const { icon: Icon, label, onClick }: Props = $props();
  const id = getMenuId();
</script>

<button
  popovertarget={id}
  popovertargetaction="hide"
  type="button"
  onclick={onClick}
>
  <Icon size={16} absoluteStrokeWidth />
  <span>{label}</span>
</button>

<style>
  button {
    display: flex;
    align-items: center;
    gap: var(--spacing);
    padding: var(--spacing);
    margin-inline: calc(var(--menu-spacing) * -1);

    &:first-child {
      margin-top: calc(var(--menu-spacing) * -1);
    }

    &:last-child {
      margin-bottom: calc(var(--menu-spacing) * -1);
    }

    &:hover {
      background-color: hsl(from currentColor h s l / 0.3);
    }
  }
</style>

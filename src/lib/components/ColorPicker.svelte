<script lang="ts">
  import { ICON_SIZE } from "$lib/consts";
  import Button from "./Button.svelte";
  import Tooltip from "./Tooltip.svelte";
  import AwesomeColorPicker, {
    ChromeVariant,
  } from "svelte-awesome-color-picker";

  type Props = {
    color: string;
  };

  let { color = $bindable() }: Props = $props();
  const id = $props.id();
</script>

<div class="wrapper" style:--size={ICON_SIZE}>
  <div class="anchor">
    <Tooltip label={`Toggle color picker`}>
      <Button
        icon
        label="Toggle colorpicker"
        popovertarget={id}
        popovertargetaction="toggle"
      >
        <div
          class="color-swatch"
          style:--size={`${ICON_SIZE}px`}
          style:--color={color}
        ></div>
      </Button>
    </Tooltip>
  </div>

  <div class="picker" popover="auto" {id}>
    <AwesomeColorPicker
      bind:hex={color}
      components={ChromeVariant}
      sliderDirection="horizontal"
      isDialog={false}
      isAlpha={false}
      isTextInput={false}
    />
  </div>
</div>

<style>
  .wrapper {
    anchor-scope: --picker-anchor;
  }

  .anchor {
    anchor-name: --picker-anchor;
  }

  .color-swatch {
    background-color: var(--color);
    display: block;
    aspect-ratio: 1 / 1;
    width: var(--size);
    border-radius: 4px;
  }

  .picker {
    --cp-bg-color: var(--color-accent);
    position-anchor: --picker-anchor;
    position-area: center bottom;
    position-try-fallbacks: center top;
    background-color: var(--color-accent);
    padding: var(--spacing);
    border-radius: 12px;
    margin: var(--spacing);
    border: none;
    box-shadow: var(--shadow);

    :global(> span > div) {
      margin: 0;
    }
  }
</style>

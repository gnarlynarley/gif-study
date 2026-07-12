<script lang="ts">
  import { unloadGif } from "$lib/stores/gif.svelte";
  import type { SketchTool } from "$lib/types.svelte";
  import clamp from "$lib/utils/clamp";
  import {
    BrushIcon,
    EraserIcon,
    PlayIcon,
    PauseIcon,
    DoorOpenIcon,
    BlendIcon,
  } from "@lucide/svelte";
  import Tooltip from "./Tooltip.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import normalizeKey from "$lib/utils/normalizeKey";
  import Button from "./Button.svelte";

  type Props = {
    playing: boolean;
    tool: SketchTool;
    opacity: number;
    brushSize: number;
    eraserSize: number;
    colorPickerActive: boolean;
    color: string;
    unionSkinActive: boolean;
  };

  const MAX_BRUSH_SIZE = 50;
  const MIN_BRUSH_SIZE = 1;
  const BRUSH_SIZE_STEPS = 0.5;
  const MAX_ERASER_SIZE = 500;
  const MIN_ERASER_SIZE = 1;
  const ERASER_SIZE_STEPS = 0.5;

  let {
    playing = $bindable(),
    tool = $bindable(),
    opacity = $bindable(),
    brushSize = $bindable(),
    eraserSize = $bindable(),
    colorPickerActive = $bindable(),
    unionSkinActive = $bindable(),
    color,
  }: Props = $props();

  function togglePlaying() {
    playing = !playing;
  }

  function adjustBrushSize(amount: 1 | -1) {
    if (tool === "brush") {
      brushSize = clamp(MIN_BRUSH_SIZE, MAX_BRUSH_SIZE, brushSize + amount * 5);
    } else {
      eraserSize = clamp(
        MIN_ERASER_SIZE,
        MAX_ERASER_SIZE,
        eraserSize + amount * 5,
      );
    }
  }

  function onkeydown(ev: KeyboardEvent) {
    switch (normalizeKey(ev.key)) {
      case $settings.keybinds.togglePlaying: {
        togglePlaying();
        break;
      }
      case $settings.keybinds.brush: {
        tool = "brush";
        break;
      }
      case $settings.keybinds.eraser: {
        tool = "eraser";
        break;
      }
      case $settings.keybinds.increaseBrushSize: {
        adjustBrushSize(1);
        break;
      }
      case $settings.keybinds.decreaseBrushSize: {
        adjustBrushSize(-1);
        break;
      }
    }
  }
</script>

<svelte:window {onkeydown} />

<div class="wrapper">
  <Tooltip
    label={`${playing ? "Pause" : "Play"} (${$settings.keybinds.togglePlaying})`}
  >
    <Button icon onclick={togglePlaying}>
      {#if playing}
        <PauseIcon />
      {:else}
        <PlayIcon />
      {/if}
    </Button>
  </Tooltip>

  <div class="divider"></div>

  <Tooltip label={`Brush tool (${$settings.keybinds.brush})`}>
    <Button
      icon
      active={tool === "brush"}
      onclick={() => {
        tool = "brush";
      }}
    >
      <BrushIcon />
    </Button>
  </Tooltip>

  <Tooltip label={`Eraser tool (${$settings.keybinds.eraser})`}>
    <Button
      icon
      active={tool === "eraser"}
      onclick={() => {
        tool = "eraser";
      }}
    >
      <EraserIcon />
    </Button>
  </Tooltip>

  <Tooltip label={`Toggle color picker`}>
    <Button
      icon
      active={colorPickerActive}
      onclick={() => {
        colorPickerActive = !colorPickerActive;
      }}
      label="Toggle colorpicker"
    >
      <div class="color-swatch" style:--color={color}></div>
    </Button>
  </Tooltip>

  {#if tool === "brush"}
    <Tooltip label="Brush size">
      <input
        type="range"
        bind:value={brushSize}
        min={MIN_BRUSH_SIZE}
        max={MAX_BRUSH_SIZE}
        step={BRUSH_SIZE_STEPS}
      />
    </Tooltip>
  {:else}
    <Tooltip label="Brush size">
      <input
        type="range"
        bind:value={eraserSize}
        min={MIN_ERASER_SIZE}
        max={MAX_ERASER_SIZE}
        step={ERASER_SIZE_STEPS}
      />
    </Tooltip>
  {/if}
  <div class="divider"></div>

  <Tooltip label="Opacity">
    <input type="range" bind:value={opacity} min="0" max="1" step="0.01" />
  </Tooltip>

  <div class="divider"></div>

  <Tooltip label="Toggle union skin">
    <Button
      icon
      active={unionSkinActive}
      onclick={() => {
        unionSkinActive = !unionSkinActive;
      }}
    >
      <BlendIcon />
    </Button>
  </Tooltip>

  <div class="divider"></div>

  <Tooltip label="Exit">
    <Button
      icon
      onclick={() => {
        const clear = window.confirm("Do you want to exit?");
        if (clear) {
          unloadGif();
        }
      }}
    >
      <DoorOpenIcon />
    </Button>
  </Tooltip>
</div>

<style>
  .wrapper {
    display: grid;
    background: hsl(from var(--color-accent) h s l / 0.8);
    padding: var(--spacing);
    gap: var(--spacing);
    justify-items: center;
    border-radius: 3px;
    backdrop-filter: blur(8px);
    box-shadow: 1px 2px 8px hsl(from black h s l / 0.1);
  }

  .color-swatch {
    background-color: var(--color);
    display: block;
    aspect-ratio: 1 / 1;
    width: 24px;
    border-radius: 2px;
  }

  .divider {
    width: 80%;
    height: 4px;
    background: currentColor;
    border-radius: 100vw;
    opacity: 0.2;
  }

  input[type="range"] {
    writing-mode: vertical-lr;
    direction: rtl;
    vertical-align: middle;
  }
</style>

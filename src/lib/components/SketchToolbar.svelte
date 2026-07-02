<script lang="ts">
  import { unloadGif } from '$lib/stores/gif.svelte';
  import type { SketchTool } from '$lib/types';
  import clamp from '$lib/utils/clamp';
  import {
    BrushIcon,
    EraserIcon,
    PlayIcon,
    PauseIcon,
    FileIcon,
    DoorOpenIcon,
  } from '@lucide/svelte';

  type Props = {
    playing: boolean;
    tool: SketchTool;
    opacity: number;
    brushSize: number;
    eraserSize: number;
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
  }: Props = $props();

  function togglePlaying() {
    playing = !playing;
  }

  function onkeydown(ev: KeyboardEvent) {
    switch (ev.key.toLowerCase()) {
      case ' ': {
        togglePlaying();
        break;
      }
      case 'b': {
        tool = 'brush';
        break;
      }
      case 'e': {
        tool = 'eraser';
        break;
      }
    }
  }
</script>

<svelte:window {onkeydown} />

<div class="wrapper">
  <button class="button" type="button" onclick={togglePlaying}>
    {#if playing}
      <PauseIcon />
    {:else}
      <PlayIcon />
    {/if}
  </button>
  <div class="divider"></div>
  <button
    class="button"
    class:is-active={tool === 'brush'}
    type="button"
    onclick={() => {
      tool = 'brush';
    }}
  >
    <BrushIcon />
  </button>
  <button
    class="button"
    class:is-active={tool === 'eraser'}
    type="button"
    onclick={() => {
      tool = 'eraser';
    }}
  >
    <EraserIcon />
  </button>
  {#if tool === 'brush'}
    <input
      type="range"
      bind:value={brushSize}
      min={MIN_BRUSH_SIZE}
      max={MAX_BRUSH_SIZE}
      step={BRUSH_SIZE_STEPS}
    />
  {:else}
    <input
      type="range"
      bind:value={eraserSize}
      min={MIN_ERASER_SIZE}
      max={MAX_ERASER_SIZE}
      step={ERASER_SIZE_STEPS}
    />
  {/if}
  <div class="divider"></div>

  <input type="range" bind:value={opacity} min="0" max="1" step="0.01" />

  <div class="divider"></div>

  <button
    class="button"
    type="button"
    onclick={() => {
      const clear = window.confirm('Do you want to exit?');
      if (clear) {
        unloadGif();
      }
    }}
  >
    <DoorOpenIcon />
  </button>
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

    &.is-active {
      background: hsl(from currentColor h s l / 0.2);
    }

    &:hover {
      background: hsl(from currentColor h s l / 0.5);
    }
  }

  .divider {
    width: 80%;
    height: 4px;
    background: currentColor;
    border-radius: 100vw;
    opacity: 0.2;
  }

  input[type='range'] {
    writing-mode: vertical-lr;
    direction: rtl;
    vertical-align: middle;
  }
</style>

<script lang="ts">
  import { gif } from '$lib/stores/gif.svelte';
  import type { SketchTool } from '$lib/types';
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
    <input type="range" bind:value={brushSize} min="1" max="50" step="0.5" />
  {:else}
    <input type="range" bind:value={eraserSize} min="1" max="500" step="0.5" />
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
        gif.clear();
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

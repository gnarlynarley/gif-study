<script lang="ts">
  import type { SketchTool } from '$lib/types';
  import { BrushIcon, EraserIcon, PlayIcon, PauseIcon } from '@lucide/svelte';

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
    <input type="range" bind:value={brushSize} min="1" max="20" step="0.5" />
  {:else}
    <input type="range" bind:value={eraserSize} min="1" max="200" step="0.5" />
  {/if}
  <div class="divider"></div>

  <input type="range" bind:value={opacity} min="0" max="1" step="0.01" />
</div>

<style>
  .wrapper {
    display: grid;
    background: var(--color-accent);
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
    justify-items: center;
    border-radius: 3px;
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

    &.is-active {
      background: hsl(from white h s l / 0.5);
    }

    &:hover {
      background: hsl(from white h s l / 0.8);
    }
  }

  .divider {
    width: 80%;
    height: 8px;
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

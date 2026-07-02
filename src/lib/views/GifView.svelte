<script lang="ts">
  import GifTimeline from '$lib/components/GifTimeline.svelte';
  import SketchCanvas from '$lib/components/SketchCanvas.svelte';
  import SketchToolbar from '$lib/components/SketchToolbar.svelte';
  import modulo from '$lib/utils/modulo';
  import type { ParsedGif, SketchTool } from '../types';

  type Props = {
    gif: ParsedGif;
  };

  const { gif = $bindable() }: Props = $props();

  const { width, height } = $derived(gif);
  let playing = $state(true);
  let currentIndex = $state(0);
  let currentFrame = $derived(gif.frames[currentIndex]);

  let frameCanvas = $state<HTMLCanvasElement | null>(null);
  const frameContext = $derived(frameCanvas?.getContext('2d') ?? null);
  let backgroundCanvas = $state<HTMLCanvasElement | null>(null);
  const backgroundContext = $derived(
    backgroundCanvas?.getContext('2d') ?? null,
  );

  let brushSize = $state(3);
  let eraserSize = $state(20);
  let opacity = $state(1);
  let tool = $state<SketchTool>('brush');

  $effect(() => {
    if (!playing) return;

    const id = setTimeout(() => {
      currentIndex = (currentIndex + 1) % gif.frames.length;
    }, currentFrame.delay);

    return () => {
      clearTimeout(id);
    };
  });

  $effect(() => {
    if (backgroundContext) {
      backgroundContext.fillStyle = 'white';
      backgroundContext.fillRect(0, 0, width, height);
    }
  });

  $effect(() => {
    if (frameContext) {
      frameContext.clearRect(0, 0, width, height);
      frameContext.drawImage(currentFrame.canvas, 0, 0);
    }
  });

  function onkeydown(ev: KeyboardEvent) {
    const framesLength = gif.frames.length;
    switch (ev.key.toLowerCase()) {
      case 'a': {
        currentIndex = modulo(currentIndex - 1, framesLength);
        break;
      }
      case 'd': {
        currentIndex = modulo(currentIndex + 1, framesLength);
        break;
      }
    }
  }
</script>

<svelte:window {onkeydown} />

<div class="wrapper">
  <div class="toolbar">
    <SketchToolbar
      bind:playing
      bind:opacity
      bind:tool
      bind:brushSize
      bind:eraserSize
    />
  </div>
  <div class="render">
    <canvas bind:this={backgroundCanvas} {width} {height}></canvas>
    <canvas
      class="frameCanvas"
      bind:this={frameCanvas}
      {width}
      {height}
      style={`opacity:${opacity};`}
    ></canvas>
    <SketchCanvas
      {brushSize}
      {eraserSize}
      {tool}
      frame={currentFrame}
      bind:playing
    />
  </div>
  <div class="timeline">
    <GifTimeline frames={gif.frames} bind:currentIndex />
  </div>
</div>

<style>
  .wrapper {
    min-height: 100dvh;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  .toolbar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: var(--spacing);
  }

  .render {
    position: relative;

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
</style>

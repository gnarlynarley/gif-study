<script lang="ts">
  import GifTimeline from '$lib/components/GifTimeline.svelte';
  import SketchCanvas from '$lib/components/SketchCanvas.svelte';
  import SketchToolbar from '$lib/components/SketchToolbar.svelte';
  import createBrushImage from '$lib/utils/createBrushImage';
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

  let brushSize = $state(3);
  let eraserSize = $state(20);
  let opacity = $state(0.8);
  let tool = $state<SketchTool>('brush');
  const brushImage = $derived(
    createBrushImage(tool === 'brush' ? brushSize : eraserSize),
  );

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
    if (frameContext) {
      frameContext.fillStyle = 'white';
      frameContext.fillRect(0, 0, width, height);
      frameContext.drawImage(currentFrame.canvas, 0, 0);
    }
  });

  $inspect(brushImage);
</script>

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

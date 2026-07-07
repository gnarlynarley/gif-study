<script lang="ts">
  import type { GifEntryFrame } from '$lib/types';
  type Props = {
    frame: GifEntryFrame;
  };

  const { frame }: Props = $props();
  const { width, height } = $derived(frame);

  let canvas = $state<HTMLCanvasElement | null>(null);
  const context = $derived(canvas?.getContext('2d') ?? null);

  $effect(() => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    context.drawImage(frame.canvas, 0, 0);
  });
</script>

<canvas bind:this={canvas} {width} {height}></canvas>

<style>
  canvas {
    object-fit: cover;
  }
</style>

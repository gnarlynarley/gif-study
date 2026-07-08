<script lang="ts">
  import type { GifEntry } from "$lib/types.svelte";
  import modulo from "$lib/utils/modulo";

  type Props = {
    gif: GifEntry;
    currentIndex: number;
  };

  let { gif, currentIndex }: Props = $props();
  const { width, height } = $derived(gif);
  const frames = $derived(gif.trimmedFrames);
  const framesIndex = $derived(
    frames.findIndex((i) => i.index === currentIndex),
  );

  let prev = $state<HTMLCanvasElement | null>(null);
  const prevContext = $derived(prev?.getContext("2d") ?? null);

  let next = $state<HTMLCanvasElement | null>(null);
  const nextContext = $derived(next?.getContext("2d") ?? null);

  $effect(() => {
    if (!prevContext || !nextContext) return;
    const half = (frames.length - 1) / 2;
    function render(
      context: CanvasRenderingContext2D,
      color: string,
      amount: number,
      offset: number,
    ) {
      context.save();
      context.clearRect(0, 0, width, height);
      for (let i = 1; i <= amount; i++) {
        const frame = frames[modulo(framesIndex + i * offset, frames.length)];
        if (!frame.sketch) continue;
        context.globalAlpha = 1 - (1 / (amount + 1)) * i;
        context.drawImage(frame.sketch.canvas, 0, 0);
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-in";
      context.fillStyle = color;
      context.fillRect(0, 0, width, height);
      context.restore();
    }

    render(prevContext, "blue", Math.floor(half), -1);
    render(nextContext, "orange", Math.ceil(half), 1);
  });
</script>

<div class="wrapper">
  <canvas bind:this={prev} {width} {height}></canvas>
  <canvas bind:this={next} {width} {height}></canvas>
</div>

<style>
  .wrapper {
    mix-blend-mode: multiply;
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
  }
</style>

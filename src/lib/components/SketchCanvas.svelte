<script lang="ts">
  import type { ParsedGifFrame, Point, SketchTool } from '$lib/types';

  type Props = {
    frame: ParsedGifFrame;
    playing: boolean;
    brushSize: number;
    eraserSize: number;
    tool: SketchTool;
  };

  let {
    frame,
    playing = $bindable(),
    brushSize,
    eraserSize,
    tool,
  }: Props = $props();

  const { width, height, sketchCanvas } = $derived(frame);
  let canvas = $state<HTMLCanvasElement | null>(null);
  const context = $derived(canvas?.getContext('2d') ?? null);
  let cursorCanvas = $state<HTMLCanvasElement | null>(null);
  const cursorContext = $derived(cursorCanvas?.getContext('2d') ?? null);
  const toolSize = $derived(tool === 'brush' ? brushSize : eraserSize);

  $effect(() => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    context.drawImage(sketchCanvas, 0, 0);
  });

  const getPoint = (ev: PointerEvent, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();

    const scale = Math.min(
      rect.width / canvas.width,
      rect.height / canvas.height,
    );
    const offsetX = (rect.width - canvas.width * scale) / 2;
    const offsetY = (rect.height - canvas.height * scale) / 2;

    const x = (ev.clientX - rect.left - offsetX) / scale;
    const y = (ev.clientY - rect.top - offsetY) / scale;

    return { x, y, scale };
  };

  const drawPoint = (
    point: Point,
    context: CanvasRenderingContext2D,
    effectiveBrushSize: number,
    color: string,
  ) => {
    context.fillStyle = color;
    context.beginPath();
    context.arc(point.x, point.y, effectiveBrushSize / 2, 0, Math.PI * 2);
    context.fill();
  };

  let pointerActive = false;
  let lastPoint: Point | null = null;

  const onpointerdown = (ev: PointerEvent) => {
    if (!canvas) return;
    if (!context) return;
    pointerActive = true;
    playing = false;

    lastPoint = getPoint(ev, canvas);
    const effectiveBrushSize = toolSize / lastPoint.scale;

    drawPoint(
      lastPoint,
      context,
      effectiveBrushSize,
      tool == 'brush' ? 'black' : 'white',
    );
  };
  const onpointerup = () => {
    pointerActive = false;
    lastPoint = null;
  };

  const onpointermove = (ev: PointerEvent) => {
    if (!canvas) return;

    const point = getPoint(ev, canvas);
    const effectiveBrushSize = toolSize / point.scale;

    if (cursorContext) {
      cursorContext.fillStyle = 'black';
      cursorContext.fillRect(0, 0, width, height);
      cursorContext.clearRect(1, 1, width - 2, height - 2);
      cursorContext.fillStyle = tool === 'brush' ? 'black' : 'white';
      cursorContext.beginPath();
      cursorContext.arc(
        point.x,
        point.y,
        effectiveBrushSize / 2,
        0,
        Math.PI * 2,
      );
      cursorContext.fill();
      cursorContext.lineWidth = 2;
      cursorContext.stroke();
    }

    if (!pointerActive) return;
    if (!canvas) return;
    if (!context) return;

    context.save();

    playing = false;
    const color = tool === 'brush' ? 'black' : 'white';

    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    }

    if (lastPoint) {
      drawPoint(lastPoint, context, effectiveBrushSize, color);

      context.strokeStyle = color;
      context.lineWidth = effectiveBrushSize;
      context.beginPath();
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    }

    drawPoint(point, context, effectiveBrushSize, color);

    lastPoint = point;

    frame.sketchContext.clearRect(0, 0, width, height);
    frame.sketchContext.drawImage(canvas, 0, 0);

    context.restore();
  };
</script>

<div
  class="wrapper"
  {onpointerdown}
  {onpointerup}
  {onpointermove}
  role="application"
>
  <canvas bind:this={canvas} {width} {height}></canvas>
  <canvas class="cursorCanvas" bind:this={cursorCanvas} {width} {height}>
  </canvas>
</div>

<style>
  .wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    mix-blend-mode: multiply;
    cursor: crosshair;
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .cursorCanvas {
    opacity: 0.8;
  }

  .wrapper:not(:hover) .cursorCanvas {
    display: none;
  }
</style>

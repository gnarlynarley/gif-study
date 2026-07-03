<script lang="ts">
  import type {
    ParsedGifFrame,
    Point,
    PointerEvent,
    SketchTool,
  } from "$lib/types";
  import createCanvas from "$lib/utils/createCanvas";

  type Props = {
    frame: ParsedGifFrame;
    currentIndex: number;
    playing: boolean;
    panningKeyActive: boolean;
    brushSize: number;
    eraserSize: number;
    tool: SketchTool;
    color: string;
  };

  let {
    frame = $bindable(),
    currentIndex = $bindable(),
    playing = $bindable(),
    panningKeyActive,
    brushSize,
    eraserSize,
    tool,
    color,
  }: Props = $props();

  const { width, height } = $derived(frame);
  let canvas = $state<HTMLCanvasElement | null>(null);
  const context = $derived(canvas?.getContext("2d") ?? null);

  let cursorCanvas = $state<HTMLCanvasElement | null>(null);
  const cursorContext = $derived(cursorCanvas?.getContext("2d") ?? null);

  const toolSize = $derived(tool === "brush" ? brushSize : eraserSize);
  let pointerActive = false;
  let lastPoint: Point | null = null;
  let cursorPoint = $state<Point | null>(null);
  let history: { index: number; canvas: HTMLCanvasElement }[] = $state([]);

  function undo() {
    if (!context) return;
    const item = history.pop();
    history = history;
    if (item !== undefined) {
      currentIndex = item.index;
      context.clearRect(0, 0, width, height);
      context.drawImage(item.canvas, 0, 0);
      updateSketchCanvas();
    }
  }

  $inspect(history);

  $effect(() => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    if (frame.sketch) {
      context.drawImage(frame.sketch.canvas, 0, 0);
    }
  });

  const getPoint = (ev: Point, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();

    const scale = Math.min(
      rect.width / canvas.width,
      rect.height / canvas.height,
    );
    const offsetX = (rect.width - canvas.width * scale) / 2;
    const offsetY = (rect.height - canvas.height * scale) / 2;

    const x = (ev.x - rect.left - offsetX) / scale;
    const y = (ev.y - rect.top - offsetY) / scale;

    return { x, y, scale };
  };

  const drawPoint = (
    point: Point,
    context: CanvasRenderingContext2D,
    effectiveBrushSize: number,
  ) => {
    context.save();
    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
    }
    context.fillStyle = color;
    context.beginPath();
    context.arc(point.x, point.y, effectiveBrushSize / 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  const renderCursor = () => {
    if (!(cursorContext && cursorCanvas && cursorPoint)) return;
    const point = getPoint(cursorPoint, cursorCanvas);
    const effectiveBrushSize = toolSize / point.scale;

    cursorContext.save();
    cursorContext.fillStyle = "black";
    cursorContext.fillRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    cursorContext.clearRect(
      1,
      1,
      cursorCanvas.width - 2,
      cursorCanvas.height - 2,
    );

    cursorContext.beginPath();
    cursorContext.arc(point.x, point.y, effectiveBrushSize / 2, 0, Math.PI * 2);
    if (tool === "brush") {
      cursorContext.fillStyle = color;
      cursorContext.fill();
    }
    cursorContext.strokeStyle = "black";
    cursorContext.lineWidth = 2;
    cursorContext.stroke();
    cursorContext.restore();
  };

  $effect(() => {
    let id = requestAnimationFrame(function queue() {
      renderCursor();
      id = requestAnimationFrame(queue);
    });

    return () => {
      cancelAnimationFrame(id);
    };
  });

  const updateSketchCanvas = () => {
    if (!canvas) return;
    if (!frame.sketch) {
      const [canvas, context] = createCanvas(width, height);
      frame.sketch = { canvas, context };
    }
    frame.sketch.context.clearRect(0, 0, width, height);
    frame.sketch.context.drawImage(canvas, 0, 0);
  };

  const onpointerdown = (ev: PointerEvent) => {
    if (!canvas) return;
    if (!context) return;
    if (panningKeyActive) return;

    const [historyCanvas, historyContext] = createCanvas(
      canvas.width,
      canvas.height,
    );
    history.push({ index: currentIndex, canvas: historyCanvas });
    historyContext.drawImage(canvas, 0, 0);
    history = history.slice(-50);

    pointerActive = true;
    playing = false;

    cursorPoint = { x: ev.clientX, y: ev.clientY, scale: 1 };
    lastPoint = getPoint(cursorPoint, canvas);
    const effectiveBrushSize = toolSize / lastPoint.scale;

    drawPoint(lastPoint, context, effectiveBrushSize);
    updateSketchCanvas();
  };

  const onpointerup = () => {
    pointerActive = false;
    lastPoint = null;
  };

  const onpointermove = (ev: PointerEvent) => {
    cursorPoint = { x: ev.clientX, y: ev.clientY, scale: 1 };

    if (!canvas) return;

    const sketchPoint = getPoint(cursorPoint, canvas);
    const effectiveBrushSize = toolSize / sketchPoint.scale;

    if (!pointerActive) return;
    if (!canvas) return;
    if (!context) return;
    if (panningKeyActive) return;

    playing = false;

    context.save();

    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
    }

    if (lastPoint) {
      drawPoint(lastPoint, context, effectiveBrushSize);

      context.strokeStyle = color;
      context.lineWidth = effectiveBrushSize;
      context.beginPath();
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(sketchPoint.x, sketchPoint.y);
      context.stroke();
    }

    drawPoint(sketchPoint, context, effectiveBrushSize);

    context.restore();

    lastPoint = sketchPoint;
    updateSketchCanvas();
  };

  const onkeydown = (ev: KeyboardEvent) => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key === "z") {
      ev.preventDefault();
      undo();
    }
  };
</script>

<svelte:window {onkeydown} />

<div
  class="wrapper"
  {onpointerdown}
  {onpointerup}
  {onpointermove}
  role="application"
>
  <canvas bind:this={canvas} {width} {height}></canvas>
  <canvas
    class="cursorCanvas"
    bind:this={cursorCanvas}
    width={width * 2}
    height={height * 2}
  >
  </canvas>
</div>

<style>
  .wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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

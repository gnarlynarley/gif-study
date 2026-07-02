<script lang="ts">
  import GifTimeline from "$lib/components/GifTimeline.svelte";
  import SketchCanvas from "$lib/components/SketchCanvas.svelte";
  import SketchToolbar from "$lib/components/SketchToolbar.svelte";
  import UnionSkinCanvas from "$lib/components/UnionSkinCanvas.svelte";
  import { settings } from "$lib/stores/settings.svelte";
  import clamp from "$lib/utils/clamp";
  import exportFrames from "$lib/utils/exportFrames";
  import modulo from "$lib/utils/modulo";
  import normalizeKey from "$lib/utils/normalizeKey";
  import styleString from "$lib/utils/styleString";
  import { type Point, type ParsedGif, type SketchTool } from "../types";
  import ColorPicker, { ChromeVariant } from "svelte-awesome-color-picker";

  type Props = {
    gif: ParsedGif;
  };

  const { gif = $bindable() }: Props = $props();

  const { width, height } = $derived(gif);
  let playing = $state(true);
  let currentIndex = $state(0);
  let currentFrame = $derived(gif.frames[currentIndex]);
  let mainContainer = $state<HTMLDivElement | null>(null);

  let frameCanvas = $state<HTMLCanvasElement | null>(null);
  const frameContext = $derived(frameCanvas?.getContext("2d") ?? null);
  let backgroundCanvas = $state<HTMLCanvasElement | null>(null);
  const backgroundContext = $derived(
    backgroundCanvas?.getContext("2d") ?? null,
  );

  let brushSize = $state(3);
  let eraserSize = $state(20);
  let tool = $state<SketchTool>("brush");
  let color = $state("#000000");
  let colorPickerActive = $state(false);
  let unionSkinActive = $state(true);
  let panningKeyActive = $state(false);
  let pointerActive = $state(false);
  let panningActive = $derived(panningKeyActive && pointerActive);
  let navigation = $state<Point>({ x: 0, y: 0, scale: 1 });

  $effect(() => {
    if (!mainContainer) return;
    navigation.x = (width - mainContainer.clientWidth) * -0.5;
    navigation.y = (height - mainContainer.clientHeight) * -0.5;
  });

  $effect(() => {
    if (!playing) return;

    let rafId: number;
    let lastTime = performance.now();
    let accumulated = 0;

    const tick = (now: number) => {
      accumulated += now - lastTime;
      lastTime = now;

      // Handle delay=0 frames (some GIFs use this) and drift correction
      // by advancing multiple frames in one tick if we've fallen behind
      while (accumulated >= (gif.frames[currentIndex]?.delay || 100)) {
        accumulated -= gif.frames[currentIndex].delay || 100;
        currentIndex = (currentIndex + 1) % gif.frames.length;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  });

  $effect(() => {
    if (backgroundContext) {
      backgroundContext.fillStyle = "white";
      backgroundContext.fillRect(0, 0, width, height);
    }
  });

  $effect(() => {
    if (frameContext) {
      frameContext.clearRect(0, 0, width, height);
      frameContext.drawImage(currentFrame.canvas, 0, 0);
    }
  });

  function onExportFramesClick() {
    exportFrames(gif);
  }

  const DEFAULT_POINT: Point = { x: 0, y: 0, scale: 1 };

  let initialNavigation: Point = { ...DEFAULT_POINT };
  let initial: Point = { ...DEFAULT_POINT };

  function onkeydown(ev: KeyboardEvent) {
    const framesLength = gif.frames.length;
    switch (normalizeKey(ev.key)) {
      case $settings.keybinds.prevFrame: {
        currentIndex = modulo(currentIndex - 1, framesLength);
        break;
      }
      case $settings.keybinds.nextFrame: {
        currentIndex = modulo(currentIndex + 1, framesLength);
        break;
      }
      case $settings.keybinds.panning: {
        if (!panningKeyActive) {
          panningKeyActive = true;
        }
      }
    }
  }

  function onkeyup(ev: KeyboardEvent) {
    switch (normalizeKey(ev.key)) {
      case $settings.keybinds.panning: {
        panningKeyActive = false;
      }
    }
  }

  function onpointerdown() {
    pointerActive = true;
  }

  function onpointerup() {
    pointerActive = false;
  }

  function onpointermove(ev: PointerEvent) {
    if (panningActive) {
      const y = initial.y - ev.clientY;
      navigation.y = initialNavigation.y - y;
      const x = initial.x - ev.clientX;
      navigation.x = initialNavigation.x - x;
    } else {
      initial.x = ev.clientX;
      initial.y = ev.clientY;
      initial.scale = 1;
      initialNavigation = $state.snapshot(navigation);
    }
  }

  function onwheel(ev: WheelEvent) {
    ev.preventDefault();
    navigation.scale = clamp(0.1, 10, navigation.scale + ev.deltaY * -0.001);
  }
</script>

<svelte:window {onkeydown} {onkeyup} />

<div class="wrapper">
  <div class="toolbar">
    <SketchToolbar
      bind:playing
      bind:opacity={gif.opacity}
      bind:tool
      bind:brushSize
      bind:eraserSize
      bind:colorPickerActive
      bind:unionSkinActive
      {color}
      {onExportFramesClick}
    />
  </div>
  <div
    class="main"
    role="application"
    {onpointermove}
    {onwheel}
    {onpointerdown}
    {onpointerup}
    bind:this={mainContainer}
  >
    <div
      class="render"
      style={styleString({
        "--x": navigation.x,
        "--y": navigation.y,
        "--scale": navigation.scale,
      })}
    >
      <!-- <canvas bind:this={backgroundCanvas} {width} {height}></canvas> -->

      <canvas
        class="frameCanvas"
        bind:this={frameCanvas}
        {width}
        {height}
        style={`opacity:${gif.opacity};`}
      ></canvas>

      <SketchCanvas
        {brushSize}
        {eraserSize}
        {tool}
        {panningKeyActive}
        frame={currentFrame}
        {color}
        bind:playing
      />

      {#if unionSkinActive}
        <UnionSkinCanvas {gif} {currentIndex} />
      {/if}
    </div>
    {#if colorPickerActive}
      <div class="color">
        <ColorPicker
          bind:hex={color}
          components={ChromeVariant}
          sliderDirection="horizontal"
          isDialog={false}
          isAlpha={false}
          isTextInput={false}
        />
      </div>
    {/if}
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

  .color {
    --cp-bg-color: var(--color-accent);
    position: absolute;
    bottom: var(--spacing);
    right: var(--spacing);
    background-color: hsl(from var(--color-accent) h s l / 0.8);
    padding: var(--spacing);
    border-radius: 12px;

    :global(> span > div) {
      margin: 0;
    }
  }

  .main {
    position: relative;
    overflow: hidden;
    width: 100%;
  }

  .render {
    position: absolute;
    background-color: white;
    translate: calc(var(--x) * 1px) calc(var(--y) * 1px);
    scale: var(--scale);
    /* transform-origin: top left; */
  }
</style>

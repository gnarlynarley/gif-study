<script lang="ts">
  import type { GifEntry, GifEntryFrame } from "$lib/types.svelte";
  import GifFrameCanvas from "./GifFrameCanvas.svelte";
  import Button from "./Button.svelte";
  import {
    ArrowLeftToLineIcon,
    ArrowRightToLineIcon,
    MergeIcon,
  } from "@lucide/svelte";
  import { TIMELINE_FRAME_HEIGHT } from "$lib/consts";

  type Props = {
    gif: GifEntry;
    frame: GifEntryFrame;
    currentIndex: number;
    selectFrames: boolean;
  };

  let {
    gif = $bindable(),
    frame,
    currentIndex = $bindable(),
    selectFrames,
  }: Props = $props();
  let isActive = $derived(currentIndex === frame.index);
  let element = $state<HTMLElement | null>(null);
  let isWithinTrim = $derived(gif.isWithinTrim(frame));
  let isMerged = $derived(gif.isMerge(frame));
  const isStartFrame = $derived(gif.isStartFrame(frame));
  const isEndFrame = $derived(gif.isEndFrame(frame));
  const zoom = $derived(TIMELINE_FRAME_HEIGHT / gif.height);

  $effect(() => {
    if (!isActive) return;
    if (!element) return;
    if (selectFrames) return;
    element.scrollIntoView({
      behavior: "instant",
      inline: "nearest",
      block: "nearest",
    });
  });
</script>

<div
  bind:this={element}
  class="wrapper"
  class:is-active={isActive}
  class:is-merged={isMerged}
  style:--height={TIMELINE_FRAME_HEIGHT}
  style:--canvas-zoom={zoom}
  style:--delay={frame.delay}
>
  {#if selectFrames}
    <div class="trim" class:is-within-trim={isWithinTrim}>
      <Button
        icon={ArrowLeftToLineIcon}
        smallIcon
        active={isStartFrame}
        onclick={() => {
          gif.setStartFrame(frame);
        }}
      />
      {#if !isStartFrame && isWithinTrim}
        <Button
          icon={MergeIcon}
          smallIcon
          active={gif.isMerge(frame)}
          onclick={() => {
            gif.toggleSkipFrame(frame);
          }}
        />
      {/if}
      <Button
        icon={ArrowRightToLineIcon}
        smallIcon
        active={isEndFrame}
        onclick={() => {
          gif.setEndFrame(frame);
        }}
      />
    </div>
  {/if}
  <button
    class="image"
    type="button"
    onclick={(ev) => {
      ev.currentTarget.blur();
      currentIndex = frame.index;
    }}
  >
    <GifFrameCanvas {frame} />
    <p class="delay">{frame.delay.toFixed(2)}</p>
    <p class="index">{frame.index + 1}</p>
  </button>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: calc(var(--height) * 1px);
    min-width: calc(var(--delay) * 0.05em);

    &.is-merged {
      opacity: 0.5;
    }

    &.is-active {
      background-color: var(--color-primary);
    }
  }

  .trim {
    --border-top: 3px;
    display: flex;
    justify-content: space-between;
    background-color: hsl(from var(--color-accent) h s l / 0.5);
    padding: var(--spacing-sm);
    padding-top: calc(var(--spacing-sm) - var(--border-top));
    border-top: transparent var(--border-top) solid;
    gap: var(--spacing-sm);

    &.is-within-trim {
      border-color: var(--color-primary);
    }
  }

  .image {
    flex-shrink: 0;
    position: relative;
    background: transparent;
    border: 1px solid transparent;
    flex-grow: 1;
    width: 100%;
    overflow: hidden;

    :global(canvas) {
      position: absolute;
      top: 50%;
      left: 50%;
      /* transform-origin: top left; */
      translate: -50% -50%;
      scale: var(--canvas-zoom) var(--canvas-zoom);
    }

    &::after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--color-primary);
      mix-blend-mode: overlay;
      opacity: 0;
    }

    .is-active & {
      border-color: var(--color-primary);

      &::after {
        opacity: 1;
      }
    }
  }

  .index,
  .delay {
    position: absolute;
    z-index: 1;
    font-size: 0.5em;
    line-height: 1;
    display: inline-block;
    padding: var(--spacing-sm);
    background: var(--color-background);
  }

  .delay {
    top: 0;
    right: 0;
  }

  .index {
    bottom: 0;
    left: 0;
  }
</style>

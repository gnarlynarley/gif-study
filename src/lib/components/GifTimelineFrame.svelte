<script lang="ts">
  import type { GifEntry, GifEntryFrame } from "$lib/types.svelte";
  import GifFrameCanvas from "./GifFrameCanvas.svelte";
  import Button from "./Button.svelte";
  import {
    ArrowLeftToLineIcon,
    ArrowRightToLineIcon,
    MergeIcon,
  } from "@lucide/svelte";

  type Props = {
    gif: GifEntry;
    frame: GifEntryFrame;
    playing: boolean;
    currentIndex: number;
    selectFrames: boolean;
  };

  let {
    gif = $bindable(),
    frame,
    currentIndex = $bindable(),
    selectFrames,
    playing,
  }: Props = $props();
  let isActive = $derived(currentIndex === frame.index);
  let element = $state<HTMLElement | null>(null);
  let isWithinTrim = $derived(gif.isWithinTrim(frame));
  let isMerged = $derived(gif.isMerge(frame));
  const isStartFrame = $derived(gif.isStartFrame(frame));
  const isEndFrame = $derived(gif.isEndFrame(frame));

  $effect(() => {
    if (!isActive) return;
    if (!element) return;
    if (!playing) return;
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
>
  {#if selectFrames}
    <div class="trim" class:is-within-trim={isWithinTrim}>
      <Button
        icon={ArrowLeftToLineIcon}
        active={isStartFrame}
        onclick={() => {
          gif.setStartFrame(frame);
        }}
      />
      {#if !isStartFrame && isWithinTrim}
        <Button
          icon
          active={gif.isMerge(frame)}
          onclick={() => {
            gif.toggleSkipFrame(frame);
          }}
        >
          <MergeIcon size="16" absoluteStrokeWidth />
        </Button>
      {/if}
      <Button
        icon
        active={isEndFrame}
        onclick={() => {
          gif.setEndFrame(frame);
        }}
      >
        <ArrowRightToLineIcon size="16" absoluteStrokeWidth />
      </Button>
    </div>
  {/if}
  <button
    class="image"
    type="button"
    onclick={(ev) => {
      ev.currentTarget.blur();
      currentIndex = frame.index;
    }}
    style:--delay={frame.delay}
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
    height: 5em;

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
    min-width: calc(var(--delay) * 0.05em);
    flex-shrink: 0;
    position: relative;
    background: transparent;
    border: 1px solid transparent;
    flex-grow: 1;
    width: 100%;

    :global(canvas) {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
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

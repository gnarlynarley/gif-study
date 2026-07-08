<script lang="ts">
  import type { GifEntry, GifEntryFrame } from "$lib/types.svelte";
  import GifFrameCanvas from "./GifFrameCanvas.svelte";
  import Button from "./Button.svelte";
  import { ArrowLeftToLineIcon, ArrowRightToLineIcon } from "@lucide/svelte";

  type Props = {
    gif: GifEntry;
    frame: GifEntryFrame;
    playing: boolean;
    showFrames: boolean;
    currentIndex: number;
    selectFrames: boolean;
  };

  let {
    gif = $bindable(),
    frame,
    currentIndex = $bindable(),
    selectFrames,
    playing,
    showFrames,
  }: Props = $props();
  let isActive = $derived(currentIndex === frame.index);
  let element = $state<HTMLElement | null>(null);
  const isTrim = $derived(gif.trimmedFrames.includes(frame));

  $effect(() => {
    if (!isActive) return;
    if (!element) return;
    if (!playing) return;
    if (showFrames) return;
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
  class:is-trim={isTrim}
>
  {#if selectFrames}
    <div class="trim">
      <Button
        icon
        onclick={() => {
          gif.frameStartIndex = frame.index;
        }}
      >
        <ArrowLeftToLineIcon size="16" absoluteStrokeWidth />
      </Button>
      <Button
        icon
        onclick={() => {
          gif.frameEndIndex = frame.index;
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
    <p class="delay">{frame.delay}</p>
    <p class="index">{frame.index + 1}</p>
  </button>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    height: 5em;
  }

  .trim {
    display: flex;
    justify-content: space-between;

    .is-trim & {
      background: hsl(from var(--color-primary) h s l / 0.3);
    }
  }

  .image {
    width: calc(var(--delay) * 0.05em);
    flex-shrink: 0;
    position: relative;
    background: transparent;
    border: 1px solid transparent;
    flex-grow: 1;

    :global(canvas) {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .is-active & {
      border-color: var(--color-primary);

      &::after {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--color-primary);
        mix-blend-mode: screen;
        opacity: 0.5;
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

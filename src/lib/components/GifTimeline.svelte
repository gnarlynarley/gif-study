<script lang="ts">
  import type { ParsedGifFrame } from "$lib/types";
  import GifFrameCanvas from "./GifFrameCanvas.svelte";

  type Props = {
    frames: ParsedGifFrame[];
    currentIndex: number;
  };

  let { frames, currentIndex = $bindable() }: Props = $props();
  let framesWrapper = $state<HTMLDivElement | null>(null);
  let frameNodes = $derived(framesWrapper?.querySelectorAll(".frame"));

  $effect(() => {
    if (!frameNodes) return;
    const element = frameNodes[currentIndex];
    if (!element) return;
    element.scrollIntoView({ behavior: "instant", inline: "nearest" });
  });
</script>

<div class="wrapper">
  <div class="frames" bind:this={framesWrapper}>
    {#each frames as frame, index}
      <button
        class="frame"
        class:is-active={index === currentIndex}
        type="button"
        onclick={(ev) => {
          ev.currentTarget.blur();
          currentIndex = index;
        }}
      >
        <GifFrameCanvas {frame} />
        <p class="delay">{frame.delay}</p>
        <p class="index">{index}</p>
      </button>
    {/each}
  </div>
</div>

<style>
  .wrapper {
    width: 100dvw;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: hsl(from var(--color-text) h s l / 0.5)
      var(--color-background);
    background-color: var(--color-accent);
    display: flex;
  }
  .frames {
    display: inline-flex;
    flex-shrink: 0;
    margin-inline: auto;
  }

  .frame {
    width: 5em;
    height: 5em;
    flex-shrink: 0;
    position: relative;
    border: 1px solid transparent;
    background: transparent;

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

    :global(canvas) {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    &.is-active {
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
      }
    }
  }
</style>

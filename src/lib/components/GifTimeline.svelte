<script lang="ts">
  import type { GifEntryFrame } from "$lib/types";
  import GifFrameCanvas from "./GifFrameCanvas.svelte";

  type Props = {
    frames: GifEntryFrame[];
    currentIndex: number;
  };

  let { frames, currentIndex = $bindable() }: Props = $props();
  let framesWrapper = $state<HTMLDivElement | null>(null);
  let frameNodes = $derived(framesWrapper?.querySelectorAll(".frame"));

  $effect(() => {
    if (!frameNodes) return;
    const element = frameNodes[currentIndex];
    if (!element) return;
    element.scrollIntoView({
      behavior: "instant",
      inline: "center",
      block: "center",
    });
  });
</script>

<div class="wrapper">
  <div class="frames" bind:this={framesWrapper}>
    {#each frames as frame}
      <button
        class="frame"
        class:is-active={frame.index === currentIndex}
        type="button"
        onclick={(ev) => {
          ev.currentTarget.blur();
          currentIndex = frame.index;
        }}
        style={`--delay: ${frame.delay}`}
      >
        <GifFrameCanvas {frame} />
        <p class="delay">{frame.delay}</p>
        <p class="index">{frame.index + 1}</p>
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
    background-color: var(--color-background);
    border-top: 1px solid var(--color-accent);
    display: flex;
  }
  .frames {
    display: inline-flex;
    flex-shrink: 0;
    margin-inline: auto;
    padding: var(--spacing) 0;
  }

  .frame {
    width: calc(var(--delay) * 0.05em);
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

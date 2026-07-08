<script lang="ts">
  import type { GifEntry } from "$lib/types.svelte";
  import GifTimelineFrame from "./GifTimelineFrame.svelte";
  import Button from "./Button.svelte";
  import {
    ChevronsLeftRightEllipsisIcon,
    ChevronUpIcon,
    ChevronDownIcon,
  } from "@lucide/svelte";

  type Props = {
    gif: GifEntry;
    currentIndex: number;
    playing: boolean;
  };

  let {
    gif = $bindable(),
    currentIndex = $bindable(),
    playing,
  }: Props = $props();
  let selectFrames = $state(false);
  let showFrames = $state(true);
  const frames = $derived(selectFrames ? gif.frames : gif.trimmedFrames);
</script>

<div class="wrapper">
  <div class="options">
    {#if showFrames}
      <Button
        icon
        active={selectFrames}
        onclick={() => {
          selectFrames = !selectFrames;
        }}
      >
        <ChevronsLeftRightEllipsisIcon size={16} absoluteStrokeWidth />
      </Button>
      <Button
        icon
        active={selectFrames}
        onclick={() => {
          showFrames = false;
        }}
      >
        <ChevronDownIcon size={16} absoluteStrokeWidth />
      </Button>
    {:else}
      <Button
        icon
        onclick={() => {
          showFrames = true;
        }}
      >
        <ChevronUpIcon size={16} absoluteStrokeWidth />
      </Button>
    {/if}
  </div>
  {#if showFrames}
    <div class="frames">
      <div class="frames-inner">
        {#each frames as frame}
          <GifTimelineFrame
            bind:gif
            {frame}
            {playing}
            bind:currentIndex
            {selectFrames}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
    width: 100dvw;
  }

  .options {
    position: absolute;
    bottom: 100%;
    right: 0;
    background: hsl(from var(--color-accent) h s l / 0.6);
    padding: var(--spacing);
    border-top-left-radius: var(--spacing);
    display: flex;
    gap: var(--spacing-sm);
  }

  .frames {
    width: 100dvw;
    overflow: auto;
    scrollbar-color: hsl(from var(--color-text) h s l / 0.5)
      var(--color-background);
    background-color: var(--color-background);
    border-top: 1px solid var(--color-accent);
    display: flex;
  }

  .frames-inner {
    display: inline-flex;
    flex-shrink: 0;
    margin-inline: auto;
    padding: var(--spacing) 0;
  }
</style>

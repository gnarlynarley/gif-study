<script lang="ts">
  import Button from "./Button.svelte";

  type Props = {
    file: File;
    start: number;
    end: number;
  };

  let { file, start = $bindable(), end = $bindable() }: Props = $props();
  const src = $derived(URL.createObjectURL(file));
  let video = $state<HTMLVideoElement | null>(null);

  $effect(() => {
    if (!video) return;
    const ac = new AbortController();

    video.addEventListener(
      "loadedmetadata",
      (ev) => {
        const duration = video?.duration;
        if (duration !== undefined) end = duration;
      },
      { signal: ac.signal },
    );

    return () => ac.abort();
  });

  $effect(() => {
    const srcToRevoke = $state.snapshot(src);
    return () => URL.revokeObjectURL(srcToRevoke);
  });

  function setTrims(startValue: number, endValue: number) {
    start = Math.min(startValue, endValue);
    end = Math.max(startValue, endValue);
  }
</script>

<video bind:this={video} controls {src} muted></video>
<div class="buttons">
  <Button
    onclick={() => {
      if (video !== null) {
        setTrims(video.currentTime, end);
      }
    }}
  >
    Trim start: {start}
  </Button>
  <Button
    onclick={() => {
      if (video !== null) {
        setTrims(start, video.currentTime);
      }
    }}
  >
    Trim end: {end}
  </Button>
</div>

<style>
  .buttons {
    display: flex;
    gap: var(--spacing);
  }
</style>

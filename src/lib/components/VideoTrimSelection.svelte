<script lang="ts">
  import Button from "./Button.svelte";
  import VideoPlayer from "./VideoPlayer.svelte";

  type Props = {
    file: File;
    start: number;
    end: number;
  };

  let { file, start = $bindable(), end = $bindable() }: Props = $props();
  const src = $derived(URL.createObjectURL(file));
  let videoElement = $state<HTMLVideoElement | null>(null);

  $effect(() => {
    if (!videoElement) return;
    const ac = new AbortController();

    videoElement.addEventListener(
      "loadedmetadata",
      (ev) => {
        const duration = videoElement?.duration;
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

<div class="wrapper">
  <VideoPlayer bind:videoElement {src} bind:start bind:end />
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
  }
</style>

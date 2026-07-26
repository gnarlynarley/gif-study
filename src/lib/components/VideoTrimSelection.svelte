<script lang="ts">
  import VideoPlayer from "./VideoPlayer.svelte";

  type Props = {
    file: File;
    start: number;
    end: number;
    duration: number;
  };

  let {
    file,
    start = $bindable(),
    end = $bindable(),
    duration = $bindable(),
  }: Props = $props();
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
</script>

<div class="wrapper">
  <VideoPlayer bind:videoElement {src} bind:start bind:end bind:duration />
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
    /* flex-grow: 1; */
  }
</style>

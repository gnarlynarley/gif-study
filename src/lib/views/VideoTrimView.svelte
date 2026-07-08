<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import VideoTrimSelection from "$lib/components/VideoTrimSelection.svelte";
  import { loadGifFromFile } from "$lib/stores/gif.svelte";

  type Props = {
    file: File;
  };
  const { file }: Props = $props();
  let start = $state(0);
  let end = $state(0);
</script>

<div class="wrapper">
  <VideoTrimSelection {file} bind:start bind:end />
  <Button
    primary
    onclick={() => {
      loadGifFromFile(file, start, end);
    }}>Trim video</Button
  >
</div>

<style>
  .wrapper {
    display: grid;
    gap: var(--spacing);
  }
</style>

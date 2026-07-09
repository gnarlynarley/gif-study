<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import VideoTrimSelection from "$lib/components/VideoTrimSelection.svelte";
  import { loadGifFromFile } from "$lib/stores/gif.svelte";
  import parseTime from "$lib/utils/parseTime";

  type Props = {
    file: File;
  };
  const { file }: Props = $props();
  let start = $state(0);
  let end = $state(0);
  let trimmedDuration = $derived(end - start);
  let warn = $derived(trimmedDuration > 10);

  $inspect(start);
</script>

<div class="wrapper">
  <VideoTrimSelection {file} bind:start bind:end />
  {#if warn}
    <p class="warning">
      Warning: Video might take a while to trim with a duration of {parseTime(
        trimmedDuration,
      )}.
    </p>
  {/if}
  <Button
    primary
    onclick={() => {
      loadGifFromFile(file, start, end);
    }}
  >
    Open trimmed video
  </Button>
</div>

<style>
  .wrapper {
    display: grid;
    gap: var(--spacing);
    min-height: 100dvh;
    display: grid;
    grid-template-rows: 1fr auto;
    width: 100%;
    padding: var(--spacing);
  }

  .warning {
    background-color: var(--color-error);
    padding: var(--spacing);
    border-radius: var(--spacing);
    text-align: center;
  }
</style>

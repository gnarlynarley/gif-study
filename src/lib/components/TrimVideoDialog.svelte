<script lang="ts">
  import VideoTrimSelection from "$lib/components/VideoTrimSelection.svelte";
  import { loadGifFromFile } from "$lib/stores/gif.svelte";
  import parseTime from "$lib/utils/parseTime";
  import Dialog from "./Dialog.svelte";

  type Props = {
    file: File;
    onClose: () => void;
  };
  const { file = $bindable(), onClose }: Props = $props();
  let start = $state(0);
  let end = $state(0);
  let duration = $state(0);
  let trimmedDuration = $derived(end - start);
  let submitLabel = $derived.by(() => {
    let label = `Trim ${parseTime(trimmedDuration)}`;

    if (duration === trimmedDuration) {
      label += " (full)";
    }

    return label;
  });
</script>

<Dialog
  wide
  open
  onSubmit={() => {
    loadGifFromFile(file, start, end);
  }}
  {submitLabel}
  {onClose}
>
  <div class="wrapper">
    <VideoTrimSelection {file} bind:start bind:end bind:duration />
  </div>
</Dialog>

<style>
  .wrapper {
    display: grid;
    gap: var(--spacing);
    display: grid;
    grid-template-rows: 1fr auto;
    width: 100%;
    padding: var(--spacing);
    flex-grow: 1;
  }
</style>

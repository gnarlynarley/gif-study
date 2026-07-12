<script lang="ts">
  import type { GifEntry } from "$lib/types.svelte";
  import createGifFile from "$lib/utils/createGifFile";

  type Props = {
    gif: GifEntry;
    onClose: () => void;
  };

  const { gif, onClose }: Props = $props();
  let dialogElement: HTMLDialogElement;
  const f = $derived(createGifFile(gif));
  const src = $derived(URL.createObjectURL(f));

  $effect(() => {
    const toDispose = $state.snapshot(src);

    return () => {
      URL.revokeObjectURL(toDispose);
    };
  });

  $effect(() => {
    dialogElement.showModal();
  });
</script>

<dialog
  bind:this={dialogElement}
  onclose={() => {
    onClose();
  }}
>
  <h1>show dialog</h1>
  <div class="preview">
    <img {src} alt="" />
  </div>
</dialog>

<style>
  dialog {
    margin: auto;
    padding: var(--spacing);
    display: grid;
    grid-template-rows: auto 1fr;
    height: calc(100% - var(--spacing) * 2);
    width: calc(100% - var(--spacing) * 2);
  }

  .preview {
    position: relative;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  dialog::backdrop {
    background: var(--color-accent);
  }
</style>

<script lang="ts">
  import Dialog from "./Dialog.svelte";

  type Props = {
    message: string;
    progress: number;
    onClose: () => void;
    obSubmit?: () => void;
  };

  const { message, progress, onClose }: Props = $props();
  let dialog = $state<HTMLDivElement | null>(null);
  const id = $props.id();

  $effect(() => {
    dialog?.showPopover();

    return () => {
      dialog?.hidePopover();
    };
  });
</script>

<svelte:window
  onkeydown={(ev) => {
    if (ev.key.toLowerCase() === "escape") {
      dialog?.hidePopover();
    }
  }}
/>

<Dialog {onClose} open>
  <h1>{message}</h1>
  <div class="bar" style:--progress={progress}></div>
  <p>{progress.toFixed(2)}</p>
</Dialog>

<style>
  .bar {
    position: relative;
    height: var(--spacing);
    background-color: var(--color-accent);

    &::after {
      content: "";
      display: block;
      width: calc(var(--progress) * 100%);
      height: 100%;
      background: currentColor;
    }
  }
</style>

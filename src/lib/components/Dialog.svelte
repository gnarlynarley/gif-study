<script lang="ts">
  import type { Snippet } from "svelte";
  import Button from "./Button.svelte";

  type Props = {
    dialog?: HTMLDialogElement | null;
    open?: boolean;
    closeLabel?: string;
    submitLabel?: string;
    onClose?: () => void;
    onSubmit?: () => void;
    children: Snippet;
  };

  let {
    dialog = $bindable(),
    open,
    closeLabel = "Close",
    submitLabel = "Submit",
    onClose,
    onSubmit,
    children,
  }: Props = $props();
  const id = $props.id();

  $effect(() => {
    if (!open) return;
    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  });
</script>

<svelte:window
  onkeydown={(ev) => {
    if (ev.key.toLowerCase() === "escape") {
      dialog?.close();
    }
  }}
/>

<dialog
  {id}
  class="modal stack"
  bind:this={dialog}
  onbeforetoggle={(ev) => {
    if (ev.newState === "closed") onClose?.();
  }}
>
  {@render children()}

  <div class="buttons">
    <Button inline commandfor={id} command="close">{closeLabel}</Button>
    {#if onSubmit}
      <Button inline commandfor={id} command="close" onclick={onSubmit} primary>
        {submitLabel}
      </Button>
    {/if}
  </div>
</dialog>

<style>
  .modal {
    margin: auto;
    border: none;
    padding: var(--spacing-lg);
    border-radius: var(--spacing);
    width: 100%;
    max-width: 30em;

    &::backdrop {
      background: hsl(from var(--color-background) h s l / 0.9);
      backdrop-filter: blur(10px);
    }
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing);
    margin-inline: calc(var(--spacing-lg) * -1);
    margin-block-end: calc(var(--spacing-lg) * -1);
    padding: var(--spacing);
    background-color: var(--color-accent);
  }
</style>

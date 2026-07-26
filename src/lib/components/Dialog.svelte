<script lang="ts">
  import type { Snippet } from "svelte";
  import Button from "./Button.svelte";

  type Props = {
    dialog?: HTMLDialogElement | null;
    closeLabel?: string;
    submitLabel?: string;
    onSubmit?: () => void;
    children: Snippet;
    wide?: boolean;
  } & (
    | {
        open?: false;
        onClose?: () => void;
      }
    | {
        open: true;
        onClose: () => void;
      }
  );

  let {
    dialog = $bindable(),
    open,
    closeLabel = "Close",
    submitLabel = "Submit",
    onClose,
    onSubmit,
    children,
    wide,
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
  class="modal"
  class:is-wide={wide}
  bind:this={dialog}
  onbeforetoggle={(ev) => {
    if (ev.newState === "closed") onClose?.();
  }}
>
  <div class="children">
    {@render children()}
  </div>

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
    --modal-padding: var(--spacing-lg);
    position: relative;
    margin: auto;
    border: none;
    padding-bottom: 0;
    border-radius: var(--spacing);
    width: 100%;
    background-color: var(--color-foreground);

    &:not(.is-wide) {
      max-width: 30em;
    }

    &.is-wide {
      height: 100%;
    }

    &::backdrop {
      background: hsl(from var(--color-background) h s l / 0.9);
      backdrop-filter: blur(10px);
    }

    &:open {
      display: grid;
      grid-template-rows: 1fr auto;
    }
  }

  .children {
    padding: var(--modal-padding);
    display: flex;
    flex-direction: column;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing);
    background-color: var(--color-accent);
  }
</style>
